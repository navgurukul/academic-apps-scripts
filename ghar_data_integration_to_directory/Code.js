function getTabName() {
  return "1-Student Data";
}

function getGharTabName() {
  return "Dharamshala";
}

function getGharDataSpSheetID() {
  return "13wFmPmZwm-G9KpIsCAHmXqgQ5A4AHOqsToIjj6CjO7o"
}

function genrateHeaderMap(data) {
  var header = {};
  var colArr = getColumnArray(data.length);
  for (var i = 0; i < data.length; i++) {
    if (data[i]) header[colArr[i]] = data[i];
  }
  return header;
}

function getCopyDirID() {
  return "1a5hqJ-e5EAk9Yrz3jEki2hNY-6_kV2Dz6NwTC-E0LjU";
}

function fetchSaveData(spSheetID, tabName) {
  var subSheet = getActiveTabByName(spSheetID, tabName);
  var columnLetter = 'A';
  var range = `A1:${subSheet.getLastRow()}`;
  return fetchValuesInRange(subSheet, range);

}

function findSearchKey(header, target) {
  for (var i in header) {
    if (header[i] === target) return i;
  }
}

function uniq(data1, data1Header, data2, data2Header) {
  var keys = Object.keys(data2Header);
  var searchKey = findSearchKey(data2Header, "Navgurukul's Email I'd");
  var newStudents = [];
  var old = []
  var c = 0;
  var c1 = 0;
  for (var i = 0; i < data2.length; i++) {
    if (data2[i][keys.indexOf(searchKey)] in data1) {
      old.push(data2[i])
    } else {
      newStudents.push(data2[i])
    }
  }
  return [newStudents, old]
}

function getLengthOfObject(obj) {
  c = 0;
  for (var i in obj) {
    c++;
  }
  return c;
}
function updateStudentsData(dirSpreadSheetID, tabName) {
  var saveCampusData = fetchSaveData(dirSpreadSheetID, tabName);
  var dirHeaderMap = genrateHeaderMap(saveCampusData[0]);
  saveCampusData = saveCampusData.slice(1, saveCampusData.length);
  var dirDataMap = studentsDataMaping(dirHeaderMap, saveCampusData.slice(1, saveCampusData.length));
  var gharSaveData = fetchSaveData(getGharDataSpSheetID(), getGharTabName());
  var gharHeader = gharSaveData[0];
  var gharHeaderMap = genrateHeaderMap(gharHeader);
  gharSaveData = gharSaveData.slice(1, gharSaveData.length);
  var [newStudentsData, oldStudents] = uniq(dirDataMap, dirHeaderMap, gharSaveData, gharHeaderMap);
  if (oldStudents) {
    updateData(oldStudents, gharHeaderMap, dirDataMap, dirHeaderMap);
  }
  if (newStudentsData) {
    addStudents(newStudentsData, gharHeaderMap, dirHeaderMap, dirSpreadSheetID, tabName, getLengthOfObject(dirDataMap) + 2)
  }
}

function addStudents(data1, data1Header, dirHeader, spID, tabName, cellStart) {
  var keyMap = getKeyMap(data1Header);
  var keys = Object.keys(data1Header);
  var j = 0;
  for (var i = cellStart; i < data1.length + cellStart; i++) {
    for (var key in dirHeader) {
      cell = key + i;
      Logger.log(cell);
      gharIndex = keys.indexOf(keyMap[dirHeader[key]])
      newData = data1[j][gharIndex];
      updateCellValue(spID, cell, tabName, newData);
    }
    j+=1
  }
}

function getKeyMap(gharHeader) {
  return {
    "Email": findSearchKey(gharHeader, "Navgurukul's Email I'd"),
    "Personal Email": findSearchKey(gharHeader, "Personal Email I'd"),
    "Name": findSearchKey(gharHeader, "Name"),
    "Status": findSearchKey(gharHeader, "Status"),
    "Phone number": findSearchKey(gharHeader, "Phone_Number"),
    "Joining": findSearchKey(gharHeader, "Data of joining")
  }
}
function updateData(oldStudents, gharHeader, dirDataMap, dirHeaderMap) {
  var key = findSearchKey(gharHeader, "Navgurukul's Email I'd");
  map = getKeyMap(gharHeader);
  var keys = Object.keys(gharHeader);
  var dirSpId = getCopyDirID();
  var tab = getTabName();
  for (var i = 0; i < oldStudents.length; i++) {
    var email = oldStudents[i][keys.indexOf(key)];
    for (var j in map) {
      cell = map[j];
      var gharDetail = oldStudents[i][keys.indexOf(cell)];
      var dirDetail = dirDataMap[email][j];
      Logger.log(gharDetail);
      Logger.log(dirDetail);
      if (gharDetail !== dirDetail) {
        updateCellValue(dirSpId, findSearchKey(dirHeaderMap, j) + (dirDataMap[email]['key'] + 1), tab, gharDetail)
      }
    }
  }
}

function updateCellValue(spID, cell, tab, newValue) {
  getActiveTabByName(spID, tab).getRange(cell).setValue(newValue);
}

function studentsDataMaping(headerData, saveCampusData) {
  var students = {};
  var keys = Object.keys(headerData);
  var values = Object.values(headerData);
  for (var i = 0; i < saveCampusData.length; i++) {
    var userDetailArr = saveCampusData[i]
    var email = userDetailArr[values.indexOf("Email")]
    students[email] = {};
    students[email]['key'] = i + 2;
    students[email]["Personal Email"] = userDetailArr[values.indexOf("Personal Email")];
    students[email]["Name"] = userDetailArr[values.indexOf("Name")];
    students[email]["State"] = userDetailArr[values.indexOf("State")];
    students[email]["Joining"] = userDetailArr[values.indexOf("Joining")];
    students[email]["Status"] = userDetailArr[values.indexOf("Status")];
    students[email]["Phone number"] = userDetailArr[values.indexOf("Phone number")];
  }
  return students;
}

function test() {
  var dirSpId = getCopyDirID();
  var tab = getTabName();
  updateStudentsData(dirSpId, tab);
}

function fetchValuesInRange(sheet_name, range) {
  return sheet_name.getRange(range).getValues();
}

function getActiveSsById(id) {
  return SpreadsheetApp.openById(id);
}

function getActiveTabByName(spreadsheetID, tabName) {
  return getActiveSsById(spreadsheetID).getSheetByName(tabName); //The name of the sheet tab where you are sending the info
}

function getColumnArray(colIndex) {
  const startCharCode = 'A'.charCodeAt(0);
  const colArray = [];
  for (let i = 0; i < colIndex; i++) {
    let label = '';
    let tempIndex = i;

    do {
      const remainder = tempIndex % 26;
      label = String.fromCharCode(startCharCode + remainder) + label;
      tempIndex = Math.floor(tempIndex / 26) - 1;
    } while (tempIndex >= 0);
    colArray.push(label);
  }
  return colArray;
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