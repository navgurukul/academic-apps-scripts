function fetchHTTPResponse(url, options) {
  logEvent("In fetchHTTPResponse: Fetching url -" + url, LOG_LEVEL_DEBUG);
  var response = UrlFetchApp.fetch(url, options);
  //Logger.log("In fetchHTTPResponse: response -" + response);
  return (response);
}

function fetchCookie(response) {
  headers = response.getAllHeaders();
  cookies = headers['Set-Cookie'];
  for (i in cookies) {
    cookies[i] = cookies[i].split(";")[0];
  }
  cookies = cookies.join(";");
  logEvent(cookies, LOG_LEVEL_DEBUG);
  return (cookies);
}

function fetchAuthenticatedCookie() {
  var data = {
    "j_username": username,
    "j_password": password,
    "ajaxLogin": "Log in"
  };
  var options = {
    "method": "POST",
    "payload": data,
    'followRedirects': false,
    muteHttpExceptions: true
  };
  response = fetchHTTPResponse(loginURL, options);
  return fetchCookie(response);
}

function fetchSavedStudentIds() {
  const date = getTodaysDate();
  if (getSheet(date) != null) {
    return readStudentIdsFromSheet(date);
  } else
    return null;
}
 
function getActiveSs() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  var ss = getActiveSs();
  return ss.getSheetByName(name); //The name of the sheet tab where you are sending the info
}

function addDataToSheet(data, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}

function getTodaysDate() {
  const dateTimeInParts = new Date().toISOString().split("T");
  const date = dateTimeInParts[0]; // "2021-08-31"
  return date;
}


function insertNewTab(name) {
  ss = getActiveSs().insertSheet();
  ss.setName(name);
}

function fetchJsonFromURL(url, options) {
  Logger.log("In fetchJsonFromURL: Fetching url - %s", url);
  Logger.log(options);
  var response = UrlFetchApp.fetch(url, options); 
  var json = response.getContentText(); // get the response content as text
  return JSON.parse(json); //parse text into json
}

function fetchHTTPResponse(url, options) {
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  Logger.log(options);
  var response = UrlFetchApp.fetch(url, options); 
  Logger.log(response.getResponseCode());
  return response;
}


function fetchCookie(response) {
  headers = response.getAllHeaders();
  cookies = headers['Set-Cookie'];
  return (cookies);
}


function readContests() {
  var contests = fetchCellValues('contests', "A:A");
  return contests;
}


function uniq(old, newValue) {

    if (old.length === 0) {
      return null;
    }
    var deff = newValue.filter(char => !old.includes(char));
    return deff;
  
  }
  
  function generateRangeString(n, m) {
    if (n <= 0 || m < n) {
      return "";
    }
  
    let result = "";
    const base = 'A'.charCodeAt(0);
  
    for (let i = n; i <= m; i++) {
      let currentN = i;
      let tempResult = "";
  
      while (currentN > 0) {
        const remainder = (currentN - 1) % 26;
        tempResult = String.fromCharCode(base + remainder) + tempResult;
        currentN = Math.floor((currentN - 1) / 26);
      }
  
      result += tempResult + ",";
    }
    return result.slice(0, -1);
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
  
  function onOpen() {
    SpreadsheetApp.getUi().createMenu("Custom Filter")
      .addItem("Protect Sheets", "protectSheets")
      .addItem("Unprotect Sheets", "unprotectSheets")
      .addItem("Filter rows", "filterAllSheets")
      .addItem("Show all rows", "showAllRows")
      .addToUi();
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

function addDataToSheet(data, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1,1,data.length, data[0].length).setValues(data);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Custom Filter")
    .addItem("Filter rows", "filterRows")
    .addItem("Show all rows", "showAllRows")
    .addToUi();
}

function getIndexFromColumn(column) {
  var A = "A".charCodeAt(0);
  var number = column.charCodeAt(column.length-1) - A;
  if (column.length == 2) {
    number += 26 * (colA1.charCodeAt(0) - A + 1);
  }
  return number;
}

function fetchFilterValues() {
    return fetchCellValue(getDummySheetName(), "A5").split(',');
}
