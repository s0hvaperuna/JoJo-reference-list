// This whole think is fucking awful FeelsBadMan

var json = $.getJSON({'url': "characters.json", 'async': false}).responseJSON;
console.log(json)
// Builds the HTML Table out of myList json data from Ivy restful service.
 function buildHtmlTable() {
     var columns = addAllColumnHeaders();
     var odd_even = {0: 'even', 1: 'odd'};
     var columnSet = {"Character name": "name", "Stand": "stand", "Part": "part",
                      "References": "references", "Manga debut": "manga_debut",
                      "Anime debut": "anime_debut", "Comment": "comment"};

     for (var i = 0 ; i < json.length ; i++) {
         var odd_text = odd_even[i%2]
         var row$ = $('<tr class=' + odd_text + '/>');
         var rows = [];
         rows.push(row$);

         var refRowSpan = Math.max(1, json[i]["references"].length).toString();
         var rowSpan = 0;
         for (var referenceIdx in json[i]["references"]){
            console.log(json[i]["references"][referenceIdx]);
            rowSpan += json[i]["references"][referenceIdx]["songs"].length;
         }
         rowSpan = Math.max(1, rowSpan, refRowSpan).toString();

         for (var colKey in columnSet) {
             var cellValue = json[i][columnSet[colKey]];

             if (cellValue == null) { cellValue = ""; }

             var t = '<td/>';
             var added = false;
             var added2 = false;

             if (typeof columns[colKey] === 'string' || columns[colKey] instanceof String) {
                t = '<td rowspan=' + rowSpan + '/>';
                row$.append($(t).html(cellValue));

             } else {
                var totalIdx = 0;
                var lastRowSpan = 1;

                for (var idx in cellValue){
                    var reference = cellValue[idx];
                    refRowSpan = Math.max(1, reference["songs"].length).toString();
                    console.log(idx + " " + lastRowSpan);
                    totalIdx = parseInt(idx) + lastRowSpan - 1;
                    console.log("last row span " + lastRowSpan);
                    console.log("totalidx " + totalIdx);
                    console.log(refRowSpan);
                    console.log(rows.length + " " + parseInt(totalIdx + 1));
                    if (idx == 0){
                        var _row$ = rows[totalIdx];
                    } else if (rows.length < totalIdx + 1){
                        var _row$ = $('<tr class=expand-child ' + odd_text + '/>');
                        rows.push(_row$);
                        console.log('created row');
                    } else {
                        var _row$ = rows[totalIdx];
                        console.log("using old row");
                    }
                    console.log("Rows " + rows.length)
                    for (var key in columns[colKey]){
                        refKey = columns[colKey][key];

                        if (typeof refKey === 'string' || refKey instanceof String) {
                            var refValue = reference[refKey];
                            t = '<td rowspan=' + refRowSpan + '/>';
                            var _row$ = rows[totalIdx];
                            _row$.append($(t).html(refValue));

                        } else {
                            var songs = reference["songs"];
                            if (songs.length == 0){
                                songs.push({"title": "", "artist": "", "link": ""});
                            }

                            for (var songIdx in songs){
                                var song = songs[songIdx];

                                if (totalIdx in rows){
                                    console.log("using old row song");
                                    var tempRow$ = rows[totalIdx];
                                } else {
                                    var tempRow$ = $('<tr class=expand-child ' + odd_text + '/>');
                                    rows.push(tempRow$);
                                }
                                console.log(songs.length + " " + parseInt(songIdx) + " " + 1 + " " + songs.length + " " + parseInt(refRowSpan))
                                if (songs.length == parseInt(songIdx) + 1 && songs.length < parseInt(refRowSpan)){
                                    var songSpan = (parseInt(refRowSpan) - songs.length) + 1;
                                    t = '<td rowspan=' + songSpan + '/>';
                                    console.log("t is " + t);
                                } else {
                                    t = '<td/>';
                                }
                                for (var songKey in refKey){
                                    var songKeyName = refKey[songKey];
                                    var songKeyValue = song[songKeyName];
                                    console.log(songKeyName)
                                    if (songKeyName == 'link'){
                                        songKeyValue = '<a href=' + songKeyValue + '>' + songKeyValue + '</a>';
                                    }
                                    tempRow$.append($(t).html(songKeyValue));
                                }
                                console.log("total idx before " + totalIdx);
                                totalIdx += 1;
                                console.log("total idx after " + totalIdx);
                            }
                        }
                    }


                    //var row2$ = $('<tr class=expand-child ' + odd_text + '/>');

                    lastRowSpan = parseInt(refRowSpan);
                }
             console.log(rows.length + " Rows");
             }
         for (r in rows){
            $("#referenceTable").append(rows[r]);
         }

         }
     }
     // Sort by Part and manga_debut
     $("#referenceTable").tablesorter({sortList: [[2,0], [8, 0]]});
 }

 // Adds a header row to the table and returns the set of columns.
 // Need to do union of keys from all records as some records may not contain
 // all records
 function addAllColumnHeaders()
{
     var columnSet = {"Character name": "name", "Stand": "stand", "Part": "part",
                        "References": {"Type": "reference_type", "Name": "name",
                            "Songs": {"Title": "title", "Artist": "artist", "Link": "link"}},
                        "Manga debut": "manga_debut", "Anime debut": "anime_debut", "Comment": "comment"};

     var headerTr$ = $('<tr/>');

     for (var key in columnSet) {
         if (typeof columnSet[key] === 'string' || columnSet[key] instanceof String){
            headerTr$.append($('<th class=header/>').html(key));
         } else {
            for (var key2 in columnSet[key]) {
              if (typeof columnSet[key][key2] === 'string' || columnSet[key][key2] instanceof String){
                    headerTr$.append($('<th class=header/>').html(key2));
              } else {
                for (var key3 in columnSet[key][key2]){
                    headerTr$.append($('<th class=header/>').html(key3));
                }
              }
            }
         }
     }
     var content = '<thead>';
     content += headerTr$.html();
     content += '</thead>';
     $("#referenceTable").append(content);

     return columnSet;
 }