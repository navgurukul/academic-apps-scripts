function getDecriptionName() {
  return "Description";
}

function getDataSheetName() {
  return "Data";
}

function getValidationSheetName() {
  return "Data Validation";
}

function getDummySheetName() {
  return "Dummy Sheet";
}

function getMetaSheetName() {
  return "meta";
}

function getTrackerName() {
  return "Tracker";
}

function fetchDataFromTracker(tabName, range) {
  const values = fetchCellValues(tabName, range);
  return values;
}

function getProblemsCodeAndSec(problemsCode, section) {
  var data = [problemsCode, section];
  return data;
}

function getProblemsFromDb() {
  var problems = fetchCellValues(getDecriptionName(), "A2:A");
  var section = fetchCellValues(getDecriptionName(), "C2:C");
  return getProblemsCodeAndSec(problems, section);
}

function getProblemsFromTracker() {
  var columnIndex = getLastCol(getTrackerName());
  var problemsCodeCellRangeInTracker = "D1:" + getColumnLetters(columnIndex) + "1";
  var problems = fetchCellValues(getTrackerName(), problemsCodeCellRangeInTracker);
  var sectionCellRangeInTracker = "D2:" + getColumnLetters(columnIndex) + "2";
  var section = fetchCellValues(getTrackerName(), sectionCellRangeInTracker);
  return getProblemsCodeAndSec(problems, section);

}

function getLastCol(tabName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName).getLastColumn();
}

function updateTrackerForCode() {
  var dBproblems = getProblemsFromDb();
  var trackerProblems = getProblemsFromTracker();
  if (trackerProblems[0].length != 0) {
    var newProblems = filterTheNewProblems(trackerProblems, dBproblems);
    newProblems[0].length >= 1 ? addProblemsToTracker(newProblems) : console.log(newProblems);
  } else {
    addProblemsToTracker(dBproblems);
  }
}

function filterTheNewProblems(old, newData) {
  var newDataArr = [[], []];
  for (var i = 0; i < newData[0].length; i++) {
    var data = newData[0][i];
    if (old[0].indexOf(data) === -1) {
      newDataArr[0].push(data);
      newDataArr[1].push(newData[1][i]);
    }
  }
  return newDataArr;
}

function addProblemsToTracker(valuesToAdd) {
  var sheet = getSheet(getTrackerName());
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(1, lastColumn + 1, 2, valuesToAdd[0].length);
  range.setValues(valuesToAdd);
}

function fetchNewStudents(sheet) {
  var latestStudentEmailData = fetchStudentEmailData();
  var latestStudentNameData = fetchStudentNameData();
  var latestStudentJobReadyData = fetchStudentJobReadyData();
  var oldStudentEmailData = fetchOldStudentEmailData(sheet);
  var newStudentData = [];

  var values = fetchFilterValues();

  for (var i in latestStudentEmailData) {
    var consider = true;
    for (var j = 0; j < values.length; j++) {
      if (latestStudentJobReadyData[i] && latestStudentJobReadyData[i].toUpperCase() === values[j].toUpperCase()) {
        consider = false;
        break;
      }
    }
    if (consider) {
      var isMatched = oldStudentEmailData.indexOf(latestStudentEmailData[i]);
      if (isMatched == -1) {
        newStudentData.push([latestStudentNameData[i], latestStudentEmailData[i], latestStudentJobReadyData[i]]);
      } else {
        Logger.log(newStudentData);
      }
    }
  }
  Logger.log(newStudentData);
  return newStudentData;
}

function filterRows(sheetname) {
  var index = getIndexForJobReadyColumn();
  //Logger.log(index);
  var values = fetchFilterValues();
  //Logger.log(values);
  var dataSheet = getSheet(getDataSheetName());
  var data = dataSheet.getDataRange().getValues();
  var currentSheet = getSheet(sheetname);
  var attendanceEmails = fetchOldStudentEmailData(sheetname);
  for (var i = 1; i < data.length; i++) {
    for (var j = 0; j < values.length; j++) {
      if (data[i][index].toUpperCase() === values[j].toUpperCase()) {
        //Logger.log(data[i]);
        var email = data[i][getIndexFromColumn(fetchEmailColumn())];
        //Logger.log(email);
        var isMatched = attendanceEmails.indexOf(email);
        if (isMatched !== -1) {
          Logger.log(values[j]);
          Logger.log(data[i]);
          currentSheet.hideRows(isMatched + 1);
          currentSheet.deleteRow(isMatched + 1);
          attendanceEmails = fetchOldStudentEmailData();
        }
      }
    }
  }
}

function deleteInvalidStudents(students) {
  var values = fetchFilterValues();
  var remove = [];
  for (var i in students) {
    student = students[i];
    for (var j = 0; j < values.length; j++) {
      if (!!student[2] && student[2].toUpperCase() === values[j].toUpperCase()) {
        remove.push(i);
        break;
      }
    }
  }
  for (i = remove.length - 1; i >= 0; i--) {
    Logger.log(students[remove[i]] + ' - to be Deleted');
    students.splice(remove[i], 1);
  }
  return students;
}


function updateSheet() {
  var sheetname = getTrackerName();
  var newStudents = fetchNewStudents(sheetname);
  console.log(newStudents);
  updateTrackerForCode(); // For adding the FC code and subtopic
  newStudents = deleteInvalidStudents(newStudents);
  console.log(newStudents);
  if (newStudents.length > 0) {
    last_row = addStudentsToSheet(newStudents, sheetname);
    for (var j in newStudents) {
      student = newStudents[j];
      Logger.log(student);
      addDataValidation(sheetname, last_row + (+j) - 1);
      protectRowForEmail(sheetname, last_row + (+j) - 1, student[1]);
    }
  }
  filterRows(sheetname);
}

function getIndexFromColumn(column) {
  var A = "A".charCodeAt(0); var number = column.charCodeAt(column.length - 1) - A;
  if (column.length == 2) {
    number += 26 * (colA1.charCodeAt(0) - A + 1);
  }
  return number;
}

function getIndexForJobReadyColumn() {
  var jobReadyColumn = fetchJobReadyColumn();
  console.log(jobReadyColumn);
  return (getIndexFromColumn(jobReadyColumn));
}

function fetchFilterValues() {
  return fetchCellValue(getDummySheetName(), "A5").split(',');

}


function addStudentsToSheet(students, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, students.length, students[0].length).setValues(students);
  return lastRow;
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
  Logger.log(emailColumn);
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

function fetchOldStudentEmailData(sheetname) {
  return fetchCellValues(sheetname, "B:B");
}


function unprotectSheets() {
  var sheet_names = getAllSheetNames();
  for (var i in sheet_names) {
    sheet_name = sheet_names[i];
    unprotectSheet(sheet_name);
  }
}

function unprotectSheet(sheet_name) {
  var ss = getSheet(sheet_name);
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var protection = protections[i];
    if (protection.canEdit()) {
      protection.remove();
    }
  }
}

function protectSheets() {
  var sheet_names = getAllSheetNames();
  for (var i in sheet_names) {
    sheet_name = sheet_names[i];
    protectSheet(sheet_name);
  }
}

function getValidationRange() {
  let dss = getSheet(getDummySheetName());
  let validation_range = dss.getRange('A8:A10');
  return validation_range;
}

function addDataValidation(sheet_name, j) {
  ss = getSheet(sheet_name);
  var row = 2 + j;
  var range_string = 'D' + row + ':' + row; //todo: fetch from meta sheet
  var row_range = ss.getRange(range_string);
  var rule = SpreadsheetApp.newDataValidation().requireValueInRange(getValidationRange()).build();
  row_range.setDataValidation(rule);
}

function protectRowForEmail(sheet_name, j, email) {
  Logger.log(sheet_name);
  Logger.log(j);
  ss = getSheet(sheet_name);
  var row = 2 + j;
  var range_string = 'D' + row + ':' + row; //todo: fetch from meta sheet
  Logger.log(range_string);
  Logger.log(email);
  var range = ss.getRange(range_string);
  var protection = range.protect().setDescription('protected range');
  var me = Session.getEffectiveUser();
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  protection.addEditor('all-academic-team@navgurukul.org');
  protection.addEditor(email);
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

function protectSheet(sheet_name) {
  emails = getAllEmails(sheet_name);
  for (var j in emails) {
    var email = emails[j];
    protectRowForEmail(sheet_name, +j, email)
  }
}

function getAllEmails(sheet_name) {
  var emails = fetchCellValues(sheet_name, "B2:B");
  //Logger.log(contests);
  return emails;
}


function getAllSheetNames() {
  var sheets = fetchCellValues(getMetaSheetName(), "A:A");
  //Logger.log(contests);
  return sheets;
}

function getActiveSs() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var ss = getActiveSs();
  return ss.getSheetByName(name); //The name of the sheet tab where you are sending the info
}

function fetchValuesInRange(sheet_name, range) {
  SpreadsheetApp.flush();
  return getSheet(sheet_name).getRange(range).getValues();
}

function fetchCellValues(sheet_name, range) {
  Logger.log(sheet_name + " test " + range);
  var values = fetchValuesInRange(sheet_name, range);
  // Logger.log(values);
  var result = [];
  for (var row in values) {
    for (var col in values[row]) {
      if (values[row][col].length > 0)
        result.push(values[row][col]);
    }
  }
  return result;
}

function fetchCellValue(sheet_name, range) {
  return getSheet(sheet_name).getRange(range).getValue();
}


function onOpen() {
  SpreadsheetApp.getUi().createMenu("Custom Filter")
    .addItem("Protect Sheets", "protectSheets")
    .addItem("Unprotect Sheets", "unprotectSheets")
    .addItem("Filter rows", "filterAllSheets")
    .addItem("Show all rows", "showAllRows")
    .addToUi();
}

function showAllRows() {
  var sheet_names = getAllSheetNames();
  for (var i in sheet_names) {
    var sheetname = sheet_names[i];
    var sheet = getSheet(sheetname);
    sheet.showRows(1, sheet.getMaxRows());
  }
}

function filterAllSheets() {
  var sheet_names = getAllSheetNames();
  for (var i in sheet_names) {
    var sheetname = sheet_names[i];
    filterRows(sheetname);
  }
}

function getColumnLetters(columnIndexStartFromOne) {
  const ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  if (columnIndexStartFromOne < 27) {
    return ALPHABETS[columnIndexStartFromOne - 1];
  } else {
    var res = columnIndexStartFromOne % 26;
    var div = Math.floor(columnIndexStartFromOne / 26);
    if (res === 0) {
      div = div - 1;
      res = 26;
    }
    return getColumnLetters(div) + ALPHABETS[res - 1];
  }
}

