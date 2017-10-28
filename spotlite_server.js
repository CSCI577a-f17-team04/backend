var mysql = require('mysql');

var app, express;

//establish a server
express = require("express");

app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "SpotLite"
});

con.connect({multipleStatements: true}, function (err) {
  if (err) throw err;
});

//1. save one user.
app.get("/insertUser", function (request, response) {
  if (err) throw err;
  console.log("Connected!");

  userInfo = {"username" : "test4",
    "password" : "password",
    "nickname" : "fuck U",
    "email" : "abc@gmail.com",
    "phone" : "2137161111",
    "score" : "0"};

  var sql = "INSERT INTO Users SET ?";
  con.query(sql, userInfo, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    response.send(result);
  });
});

//2. The front end want to get a user information.
app.post("/competitorCandidates", function (request, response) {

  // MongoClient.connect(url, function(err, db) {
  //find people who challenge the given user but haven;t matched yet.
  con.query("SELECT * FROM Challenger WHERE challengee = ? AND date = ? AND isMatched = false", [request.body.challengee, request.body.date], function (err, result, fields) {
    if (err) throw err;
    if(result.length == 0){
      console.log("this is null");
      response.send(result);
    }
    else{
      console.log("find and fetch some items...");
      var arrayName = [];

      //build the query
      var query = "SELECT * FROM Users WHERE (username = \'\'";
      for (var i = 0; i < result.length; i++){
        query += " OR username = '" + result[i].challenger + "'";
      }
      query += ")";

      //get the given user's information from user table
      con.query(query, function (err1, result1, fields) {
        if (err1) throw err1;

        response.send(result1);
      });
    }
  });
  // });
});

/*3. When the user picks up a competitor, the system will judege whether it is legal
If the picked person has matched with others, we will forbid this match process and renturn an updated competitor candidate list.
*/
app.post("/getCompetitor", function (request, response) {
  con.query("SELECT * FROM Challenger WHERE challenger = ? AND date = ? AND isMatched = true", [request.body.challenger, request.body.date], function (err, result, fields) {
    // console.log(request.body.username);
    if (err) throw err;
    if(result == null){
      response.send(["true"]);
    }
    else{
      //The candidate cannot be either a challenger or challengee in any row.
      con.query("SELECT * FROM Challenger WHERE challengee = ? AND date = ? AND isMatched = false", [request.body.challengee, request.body.date], function (err1, result1, fields) {
        if (err1) throw err1;

        var candidates = [];
        var count = 0;

        var process = function (userName) {
          con.query("SELECT * FROM Challenger WHERE (challengee = ? OR challenger = ?) AND isMatched = true", [userName, userName, request.body.date], function (err2, result2, fields) {

            if (err2) throw err2;
            if(result2.length == 0){

              con.query("SELECT * FROM Users WhERE username = ?", [userName], function (err3, result3) {
                console.log(userName)
                if (err3) throw err3;
                count += 1;
                console.log(result3)
                candidates.push(result3[0]);
                if (count == arrayLength){
                  response.send(candidates);
                }
              });
            }
            else
              arrayLength -= 1;


          });
        };

        if(result1.length == 0){
          console.log("this is null");
        }
        else{
          var arrayLength = result1.length;
          console.log("find and fetch some items...");
          for (var i = 0; i < result1.length; i++){
            //call a call back nested function
            var userName = result1[i].challenger;
            process(userName);
          }
        }
      });
    }
  });
});

//4. The front end want to get a user information.
app.post("/getUser", function (request, response) {
  con.query("SELECT * FROM users WHERE username = '" + request.body.username + "'", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    console.log("get one user");
    response.send(result);
  });
});

//5. get daily challenge.
app.post("/getChallenge", function (request, response) {
  con.query("SELECT * FROM Challenge WHERE date = ?", request.body.date, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    response.send(result[0]);
  });
});

//6. get upcoming challenges.
app.get("/getUpcomingChallenges", function (request, response) {
  console.log("get upcoming challenges")
  var dates = ["10-21-2017", "10-22-2017", "10-23-2017", "10-24-2017", "10-25-2017"];

  //build the query
  var query = "SELECT * FROM Challenge WHERE (date = \'\'";
  for (var i = 0; i < dates.length; i++){
    query += " OR date = '" + dates[i] + "'";
  }
  query += ")";

  con.query(query, function (err, result, fields) {
    if (err) throw err;
    response.send(result);
  });
});

//7. Check whether this user is approved for today's challenge
app.post("/approved", function (request, response) {
  var myobj = {date: response.body.date, username: request.body.username};
  con.query("SELECT * FROM Approved WHERE date = ? AND username = ?", [request.body.date, request.body.username], function (err, result, field) {
    if (err) throw err;
    response.send(result);
  })
});

//8. Submit challenge idea
app.get("/submitIdea", function (request, response) {
  console.log("Submit a suggestion");
  var myobj = {date: request.body.date, description: request.body.description, challengeName: request.body.challengeName, img: request.body.img};
  con.query("INSERT INTO Suggestions SET ?", myobj, function (err, result, field) {
    if (err) throw err;
    console.log("Insert 1 element correctly");
    response.send(["true"]);
  });
});

//9. add post
app.post("/addPost", function (request, response) {
  var myobj = {username : request.body.username, post: request.body.image, date: request.body.date, isChallenge: request.body.isChallenge};
  con.query("Insert Into Posts SET ?", myobj, function (err, result, field) {
    if (err) throw err;
    console.log("post successfully");
    response.send(["true"]);
  })
});

//1o. Use a table to store all the phone numbers that a given user challenged today.
app.get("/challengedPhone", function (request, response) {
  console.log("insert challengedPhone");
  var phones = ["123123", "456456", '789789', '000000'];
  for (var i = 0; i < phones.length; i++){
    var myobj = {username : "test2", phone: phones[i], date: "10-20-2010"};
    con.query("INSERT INTO ChallengedPhone SET ?", myobj, function(err, res, field) {
      if (err) throw err;
      console.log("Insert 1 element correctly");
      console.log("stored");
    });
  }
  response.send(["true"]);
});


//create a table
function createTable(){
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE SpotLite", function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
  });
}

//start to listen port 8888
app.listen(8888);