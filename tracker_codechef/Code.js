var global_token = null;
var global_cookie = null;

function test() {
  //updateRatingsNew("team");
  //updateStudentData('START109');
  Logger.log(fetchRating('vijayalakshmi23'));
}

function updateRatingForEveryOne() {
  //updateRatings('team');
  updateRatings('ng');
}

function updateRatings(entity) {
  const sheet = getSheet("ratings-" + entity);
  let lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    var student = sheet.getRange("A" + i).getValue();
    var rating = fetchRating(student);
    var ratingRange = sheet.getRange("B" + i);
    //console.log(ratingRange);
    ratingRange.setValue(rating ? rating : "NA")
    console.log("Student = " + student + " Rating = " + rating);
    Utilities.sleep(1000);
  }
}

function fetchRating(user) {
  let ratingURL = "https://www.codechef.com/users/" + user;
  var options = {
    "method": "GET",
    'headers': {'User-Agent': 'PostmanRuntime/7.32.2'}, 
    "muteHttpExceptions": true
  };
  rating_page = fetchHTTPResponse(ratingURL, options);
  //console.log(rating_page.getContentText());
  const $ = Cheerio.load(rating_page.getContentText());
  let rating = ($('div.content > div:first-of-type >').text()).split(" ")[0].split("(")[0]
  if (rating.indexOf('?') != -1) {
    rating = rating.split("?")[0];
  } 
  return rating;
}

function maxRank(saved_data, contest_code) {
  let saved_contest_ranks = [];
  let saved_contest_data = [];
  if (saved_data) {
    saved_contest_data = saved_data.filter((el) => el[0] == contest_code);
    saved_contest_ranks = saved_contest_data.map((el) => el[2]);
  }
  return saved_contest_ranks.reduce((a, b) => Math.max(a, b), 0);
}

function updateStudentData(contest) {
  let saved_data = fetchCellValues(contest, "B:D", true);
  var contest_suffixes = ['D', 'C', 'B', 'A'];
  for (var i in contest_suffixes) {
    contest_suffix = contest_suffixes[i];
    let contest_code = contest + contest_suffix;
    let max_rank = maxRank(saved_data, contest_code);
    let contest_ranks = fetchRankingsForAContest(contest_code, max_rank + 1);
    if (contest_ranks.length > 0)
      addScoreToSheet(contest_ranks, contest);
  }
}

function readPendingContests() {
  return readContests("A:A");
}

function readDoneContests() {
  return readContests("B:B");
}

function updateDoneContest(contest) {
  var sheet = getSheet('contests');
  var tf = sheet.createTextFinder(contest);
  var all = tf.findAll();
  for (var i = 0; i < all.length; i++) {
    var range = sheet.getRange(all[i].getA1Notation());
    range.deleteCells(SpreadsheetApp.Dimension.COLUMNS);
  }
  addDataToSheet([["", contest]], 'contests');
}

function updateContestTabs() {
  var contests = readPendingContests();
  for (var i in contests) {
    var contest = contests[i];
    if (getSheet(contest) == null) {
      insertNewTab(contest);
      Logger.log("inserted:-" + getSheet(contest).getName());
    }
    updateStudentData(contest);
    updateDoneContest(contest);
  }
}

function insertNewTab(name) {
  SpreadsheetApp.flush();
  ss = getActiveSs().insertSheet();
  SpreadsheetApp.flush();
  ss.setName(name);
}

function addScoreToSheet(scores, sheet_name) {
  addDataToSheet(scores, sheet_name);
}

function addDataToSheet(data, sheet_name) {
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}

function fetchJsonFromURL(url, options) {
  Logger.log("In fetchJsonFromURL: Fetching url - %s", url);
  //Logger.log(options);
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText(); // get the response content as text
  return JSON.parse(json); //parse text into json
}

function fetchHTTPResponse(url, options) {
  Logger.log("In fetchHTTPResponse: Fetching url - %s", url);
  //Logger.log(options);
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  return response;
}

function fetchToken() {
  var client_id = '63f2e829d76ce9861b0a31d3cfaad0c1';
  var client_secret = '2ac2424e499fca978266da5221d26f64';
  var data = {
    "grant_type": "client_credentials",
    "scope": "public",
    "client_id": client_id,
    "client_secret": client_secret,
  };
  var payload = JSON.stringify(data);
  var options = {
    "method": "POST",
    "contentType": "application/json",
    "payload": payload
  };
  var url = "https://api.codechef.com/oauth/token";
  return fetchJsonFromURL(url, options).result.data.access_token;
}

function fetchCookie(response) {
  headers = response.getAllHeaders();
  cookies = headers['Set-Cookie'];
  return (cookies);
}


function fetchCSRFToken(contest_code) {
  siteURL = "https://www.codechef.com/rankings/" + contest_code;
  var options = {
    "method": "GET",
  };
  login_page = fetchHTTPResponse(siteURL, options);
  let cookie = fetchCookie(login_page);
  let csrf = login_page.getContentText().split("csrfToken = \"")[1].split("\";")[0];
  return [csrf, cookie];
}

function fetchRankings(contest_code, page, itemsPerPage) {
  var order = "asc";
  var sortBy = "rank";
  var apiCall = 'rankings/' + contest_code + "?itemsPerPage=" + itemsPerPage + "&order=" + order + "&sortBy=" + sortBy + "&page="
    + page;
  if (global_token == null) {
    var [token, cookie] = fetchCSRFToken(contest_code);
    Logger.log("token = " + token); //log data to logger
    global_token = token;
    global_cookie = cookie;
  } else {
    var token = global_token;
    var cookie = global_cookie;
  }

  var options = {
    'method': 'GET',
    'headers': { 'X-Csrf-Token': token, 'Cookie': cookie },
    muteHttpExceptions: true
  };

  var url = "https://www.codechef.com/api/" + apiCall;
  return fetchJsonFromURL(url, options);
}

function fetchRankingsForAContest(contest_code, start_rank) {
  var itemsPerPage = 150;
  page = Math.floor(start_rank / itemsPerPage + 1);
  var contest_rank = [];
  do {
    var ranking = fetchRankings(contest_code, page, itemsPerPage);
    let totalItems = ranking.totalItems;
    while (totalItems % itemsPerPage == 0) {
      itemsPerPage--;
    }
    Logger.log("In fetchRankingsForAContest: %s", ranking.totalItems);
    Logger.log("In fetchRankingsForAContest: %s", itemsPerPage);
    var ranks = ranking.list;
    for (let i in ranks) {
      value = ranks[i];
      if (value.rank < start_rank) {
        console.log(contest_code + ": This value was already saved! " + value.user_handle);
        continue;
      }
      contest_rank.push([value.user_handle, contest_code, value.score, value.rank, value.rating]);
    }
    console.log(contest_rank.length);
    page += 1;
    Utilities.sleep(5000);
  } while (ranks.length == itemsPerPage);
  Logger.log(ranks.length)
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

function fetchCellValues(sheet_name, range, make_2d = false) {
  var values = fetchValuesInRange(sheet_name, range);
  var result = [];
  for (var row in values) {
    var inner = [];
    for (var col in values[row]) {
      if (values[row][col]) {
        if (make_2d) {
          inner.push(values[row][col]);
        } else {
          result.push(values[row][col]);
        }
      }
    }
    if (make_2d) {
      result.push(inner);
    }
  }
  // Logger.log(result);
  return result;
}

function readContests(range) {
  var contests = fetchCellValues('contests', range);
  return contests;
}
