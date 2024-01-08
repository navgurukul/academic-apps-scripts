function validateCCUsername(userName) {
  res = checkUserName("https://www.codechef.com/users/" + userName);
  if (res.getResponseCode() === 200 && res.getContentText().indexOf('"currentUser":"' + userName + '"') !== -1) {
    return "Valid";
  } else {
    return "Invalid";
  }
}

function validateLCUsername(userName) {
  return checkUserName("https://leetcode.com/" + userName).getResponseCode() !== 404 ? "Valid" : "Invalid";
}

function validateACUsername(userName) {
  return checkUserName("https://atcoder.jp/users/" + userName).getResponseCode() !== 404 ? "Valid" : "Invalid";
}

function validateFCCUsername(userName) {
  return checkUserName('https://api.freecodecamp.org/api/users/get-public-profile?username=' + userName).getResponseCode() !== 404 ? "Valid" : "Invalid";
}

function checkUserName(url) {
  var options = {
    "method": "GET",
    'headers': { 'User-Agent': 'PostmanRuntime/7.32.2' },
    "muteHttpExceptions": true
  };
  return fetchHTTPResponse(url, options);
}

function fetchHTTPResponse(url, options) {
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  return response;
}


function test() {
  var user = "cksurya";

  Logger.log(validateACUsername(user));
}