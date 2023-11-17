function fetchRating(user) {
  let ratingURL = "https://atcoder.jp/users/" + user;
  var options = {
    "method": "GET",
    "muteHttpExceptions": true
  };
  rating_page = fetchHTTPResponse(ratingURL, options);
  const $ = Cheerio.load(rating_page.getContentText());
  //=IMPORTXML(B427, "//*[@id='main-container']/div[1]/div[3]/table/tbody/tr[2]/td/span[1]", "en_US" )
  let rating = ($('#main-container > div:first-of-type > div:nth-of-type(3) > table > tbody > tr:nth-of-type(2) > td > span:first-of-type').text());
  console.log(user)
  return rating;
}

function updateRatings(entity) {
  const sheet = getSheet(entity);
  let lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    var student = sheet.getRange("A" + i).getValue();
    var rating = fetchRating(student);
    var ratingRange = sheet.getRange("C" + i);
    ratingRange.setValue(rating? rating : "NA")
    console.log("Student" + student + " Rating = " + rating);    
  }
}
 
function updateStudentRatings() {
  updateRatings('students');
}


function updateTeamRatings() {
  updateRatings('team');
}

function updateContestTabs() {
  var contests = readContests();
  for (var i in contests) {
    contest = contests[i];
    if (getSheet(contest) == null) {
      insertNewTab(contest);
      addScoreToSheet(fetchRankingsForAContest(contest), contest);
      updateRatings('students');
    }
  }
}

function insertNewTab(name) {
  ss = getActiveSs().insertSheet();
  ss.setName(name);
}

function addScoreToSheet(scores, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, scores.length, scores[0].length).setValues(scores);
}

function fetchJsonFromURL(url, options) {
  Logger.log("In fetchJsonFromURL: Fetching url - %s", url);
  var response = fetchHTTPResponse(url, options);
  var json = response.getContentText(); //get the response content as text
  return JSON.parse(json); //parse text into json
}

function fetchHTTPResponse(url, options) {
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  //Logger.log(options);
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  return response;
}

function fetchCookie(response) {
  headers = response.getAllHeaders();
  //Logger.log(headers);
  cookie = headers['Set-Cookie'];
  cookie[0] = cookie[0].split(";")[0];
  cookie[1] = cookie[1].split(";")[0];
  cookie = cookie.join(";");
  return cookie;
}

function fetchCSRFToken() {
  loginURL = "https://atcoder.jp/login";
  var options = {
    "method": "GET",
  };
  login_page = fetchHTTPResponse(loginURL, options);
  let cookie = fetchCookie(login_page);
  let csrf = decodeURIComponent(cookie.split("csrf_token")[1].split("%00")[0]).split(":")[1];
  Logger.log(csrf);
  return [csrf, cookie];
}

function fetchAuthenticatedCookie() {
  let [csrf, cookie] = fetchCSRFToken();
  var dataHeaders = {
    'Cookie': cookie
  };
  loginURL = "https://atcoder.jp/login";
  var data = {
    "username": "navgurukul",
    "password": "navgurukul123",
    "csrf_token": csrf,
  };
  var options = {
    "method": "POST",
    'headers': dataHeaders,
    "payload": data,
    'followRedirects': false,
    muteHttpExceptions: true
  };
  response = fetchHTTPResponse(loginURL, options);
  return fetchCookie(response);
}

function fetchRankings(contest_code) {
  var apiCall = 'contests/' + contest_code + "/standings/json";
  var cookie = fetchAuthenticatedCookie();
  var dataHeaders = {
    'Cookie': cookie
  };
  var options = {
    'method': 'GET',
    'headers': dataHeaders,
    muteHttpExceptions: true
  };
  var url = "https://atcoder.jp/" + apiCall;
  return fetchJsonFromURL(url, options);
}

function fetchRankingsForAContest(contest_code) {
  contest_rank = [];
  var ranking = fetchRankings(contest_code);
  var ranks = ranking.StandingsData;
  Logger.log(ranks);
  for (let i in ranks) {
    /*
            "Rank": 1,
            "Additional": null,
            "UserName": "うさぎ*",
            "UserScreenName": "hos_lyric",
            "UserIsDeleted": false,
            "Affiliation": " Rabbit House",
            "Country": "JP",
            "Rating": 3195,
            "OldRating": 3195,
            "IsRated": false,
            "IsTeam": false,
            "Competitions": 28,
            "AtCoderRank": 27,
            "TotalResult": {
                "Count": 10,
                "Accepted": 8,
                "Penalty": 1,
                "Score": 312500,
                "Elapsed": 2238000000000,
                "Frozen": false,
                "Additional": null
            }
    */
    value = ranks[i];
    //Logger.log(value);
    contest_rank.push([value.UserScreenName, value.UserName, value.Rank, value.TotalResult.Accepted, value.TotalResult.Score, value.Rating, value.IsRated]);
  }
  return contest_rank;
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

function readContests() {
  var contests = fetchCellValues('contests', "A:A");
  //Logger.log(contests);
  return contests;
}
