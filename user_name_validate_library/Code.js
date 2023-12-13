function validateUserName(userName, site) {
  if (site == "CC") {
    return validateCCUsername(userName);
  }
  if (site == "AC") {
    return validateACUsername(userName);
  }
  if (site == "LC") {
    return validateLCUsername(userName);
  }
  if (site == "FCC") {
    return validateFCCUsername(userName);
  }
}

function validateCCUsername(userName) {
  res = checkUserName("https://www.codechef.com/users/"+userName);
  if (res.getResponseCode() === 200 && res.getContentText().indexOf('"currentUser":"' + userName+ '"') !== -1) {
    return "Valid";
  } else {
    return "Invalid";
  }
}

function validateACUsername(userName){
  return checkUserName("https://leetcode.com/"+userName).getResponseCode()!==404?"Valid":"Invalid";
}

function validateLCUsername(userName){
  return checkUserName("https://atcoder.jp/users/"+userName).getResponseCode()!==404?"Valid":"Invalid";
}

function validateFCCUsername(userName){
  return checkUserName("https://www.freecodecamp.org/"+userName).getResponseCode()!==404?"Valid":"Invalid";
}

function checkUserName(url){
  var options = {
    "method": "GET",
    'headers': { 'User-Agent': 'PostmanRuntime/7.32.2' },
    "muteHttpExceptions": true
  };
  return fetchHTTPResponse(url,options);
}

function fetchHTTPResponse(url, options) {
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  //Logger.log(options);
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  return response;
}