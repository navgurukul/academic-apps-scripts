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

function getDataRangeInTrackerTab() {
  return "A3:C"
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
    if (newProblems.length !== 0) addProblemsToTracker(newProblems);
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

function handleData(data) {
  var currentStatusFilterValues = fetchCellValues(getDummySheetName(), "A5")[0].split(",");
  var topicStatusAddValues = fetchCellValues(getDummySheetName(), "A6")[0].split(",");
  var finalData = [];
  for (var i = 0; i < data.length; i++) {
    if (currentStatusFilterValues.indexOf(data[i][3]) < 0 && topicStatusAddValues.indexOf(data[i][2]) > -1) {
      var dataArr = [data[i][0], data[i][1], data[i][3]];
      finalData.push(dataArr);
    }
  }
  // console.log(finalData)
  return finalData;

}

function fetchData(sheet_name, range) {
  return removeEmpty(fetchValuesInRange(sheet_name, range))
}

function filterStudents(data1, data2, k1) {
  var newdata = []
  for (var i = 0; i < data2.length; i++) {
    flag = true
    for (var j = 0; j < data1.length; j++) {
      if (data1[j][1] === data2[i][1]) {
        flag = false
      }
    }
    if (flag) {
      newdata.push(data2[i]);
    }
  }
  return newdata;
}
function updateSheet() {
  var data = fetchData(getDataSheetName(), "A2:E");
  var filteredStudents = handleData(data);
  // console.log(filteredData);
  var savedStudentsOnTracker = fetchData(getTrackerName(), getDataRangeInTrackerTab())
  savedStudentsOnTracker = savedStudentsOnTracker.slice(1, savedStudentsOnTracker.length);
  if (savedStudentsOnTracker.length) {
    var dataToBeAddedOnTracker = filterStudents(savedStudentsOnTracker, filteredStudents, 1)

    filteredStudents = dataToBeAddedOnTracker
  }
  updateTrackerForCode();
  if (filteredStudents.length) {
    var sheet_name = getTrackerName()
    last_row = addStudentsToSheet(filteredStudents, sheet_name);
    for (var j in filteredStudents) {
      student = filteredStudents[j];
      Logger.log(student);
      addDataValidation(sheet_name, last_row + (+j) - 1);
      protectRowForEmail(sheet_name, last_row + (+j) - 1, student[1]);
    }
  }
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


function addDataValidation(sheet_name, j) {
  ss = getSheet(sheet_name);
  var row = 2 + j;
  var range_string = 'D' + row + ':' + row; //todo: fetch from meta sheet
  var row_range = ss.getRange(range_string);
  var rule = SpreadsheetApp.newDataValidation().requireValueInRange(getValidationRange()).build();
  row_range.setDataValidation(rule);
}

function getValidationRange() {
  let dss = getSheet(getDummySheetName());
  let validation_range = dss.getRange('A8:A10');
  return validation_range;
}

function unprotectSheets() {
  var sheet_names = getAllSheetNames();
  for (var i in sheet_names) {
    sheet_name = sheet_names[i];
    unprotectSheet(sheet_name);
  }
}

function addStudentsToSheet(students, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, students.length, students[0].length).setValues(students);
  return lastRow;
}

function getActiveSs() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function removeEmpty(data) {
  var arr = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].length) arr.push(data[i]);
  }
  return arr;
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


