import argparse
import shlex
import re
import ast

from playhouse.apsw_ext import (APSWDatabase, Model, TextField, ForeignKeyField,
                                IntegerField, OperationalError, DoesNotExist)
from apsw import SQLError

database = APSWDatabase('reference_list.db')


class BaseModel(Model):
    class Meta:
        database = database


class Character(BaseModel):
    name = TextField()
    stand = TextField(default=None, null=True)
    part = IntegerField()
    manga_debut = IntegerField(default=None, null=True)
    anime_debut = IntegerField(default=None, null=True)
    wiki = TextField(default=None, null=True)
    comment = TextField(default=None, null=True)


class Reference(BaseModel):
    name = TextField()
    reference_type = TextField(default=None, null=True)
    character = ForeignKeyField(Character, related_name='references')


class Song(BaseModel):
    title = TextField()
    artist = TextField()
    link = TextField(default=None, null=True)
    reference = ForeignKeyField(Reference, related_name='songs')


def parse_dict(args):
    if isinstance(args, str):
        # Regex that tries to parse key value pairs but has limitation that make literal_eval easier to use
        # Not in use
        args = re.findall(r'([\w\d]+=[\w\d\s]+)(?= [\w\d]+=[\w\d\s]+|$)', args)
    else:
        args = list(args)

    kwargs = {}
    for arg in args:
        k, v = arg.split('=')
        if k in kwargs:
            raise ValueError('Key %s used more than once' % k)

        kwargs[k] = v

    return kwargs


def create_reference(character, reference, songs):
    reference = Reference.create(**reference, character=character)
    reference.save()

    _songs = []
    if songs is None:
        songs = []

    for song in songs:
        if song is None:
            continue

        elif not isinstance(song, Song):
            song = Song.create(**song, reference=reference)
            song.save()
            _songs.append(song)
        else:
            _songs.append(song)

    return reference, _songs


def create_character_from_kwargs(character, references, check=True):
    with database.transaction() as txn:
        try:
            if check:
                # Very basic check that tries to guess if a character is already on the list.
                try:
                    print(character.get('part'), character.get('stand'))
                    r = Character.get(Character.part == character.get('part'), Character.stand == character.get('stand'), Character.manga_debut == character.get('manga_debut'))

                    res = input('{} might be a duplicate with {}. \nDo you still want to continue y/n\n'.format(character, vars(r).get('_data')))
                    if res not in ['yes', 'y']:
                        return print('Cancelling'), None

                except DoesNotExist:
                    pass

            character = Character.create(**character)
            character.save()

            _references = []
            for reference, songs in references:
                reference, songs = create_reference(character, reference, songs)
                _references.append(reference)

            return character, _references
        except Exception as e:
            txn.rollback()
            print('Could not add reference %s' % e)
            return None, None


def literal_eval_w_traceback(s):
    import traceback
    try:
        return ast.literal_eval(s)
    except Exception:
        traceback.print_exc()
        raise

if __name__ == '__main__':
    # template --char "{'name': '', 'stand': '', 'part': , 'manga_debut': , 'anime_debut': , 'wiki': '', 'comment': ''}" --ref "{'name': '', 'reference_type': ''}" --song "{'title': '', 'artist': '', 'link': ''}"
    parser = argparse.ArgumentParser()
    parser.add_argument('--character', type=literal_eval_w_traceback)
    parser.add_argument('--reference', type=literal_eval_w_traceback)
    parser.add_argument('--song', type=literal_eval_w_traceback, action='append')
    last = None

    database.connect()
    try:
        database.create_tables([Character, Reference, Song])
    except (SQLError, OperationalError) as e:
        print(e)

    while True:
        res = input('Add another one or stop\n')
        if res == 'stop':
            break
        else:
            try:
                res = res.strip()
                args = shlex.split(res)
                args = parser.parse_args(args)
                print(args)

                if args.character is None:
                    if last is None:
                        print('No character specified')
                        continue

                    else:
                        create_reference(last, args.reference, args.song)
                else:
                    character, references = create_character_from_kwargs(args.character, [(args.reference, args.song)])
                    last = character
                    if character is not None:
                        print('Only pass the reference and song arguments to add another reference to this character')

            except Exception as e:
                print('Error: %s' % e)

        print()

    database.close()
