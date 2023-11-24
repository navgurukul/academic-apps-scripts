function findDifferences(array1, array2) {
  var differences = [];
  for (var i in array1) {
    // break;
    var flag = true
    for (var j in array2) {
      if (array2[j][3].trim() === array1[i][3].trim()) {
        flag = false;
        break;
      }
    }
    if (flag) differences.push(array1[i]);
  }
  return differences;
}

function fetchStudentsData(min_value, max_value) {
  var apiUrl = "https://ghar.navgurukul.org/get/zoho/students?min_value=" + min_value + "&max_value=" + max_value;
  var options = {
    "method": "GET",
    'headers': { 'User-Agent': 'PostmanRuntime/7.32.2' },
    "muteHttpExceptions": true
  };
  var response = UrlFetchApp.fetch(apiUrl, options);
  console.log(apiUrl);
  console.log(response.getResponseCode());
  if (response.getResponseCode() === 200) {
    return JSON.parse(response.getContentText());
  } else {
    return "error";
  }
}

function test() {
  fetchStudentsDataFromGhar();
}

function fetchStudentsDataFromGhar() {
  let min_value = 0;
  let max_value = 1000;

  var allStudentsData = [];
  while (true) {
    json = fetchStudentsData(min_value, max_value);
    if (json === "error")
      break;
    for (var i in json['data']) {
      allStudentsData.push([
        json['data'][i]['Student_ID1'],
        json['data'][i]['Select_School1'],
        json['data'][i]['Name']['first_name'] + json['data'][i]['Name']['last_name'],
        json['data'][i]['Navgurukul_Email'],
        json['data'][i]['Personal_Email'],
        json['data'][i]['Joining_Date'],
        json['data'][i]['Status'],
        json['data'][i]['Select_Campus']['Campus_Name'],
      ])
    }
    min_value = max_value + 1;
    max_value += 1000;
    Utilities.sleep(10000);
  }
  return allStudentsData;
}

function fetchStudentsDataFromSheet() {
  return fetchCellValues("All_Students_Data", "A:Z");
}

function updateSheet() {
  var data = fetchStudentsDataFromGhar();
  var oldData = fetchStudentsDataFromSheet();
  if (oldData.length === 0) {
    addStudentsToSheet([["StudentId", "School", "Name", "Navgurukul's Email I'd", "Personal Email I'd", "Data of joining", "Status", "Campus"]], 'All_Students_Data');
  }
  else {
    data = findDifferences(data, oldData);
  }
  if (data.length !== 0) {
    data.sort((a, b) => a[0] - b[0])
    addStudentsToSheet(data, 'All_Students_Data');
  }
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
  // Logger.log(sheet_name + " test " + range);
  var values = fetchValuesInRange(sheet_name, range);
  // Logger.log(values);
  var result = [];
  for (var row in values) {
    for (var col in values[row]) {
      if (values[row][col].length > 0)
        result.push(values[row]);
    }
  }
  return result;
}

function fetchCellValue(sheet_name, range) {
  return getSheet(sheet_name).getRange(range).getValue();
}

function addStudentsToSheet(students, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow + 1, 1, students.length, students[0].length);
  range.setValues(students);
}




