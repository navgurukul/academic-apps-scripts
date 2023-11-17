function getDataSheetName() {
    return "Data";
}

function getDummySheetName() {
    return "Dummy Sheet";
}

function getAttendanceSheetName() {
    //return "attendance-test";
    return "Attendance";
}

function getActiveSs() {
  return SpreadsheetApp.getActiveSpreadsheet();  
}

function getSheet(name) {
  var ss = getActiveSs();
  return ss.getSheetByName(name); //The name of the sheet tab where you are sending the info
}

function fetchValuesInRange(sheet_name, range) {
  return getSheet(sheet_name).getRange(range).getValues();
}

function fetchCellValues(sheet_name, range) {
  var values = fetchValuesInRange(sheet_name, range);
  var result = [];
  for (var row in values) {
    for (var col in values[row]) {
      if (values[row][col])
        result.push(values[row][col]);
    }
  }
  //Logger.log(result);
  return result;
}

function fetchCellValue(sheet_name, range) {
  return getSheet(sheet_name).getRange(range).getValue();
}

function fetchCampusColumn() {
    return fetchCellValue(getDummySheetName(), "A4");
}

function fetchCampusColumnValues() {
    var campusColumn = fetchCampusColumn();
    return fetchCellValue(getDummySheetName(), campusColumn + "3");
}

function fetchEmailColumn() {
  var columnValues = fetchCampusColumnValues();
  return columnValues.split(',')[1];  
}

function fetchNameColumn() {
  var columnValues = fetchCampusColumnValues();
  return columnValues.split(',')[0];  
}

function fetchJobReadyColumn() {
  var columnValues = fetchCampusColumnValues();
  return columnValues.split(',')[2];  
}

function fetchStudentEmailData() {
  var emailColumn = fetchEmailColumn();
  return fetchCellValues(getDataSheetName(), emailColumn + ":" + emailColumn);
}

function fetchStudentNameData() {
  var nameColumn = fetchNameColumn();
  return fetchCellValues(getDataSheetName(), nameColumn + ":" + nameColumn);
}

function fetchStudentJobReadyData() {
  var column = fetchJobReadyColumn();
  return fetchCellValues(getDataSheetName(), column + ":" + column);
}


function fetchOldStudentEmailData() {
  return fetchCellValues(getAttendanceSheetName(), "B:B");
}

function fetchNewStudents() {
  var latestStudentEmailData = fetchStudentEmailData();
  var latestStudentNameData = fetchStudentNameData();
  var latestStudentJobReadyData = fetchStudentJobReadyData();
  var oldStudentEmailData = fetchOldStudentEmailData();
  var newStudentData = [];

  var values = fetchFilterValues();
  
  for(var i in latestStudentEmailData) {
    var consider = true;
    for(var j = 0; j < values.length; j++) {
      if (latestStudentJobReadyData[i] && latestStudentJobReadyData[i].toUpperCase() === values[j].toUpperCase()) {
        consider = false;
        break;
      }
    }
    if (consider) {
      var isMatched = oldStudentEmailData.indexOf(latestStudentEmailData[i]); 
      if (isMatched == -1) {
        newStudentData.push([latestStudentNameData[i], latestStudentEmailData[i]]);
      } else {
          Logger.log(newStudentData);
      }
    }
  }
  Logger.log(newStudentData);
  return newStudentData;
}

function updateAttendanceSheet() {
  var newStudents = fetchNewStudents();
  if (newStudents.length > 0) {
    addStudentToSheet(newStudents, getAttendanceSheetName());      
  }
  filterRows();
}

function addStudentToSheet(student, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1,1,student.length, student[0].length).setValues(student);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Custom Filter")
    .addItem("Filter rows", "filterRows")
    .addItem("Show all rows", "showAllRows")
    .addToUi();
}

function showAllRows() {
  var sheet = getSheet(getAttendanceSheetName());
  sheet.showRows(1, sheet.getMaxRows());
}

function getIndexFromColumn(column) {
  var A = "A".charCodeAt(0);
  var number = column.charCodeAt(column.length-1) - A;
  if (column.length == 2) {
    number += 26 * (colA1.charCodeAt(0) - A + 1);
  }
  return number;
}

function getIndexForJobReadyColumn() {
  var jobReadyColumn = fetchJobReadyColumn();
  return(getIndexFromColumn(jobReadyColumn));
}

function fetchFilterValues() {
    return fetchCellValue(getDummySheetName(), "A5").split(',');
}

function filterRows() {
  var index = getIndexForJobReadyColumn();
  //Logger.log(index);
  var values = fetchFilterValues();
  //Logger.log(values);
  var dataSheet = getSheet(getDataSheetName());
  var data = dataSheet.getDataRange().getValues();
  var attendanceSheet = getSheet(getAttendanceSheetName());
  var attendanceEmails = fetchOldStudentEmailData();

  for(var i = 1; i < data.length; i++) {
    for(var j = 0; j < values.length; j++) {
      if(data[i][index].toUpperCase() === values[j].toUpperCase()) {
        //Logger.log(data[i]);
        var email = data[i][getIndexFromColumn(fetchEmailColumn())];
        //Logger.log(email);
        var isMatched = attendanceEmails.indexOf(email); 
        if (isMatched !== -1) {
          Logger.log(values[j]);
          Logger.log(data[i]);
          //attendanceSheet.hideRows(isMatched + 1);
          attendanceSheet.deleteRow(isMatched + 1);    
          attendanceEmails = fetchOldStudentEmailData();      
        }
      }
    }
  }
}
