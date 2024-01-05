function getDataTab() {
  return "Data";
}

function getOnlineProfileTabName() {
  return "3-Online Profile";
}

function fetchHeaderData(spID, tabName) {
  var tab = getTabNameByName(spID, tabName);
  var range = "A1:B4";
  var headerData = fetchValuesInRange(tab, range);
  return headerData;
}

function getEditedColName(editedRange) {
  var columnIndex = editedRange.getColumn() - 1;
  return String.fromCharCode('A'.charCodeAt(0) + columnIndex);
}

function checkOnlineProfileUserName(e) {
  var editedRange = e.range;
  var columnName = getEditedColName(editedRange)
  var spID = e.source.getId();
  var header = fetchHeaderData(spID, getDataTab());
  var site = getSiteName(header, columnName);
  if (site !== -1 && editedRange.getValue().length > 0) {
    if (verifyUserName(site, editedRange.getValue()) === "Invalid") {
      return "Invalid"
    }
  }
  return -1;
}

function showCustomDialog(e) {
  var spreadsheetId = e.source.getId();
  var htmlOutput = HtmlService.createHtmlOutput(`<b>This is Invalid username ${e.range.getValue()}</b>`)
    .setWidth(300)
    .setHeight(100);
  SpreadsheetApp.openById(spreadsheetId).showModalDialog(htmlOutput, 'Custom Dialog');
}

function verifyUserName(site, userName) {
  site = site.toLowerCase();
  if (site.indexOf("codechef") > -1) {
    return ValidateusernameDev.validateUserName(userName, "CC");
  } else if (site.indexOf("atcoder") > -1) {
    return ValidateusernameDev.validateUserName(userName, "AC");
  } else if (site.indexOf("leetcode") > -1) {
    return ValidateusernameDev.validateUserName(userName, "LC");
  } else if (site.indexOf("freecodecamp") > -1) {
    return ValidateusernameDev.validateUserName(userName, "FCC")
  }
}

function getSiteName(header, editedCell) {
  for (var i = 0; i < header.length; i++) {
    var siteCell = header[i][1].slice(0, header[i][1].length - 1);
    var site = header[i][0];
    if (siteCell === editedCell) return site;
  }
  return -1;
}

function handleEvent(e) {
  var activeSheet = e.source.getActiveSheet();
  if (activeSheet.getName() === getOnlineProfileTabName()) {
    checkOnlineProfileUserName(e)
  }
}

function getSheetByID(id) {
  return SpreadsheetApp.openById(id)
}

function getTabNameByName(id, tabName) {
  return getSheetByID(id).getSheetByName(tabName)
}

function generateHashMap(keys) {
  if (keys.length == Null) {
    throw new Error('Key and value columns must have the same number of rows.');
  }
  const hashMap = {};
  for (let i = 0; i < keys.length; i++) {
    hashMap[keys[i]] = getColumnLetters(i + 1);
  }
  return hashMap;
}
function fetchValuesInRange(sheet_name, range) {
  return sheet_name.getRange(range).getValues();
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