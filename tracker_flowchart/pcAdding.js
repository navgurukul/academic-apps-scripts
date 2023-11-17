function myFunction() {
  var uniq = [...new Set(topics)];
  var allTopic = [];
  for (var i in uniq) {
    allTopic.push([uniq[i]]);
  }
  Logger.log(allTopic);

  // for(var  i in topics){
  //   uniqueTopic.add(topics[i][0])
  // }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tracker-testing").getRange("D1:AZ1").setValue(allTopic);
  // // Logger.log(data)
  // Logger.log(uniqueTopic); 
}



function updateProblemsCode(){
  var values = fetchCellValues("Description","A1:A");
  // Logger.log(values);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
  // ss is now the spreadsheet the script is associated with
  var sheet = ss.getSheetByName("Tracker-testing"); // sheets are counted starting from 0
  // sheet is the first worksheet in the spreadsheet
  var cell = sheet.getRange("C1:CE1"); 
  // cell.setValue(values);
  var valuesForSet = [[]];
  for (var i in values){
    if(values[i].length>0){
      valuesForSet[0].push(values[i]);
    }
  }
  // Logger.log(valuesForSet);
  cell.setValues(valuesForSet);

}