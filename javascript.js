var myList=[{"Name" : "Killer Queen", "Part" : 4, "links": ['youtube/kq']},
            {"Name" : "Echoes", "Part" : 4, "links": ['youtube/echoes']},
            {"Name" : "Red hot chili peppers", "Part" : 4, "links": ['youtube/song1', 'youtube/song2']},
            {"Name" : "Dragons dream", "Part" : 6, "links": []}];

// Builds the HTML Table out of myList json data from Ivy restful service.
 function buildHtmlTable() {
     var columns = addAllColumnHeaders(myList);
     var odd_even = {0: 'even', 1: 'odd'};

     for (var i = 0 ; i < myList.length ; i++) {
         var odd_text = odd_even[i%2]
         var row$ = $('<tr class=' + odd_text + '/>');
         var rowSpan = Math.max(1, myList[i]["links"].length).toString();
         console.log(rowSpan);
         for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
             var cellValue = myList[i][columns[colIndex]];

             if (cellValue == null) { cellValue = ""; }

             var t = '<td/>';
             var added = false;

             if (columns[colIndex] != "links") {
                t = '<td rowspan=' + rowSpan.toString() + '/>';
                row$.append($(t).html(cellValue));

             } else {
                for (idx in cellValue){
                    link = cellValue[idx];
                    link = '<a href=' + link + '>' + link + '</a>';
                    if (idx == 0){
                        row$.append($(t).html(link));
                        $("#referenceTable").append(row$);
                        added = true;
                    } else {
                        var row2$ = $('<tr class=expand-child ' + odd_text + '/>');
                        row2$.append($(t).html(link));
                        $("#referenceTable").append(row2$);
                    }
                    console.log(link);
                    }
             }
             if (!added){$("#referenceTable").append(row$);}

         }
     }
     $("#referenceTable").tablesorter();
 }

 // Adds a header row to the table and returns the set of columns.
 // Need to do union of keys from all records as some records may not contain
 // all records
 function addAllColumnHeaders(myList)
 {
     var columnSet = [];
     var headerTr$ = $('<tr/>');

     for (var i = 0 ; i < myList.length ; i++) {
         var rowHash = myList[i];
         for (var key in rowHash) {
             if ($.inArray(key, columnSet) == -1){
                 columnSet.push(key);
                 headerTr$.append($('<th class=header/>').html(key));
             }
         }
     }
     var content = '<thead>'
     content += headerTr$.html()
     content += '</thead>'
     $("#referenceTable").append(content);

     return columnSet;
 }