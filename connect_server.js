var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/spotlite";


var app, express;

//establish a server
express = require("express");

app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// findItem("aiodjoijd");

//1. save one user.
app.post("/insertUser", function (request, response) {
    var result = insertItem(request.body.username, request.body.password, request.body.nickname, request.body.email, request.body.phone, request.body.score);
    response.send(result);
});

//2. The front end want to get a user information.
app.post("/competitorCandidates", function (request, response) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").find({challengee : "test2", isMatched : false}).toArray(function(err, result) {
            console.log("shiji hello");
            if (err) throw err;
            if(result == null){
                console.log("this is null");
            }
            else{
                console.log("find and fetch some items...");
                var arrayName = [];
                for (var i = 0; i < result.length; i++){
                    arrayName[i] = result[i].username;
                }
                // response.send(arrayName);
                var myobj = {username :{$in: arrayName}};
                db.collection("users").find(myobj).toArray(function(err1, result1) {
                    if (err) throw err;

                    console.log("get users");
                    response.send(result1);
                });
                // console.log(result);
            }
            db.close();
        });
    });
});

//3. Check whether the competitor selected by the user is matched or not.
/*
If not, return an empty array,
If yes, return an array of candidates.
 */
app.post("/getCompetitor", function (request, response) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").findOne({username: request.body.challenger, challengee : request.body.challengee, isMatched: true}, function(err, result) {
            // console.log(request.body.username);
            if (err) throw err;
            if(result == null){
                response.send(result);
            }
            else{
                db.collection("Challenger").find({challengee : request.body.challengee, isMatched : false}).toArray(function(err1, result1) {
                    if (err1) throw err1;
                    if(result == null){
                        console.log("this is null");
                    }
                    else{
                        console.log("find and fetch some items...");
                    }
                    response.send(result1);
                });
            }
            db.close();
            response.send(result);
        });
    });
});

//4. The front end want to get a user information.
app.post("/getUser", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {username : request.body.username};
        db.collection("users").findOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log("get one user");
            db.close();
            response.send(result);
        });
    });
});

//5. get daily challenge.
app.post("/getChallenge", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date : request.body.date};
        db.collection("Challenge").findOne(myobj, function(err, result) {
            if (err) throw err;

            db.close();
            response.send(result);
        });
    });
});

//6. get upcoming challenges.
app.post("/getChallenge", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: {$in: ["10-20-2017", "10-21-2017", "10-22-2017", "10-23-2017"]}};
        db.collection("Challenge").find(myobj).toArray(function(err, result) {
            if (err) throw err;

            db.close();
            response.send(result);
        });
    });
});

//7. Check whether this user is approved for today's challenge
app.post("/isApproved", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: response.body.date, username: request.body.username};
        db.collection("Approved").find(myobj).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            response.send(result);
        });
    });
});

//8. Submit challenge idea
app.post("/submitChallenge", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: response.body.date, description: request.body.description, challengeName: request.body.challengeName, img: request.body.img};
        db.collection("Posts").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return "stored";
        });
    });
});

//9. add post
app.post("/insertUser", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {username : request.body.username, post: request.body.image, date: request.body.date, isChallenge: true};
        db.collection("Posts").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return "stored";
        });
    });
});

//start to listen port 8888
app.listen(8888);


//create a collection/another word for table
function createCollection(TableName){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.createCollection(TableName, function(err, res) {
        if (err) throw err;
        console.log("create a table called " + TableName);
        db.close();
      });
    });
}

//Insert one attribute to a collection
function insertItem(username, password, nickname, email, phone, score){
    MongoClient.connect(url, function(err,db) {
       if (err) throw err;
        var myobj = {username : username, password: password, nickname : nickname, email : email, phone : phone, score: score};
        db.collection("users").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return res;
        });
    });
}

//find one attribute from a collection
function findItem(username){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("users").findOne({username : username}, function(err, result) {
        if (err) throw err;
        if(result == null){
            console.log("this is null");
        }
        db.close();
      });
    });
}

//find all records that satisfy our search query.
function findChallengers(username){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").find({username : username}, function(err, result) {
            if (err) throw err;
            if(result == null){
                console.log("this is null");
            }
            else{
                console.log("find and fetch some items...");
            }
            db.close();
            return result;
        });
    });
}

//search the required elements
function search(name){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var query = {name : name};
        db.collection("users").find(query).toArray(function(err, result) {
           if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}
