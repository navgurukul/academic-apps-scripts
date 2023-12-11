function checkHeader(editedRange, tab, headerData) {
  var headermap = {}
  for (var i = 0; i < headerData[0].length; i++) {
    headermap[headerData[0][i]] = getColumnLetters(i + 1);
  }
  var sheetName = editedRange.getSheet().getName();
  var editcell = editedRange.getA1Notation()
  for (var i = 2; i <= tab.getLastRow(); i++){
    if (headermap['Codechef'] + i === editcell) {
      res = checkUserName("https://www.codechef.com/users/", tab.getRange(headermap['Codechef'] + i).getValue());
      if (res.getResponseCode() === 200 && res.getContentText().indexOf('"currentUser":"' + tab.getRange(headermap['Codechef'] + i).getValue() + '"') !== -1) {
        return "Valid userName";
      } else {
        return "Invalid userName";
      }
    } else if (headermap['Leetcode'] + i === editcell) {
      return checkUserName("https://leetcode.com/", tab.getRange(headermap['Leetcode'] + i).getValue()).getResponseCode() === 404 ? 0 : 1;

    } else if (headermap['AtCoder'] + i === editcell) {
      return checkUserName("https://atcoder.jp/users/", tab.getRange(headermap['AtCoder'] + i).getValue()).getResponseCode() === 404 ? 0 : 1;
    }
  }
}

function checkUserName(api, userName) {
  var options = {
    "method": "GET",
    'headers': { 'User-Agent': 'PostmanRuntime/7.32.2' },
    "muteHttpExceptions": true
  };
  return fetchHTTPResponse(api + userName, options);
}

function fetchHTTPResponse(url, options) {
  Logger.log(url)
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  var response = UrlFetchApp.fetch(url, options);
  return response;
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