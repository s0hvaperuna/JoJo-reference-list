from playhouse.shortcuts import model_to_dict

import database

db = database.database

# Turn all the database entries to dictionaries and write them to a json file
if __name__ == '__main__':
    d = []
    for character in database.Character.select():
        d.append(model_to_dict(character, backrefs=True))

    print(d)
    import json

    with open('characters.json', 'w', encoding='utf-8') as f:
        s = json.dumps(d, indent=2)
        f.write(s)