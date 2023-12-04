const MAPPING_TAB = "Mapping";
const DATA_TAB = "Duplicate";

function getCourseColumn() {
    return 2;
}

function getChallengeColumn() {
  return 4;
}

function getUserNameColumn() {
  return 2;
}

function getUserProfileByUsername(username) {
  const apiEndpoint = 'https://api.freecodecamp.org/api/users/get-public-profile?username=';
  const apiUrl = apiEndpoint + username;
  const response = UrlFetchApp.fetch(apiUrl);
  const userProfile = JSON.parse(response.getContentText());
  return userProfile;
}

function updateStudentData() {
  const courseNames = getColumnData(MAPPING_TAB, getCourseColumn());
  const challengeIds = getColumnData(MAPPING_TAB, getChallengeColumn());
  const uniqueCourses = Array.from(new Set(courseNames));  

  courseNames.shift();
  challengeIds.shift();
  uniqueCourses.shift();

  //TODO: The DATA TAB should first be cleared beofre proceeding further. 
  updateRowValues(DATA_TAB, 1, 1, uniqueCourses.length + 2, ['Name', 'Username'].concat(uniqueCourses));

  const courseSize = uniqueCourses.length;
  const thisMap = createArrayUpToN(courseSize - 1);
  const lockedProfiles = Array(courseSize).fill('Locked');
  const courseMap = generateHashMap(uniqueCourses, thisMap);
  const users = getColumnData(DATA_TAB, getUserNameColumn());
  users.shift();

  idToNameMap = generateHashMap(challengeIds, courseNames);
  var rowNumber = 2;
  for (let i in users) {
    var profile = getUserProfileByUsername(users[i]);
    if ('isLocked' in profile['entities']['user'][users[i]]) {
      updateRowValues(DATA_TAB, rowNumber, 3, courseSize + 2, lockedProfiles);
      rowNumber += 1;
    } else {
      var completedChallenges = profile['entities']['user'][users[i]]['completedChallenges'];
      var row = Array(courseSize).fill(0);
      for (let val of completedChallenges) {
        var foundId = val['id'];
        if (foundId in idToNameMap) {
          var foundName = idToNameMap[foundId];
          row[courseMap[foundName]] += 1;
        }
      }
      updateRowValues(DATA_TAB, rowNumber, 3, courseSize + 2, row);
      rowNumber += 1;
    }
  }
}

function getColumnData(tabName, col) {
  let tab = getTab(tabName);
  const range = getColumnLetters(col) + "1:" + getColumnLetters(col) + tab.getLastRow();
  return fetchCellValues(tabName, range)
}

function getActiveSs() {
  return SpreadsheetApp.getActiveSpreadsheet();  
}

function getTab(name) {
  var ss = getActiveSs();
  return ss.getSheetByName(name); //The name of the sheet tab where you are sending the info
}

function fetchValuesInRange(tabName, range) {
  Logger.log(tabName);
  Logger.log(range);
  return getTab(tabName).getRange(range).getValues();
}

function fetchCellValues(tab, range) {
  var values = fetchValuesInRange(tab, range);
  var result = [];
  for (var row in values) {
    for (var col in values[row]) {
      if (values[row][col])
        result.push(values[row][col]);
    }
  }
  // Logger.log(result);
  return result;
}

function updateRowValues(tabName, rowIndex, startColumnIndex, endColumnIndex, newValues) {
  let tab = getTab(tabName);
  var range = tab.getRange(rowIndex, startColumnIndex, 1, endColumnIndex - startColumnIndex + 1);
  range.setValues([newValues]);
}

function generateHashMap(keys, values) {
  if (keys.length !== values.length) {
    throw new Error('Key and value columns must have the same number of rows.');
  }
  const hashMap = {};
  for (let i = 0; i < keys.length; i++) {
    hashMap[keys[i]] = values[i];
  }
  return hashMap;
}

function createArrayUpToN(n) {
  var resultArray = [];
  for (var i = 0; i <= n; i++) {
    resultArray.push(i);
  }
  return resultArray;
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