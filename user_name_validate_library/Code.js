function getTabName(){
  return "3-Online Profile"
}

function checkHeader(editedRange, tab, headerData) {
  var headermap = {}
  for (var i = 0; i < headerData[0].length; i++) {
    headermap[headerData[0][i]] = getColumnLetters(i + 1);
  }
  var sheetName = editedRange.getSheet().getName();
  var editcell = editedRange.getA1Notation()
  var res = -1;
  for (var i = 2; i <= tab.getLastRow(); i++)
    if (sheetName === getTabName()) {
      if (headermap['Codechef'] + i === editcell) {
        res = checkUserName("https://www.codechef.com/users/", tab.getRange(headermap['Codechef'] + i).getValue());
      } else if (headermap['Leetcode'] + i === editcell) {
        res = checkUserName("https://leetcode.com/", tab.getRange(headermap['Codechef'] + i).getValue());
      } else if (headermap['AtCoder'] + i === editcell) {
        res = checkUserName("https://atcoder.jp/users/", tab.getRange(headermap['Codechef'] + i).getValue());
      }
    }
  return res;
}

function checkUserName(api, userName) {
  Logger.log(api + userName);
  return check(api + userName) === 200 ? 200 : 0;
}

function check(api) {
  var options = {
    "method": "GET",
    'headers': { 'User-Agent': 'PostmanRuntime/7.32.2' },
    "muteHttpExceptions": true
  };
  return fetchHTTPResponse(api, options);
}

function fetchHTTPResponse(url, options) {
  Logger.log(url)
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  var response = UrlFetchApp.fetch(url, options);
  return response.getResponseCode();;
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
