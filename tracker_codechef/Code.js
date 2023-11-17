var global_token = null;
var global_cookie = null;

function test() {
  //updateRatingsNew("team");
  updateRatingsNew("ng");
}

function updateRatingsNew(entity) {
  const sheet = getSheet("ratings-" + entity);
  let lastRow = sheet.getLastRow();
  for (var i = 2; i <= lastRow; i++) {
    var student = sheet.getRange("A" + i).getValue();
    var rating = fetchRating(student);
    var ratingRange = sheet.getRange("C" + i);
    //console.log(ratingRange);
    ratingRange.setValue(rating? rating : "NA")
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

function getRating(){
  var rating = importRating(getSheet('ratings-team').getRange(2,7).getValue());
  Logger.log("rating" + rating);
}

function importRating(url) {
  var html, content = '';
  Logger.log("url" + url);
  var response = UrlFetchApp.fetch(url);
  if (response) {
    html = response.getContentText();
    //Logger.log(html);
    //(/<span id="product_price" itemprop="price">(.*)<\/span>/gi)[0]
    //"<span[^>]*>(.*?)</span>"
    if (html) content = html.match(/<div class="rating-number">(.*?)\/div>/gi)[0];
    content.replace('<[^>]*>', '');
  }
  return content;
}


function updateContestTabs() {
  var contests = readContests();
  // Logger.log("Contests:- " + readContests())
  for (var i in contests) {
    // Logger.log(contests[i])
    var contest = contests[i];
    if (getSheet(contest) == null) {
      insertNewTab(contest);
      Logger.log("inserted:-"+ getSheet(contest).getName());
      addScoreToSheet(fetchRankingsForAContestNew(contest + 'D'), contest);      
      addScoreToSheet(fetchRankingsForAContestNew(contest + 'C'), contest);      
      addScoreToSheet(fetchRankingsForAContestNew(contest + 'B'), contest);      
      addScoreToSheet(fetchRankingsForAContestNew(contest + 'A'), contest);      
    }
  }
}

function insertNewTab(name) {
  ss = getActiveSs().insertSheet();
  ss.setName(name);
}


function updateRatings(scores) {
  var sheet_name = 'ratings';
  var sheet = getSheet(sheet_name);
  var lastRow = sheet.getLastRow();
  var range = sheet.getDataRange();
  var data = range.getValues();
  var new_data = []; 
  //Logger.log(scores);
  for (let j in scores) {
    var score = scores[j];   
    var found = false;
    for (var i=0;i<lastRow;i++) {
      if (score[0] == data[i][0]) {
        data[i][1] = score[1];
        data[i][2] = score[4];
        found = true;
        break;
      }
    }
    if (!found) {
      //Logger.log(score);
      new_data.push([score[0], score[1], score[4]]);
    }
  }  
  //Logger.log(new_data);
  range.setValues(data);  
  if (new_data.length > 0) {
    sheet.getRange(lastRow + 1,1,new_data.length, new_data[0].length).setValues(new_data);
  }
}

function addScoreToSheet(scores, sheet_name) {
  // Logger.log("Sheet_name :-"+sheet_name)
  var sheet = getSheet(sheet_name);
  // Logger.log(sheet.getName());
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1,1,scores.length, scores[0].length).setValues(scores);
    updateRatings(scores);
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

function fetchToken() {
  var client_id = '63f2e829d76ce9861b0a31d3cfaad0c1';
  var client_secret = '2ac2424e499fca978266da5221d26f64';
  var data = {
    "grant_type":"client_credentials" , 
    "scope":"public", 
    "client_id": client_id,
    "client_secret":client_secret,
  };  
  var payload = JSON.stringify(data);
  var options = {
    "method" : "POST",
    "contentType" : "application/json",
    "payload" : payload
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
    "method" : "GET",
  };
  login_page = fetchHTTPResponse(siteURL, options);  
  Logger.log(login_page);
  let cookie = fetchCookie(login_page);
  let csrf = login_page.getContentText().split("csrfToken = \"")[1].split("\";")[0];
  Logger.log(csrf);    
  Logger.log(cookie);    
  return [csrf, cookie];
}

function fetchRankingsNew(contest_code, page) {
  var itemsPerPage = 150;
  var order="asc";
  var sortBy="rank";
  var apiCall = 'rankings/' + contest_code + "?itemsPerPage=" + itemsPerPage + "&order=" + order + "&sortBy=" + sortBy + "&page=" 
    + page;
  if (global_token == null) {
    var [token, cookie]= fetchCSRFToken(contest_code);
    global_token = token;
    global_cookie = cookie;
  } else {
    var token = global_token;
    var cookie = global_cookie;
  }
  
  var options = {
    'method' : 'GET',
    'headers': {'X-Csrf-Token': token, 'Cookie':cookie}, 
    muteHttpExceptions: true
  };

  var url = "https://www.codechef.com/api/" + apiCall;
 
  Logger.log("token = " + token); //log data to logger
  return fetchJsonFromURL(url, options);
}

function fetchRankingsForAContestNew(contest_code) {
    page = 1;
    var contest_rank = [];   
    do {
    var ranking = fetchRankingsNew(contest_code, page);
    Logger.log(ranking);
    Logger.log("In fetchRankingsForAContestNew: %s", ranking);
    var ranks = ranking.list;
    for (let i in ranks) {
      value = ranks[i];   
      contest_rank.push([value.user_handle, contest_code, value.score, value.rank, value.rating]);
    }
    page+=1;
    Utilities.sleep(10000);
  } while (ranks.length==150);
  // Logger.log(contest_rank)
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
  // Logger.log(result);
  return result;
}

function readContests() {
  var contests = fetchCellValues('contests', "A:A");
  // Logger.log(contests);
  return contests;
}
