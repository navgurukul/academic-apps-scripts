const axios = require("axios");
const cheerio = require("cheerio");

let contest_name;
contest_name = "START107";
let myArray;
myArray = [];
let category = ["A", "B", "C", "D"];
let problemsSolvedDuringTheContest;
problemsSolvedDuringTheContest = [];
let problems_up_solved;
problems_up_solved = [];
let username = "mahimadhomane2";
const fetchQuestionsData = async (contesTName) => {
  for (let q = 0; q < 4; q++) {
    const apiUrl = `https://www.codechef.com/api/contests/${contest_name}${category[q]}/`;

    try {
      const response = await axios.get(apiUrl);
      const jsonData = response.data;
      const data = jsonData.problems;

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          let valueToAppend = data[key].code;
          if (!myArray.includes(valueToAppend)) {
            myArray.push(valueToAppend);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  }
};

const getUsernameSubmissions = async (username) => {
  try {
    const url = `https://www.codechef.com/users/${username}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const loaded_html = cheerio.load(html);
      const contentDiv = loaded_html('div.content:has(a[href*="START107"])');
      if (contentDiv !== null) {
        const contentHTML = contentDiv.html();

        myArray.forEach((item) => {
          if (contentHTML.includes(item)) {
            problemsSolvedDuringTheContest.push(item);
          }
        });
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};

const getSubmissionsAfterTheContest = async (usernamee, problemCode) => {
  const mainUrl = `https://www.codechef.com/status/${problemCode}?status=Correct&usernames=${usernamee}`;
  try {
    const response = await axios.get(mainUrl);
    if (response.status === 200) {
      const html = response.data;
      const csrfTokenPattern = /window.csrfToken = "(.*?)"/;
      const csrfTokenMatch = html.match(csrfTokenPattern);

      if (csrfTokenMatch) {
        const csrfToken = csrfTokenMatch[1];
        //console.log(`CSRF Token: ${csrfToken}`);

        const cookies = response.headers["set-cookie"];
        //console.log("Cookies:", cookies);

        const apiUrl = `https://www.codechef.com/api/submissions/PRACTICE/${problemCode}?limit=20&page=0&status=Correct&usernames=${usernamee}&language=`;
        const headers = {
          "x-csrf-token": csrfToken,
          Cookie: cookies.join("; "),
        };

        try {
          const response = await axios.get(apiUrl, { headers });

          let dataPropertyOfResponse = response.data.data;

          if (dataPropertyOfResponse.length !== 0) {
            problems_up_solved.push(problemCode);
          }
        } catch (error) {
          console.error("Error fetching API data:", error.message);
        }
      } else {
        console.log("CSRF Token not found in the JavaScript code.");
      }
    } else {
      console.log(`Failed to fetch the page. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

async function main() {
  await fetchQuestionsData(contest_name);
  await getUsernameSubmissions(username);

  let problems_To_be_checked_for_UPSolve = [];
  myArray.forEach((item) => {
    if (!problemsSolvedDuringTheContest.includes(item)) {
      problems_To_be_checked_for_UPSolve.push(item);
    }
  });

  for (jo = 0; jo < problems_To_be_checked_for_UPSolve.length; jo++) {
    await getSubmissionsAfterTheContest(
      username,
      problems_To_be_checked_for_UPSolve[jo]
    );
  }
  console.log(myArray);
  console.log(problemsSolvedDuringTheContest);
  console.log(problems_up_solved);
}

main();

