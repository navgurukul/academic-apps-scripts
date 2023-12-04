function getUsernames() {
  const sheetName = 'SHEET_NAME'; // to be replaced with sheet name
  const columnIndex = COLUMN_INDEX; // to be replaced with index of columns that return usernames
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  const usernames = sheet.getRange(1, columnIndex, sheet.getLastRow(), 1).getValues().flat();
  //Logger.log('Usernames:', usernames);
  return usernames;
}

function getUserProfileByUsername(username) {
  const apiEndpoint = 'https://api.freecodecamp.org/api/users/get-public-profile?username=';
  const apiUrl = apiEndpoint + username;
  const response = UrlFetchApp.fetch(apiUrl);
  const userProfile = JSON.parse(response.getContentText());
  //Logger.log('User Profile:', userProfile);
  return userProfile;
}

function createSheetWithColumns(sheetName, columnNames) {
  const sheetId = 'SHEET_ID';
  const newSheet = SpreadsheetApp.create(sheetName);
  const sheet = SpreadsheetApp.openById(newSheet.getId()).getActiveSheet();
  sheet.appendRow(columnNames);
  //Logger.log(`Sheet '${sheetName}' created with columns: ${columnNames.join(', ')}`);
  return sheet;
}

function updateRowValues(sheetId, sheetName, rowIndex, startColumnIndex, endColumnIndex, newValues) {
  var spreadsheet = SpreadsheetApp.openById(sheetId);

  var sheet = spreadsheet.getSheetByName(sheetName);

  var range = sheet.getRange(rowIndex, startColumnIndex, 1, endColumnIndex - startColumnIndex + 1);

  range.setValues([newValues]);

  //Logger.log('Updated row ' + rowIndex + ' in sheet ' + sheetName + ' from column ' + startColumnIndex + ' to ' + endColumnIndex);
}

function getColumnData(sheetId, sheetName, columnIndex) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  const range = sheet.getRange(1, columnIndex, sheet.getLastRow(), 1);
  const values = range.getValues().flat().filter(String);
  return values;
}

function generateHashMap(keys, values) {

  if (keys.length !== values.length) {
    throw new Error('Key and value columns must have the same number of rows.');
  }
  const hashMap = {};
  for (let i = 0; i < keys.length; i++) {
    hashMap[keys[i]] = values[i];
  }
  //Logger.log('Generated Hashmap:', hashMap);
  return hashMap;
}

function createArrayUpToN(n) {
  var resultArray = [];

  for (var i = 0; i <= n; i++) {
    resultArray.push(i);
  }

  return resultArray;
}

function updateStudentData() {

  const sheetId = '1IyXX6yKqYGrTIBLdAcnmW6cI_xqavuY6cR2je-soKBY';

  //const certifications = getColumnData(sheetId,'Mapping',1);
  const courses = new Set(getColumnData(sheetId, 'Mapping', 2));
  var uniqueCourses = Array.from(courses);
  uniqueCourses.shift();
  const courseName = getColumnData(sheetId, 'Mapping', 2);
  const challengeId = getColumnData(sheetId, 'Mapping', 4);
  challengeId.shift()
  courseName.shift()

  updateRowValues(sheetId, 'Duplicate', 1, 1, uniqueCourses.length + 2, ['Name', 'Username'].concat(uniqueCourses));
  idToNameMap = generateHashMap(challengeId, courseName);

  const users = getColumnData(sheetId, 'Duplicate', 2);
  users.shift();
  const size = uniqueCourses.length;
  const thisMap = createArrayUpToN(size - 1);
  const lockedProfiles = Array(size).fill('Locked');
  const courseMap = generateHashMap(uniqueCourses, thisMap);

  var rowNumber = 2;
  for (let i in users) {
    var profile = getUserProfileByUsername(users[i]);
    if ('isLocked' in profile['entities']['user'][users[i]]) {
      updateRowValues(sheetId, 'Duplicate', rowNumber, 3, size + 2, lockedProfiles);
      rowNumber += 1;
      continue;
    }
    var completedChallenges = profile['entities']['user'][users[i]]['completedChallenges'];
    var row = Array(size).fill(0);
    for (let val of completedChallenges) {
      var foundId = val['id'];
      if (foundId in idToNameMap) {
        var foundName = idToNameMap[foundId];
        row[courseMap[foundName]] += 1;
      }
    }
    // Logger.log(row);
    // Logger.log(i+2);
    updateRowValues(sheetId, 'Duplicate', rowNumber, 3, size + 2, row);
    rowNumber += 1;
  }
}





