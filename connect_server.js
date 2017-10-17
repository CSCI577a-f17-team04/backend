var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/spotlite";


var app, express;

//establish a server
express = require("express");

app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


findItem("aiodjoijd");

//save one user".
app.post("/insertElement", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {email : request.body.email, name: request.body.name, phone : request.body.phone};
        db.collection("users").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
        });
    });
    response.send("saved");
});

//The front end want to get a user information".
app.post("/getUser", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {name : request.body.name};
        db.collection("users").findOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log("get one user");
            db.close();
            response.send(result);
        });
    });
});


app.listen(8888);


//create a collection/another word for table
function createCollection(TableName){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.createCollection(TableName, function(err, res) {
        if (err) throw err;
        console.log("create users table");
        db.close();
      });
    });
}

//Insert one attribute to a collection
function insertItem(username, password, nickname, email, phone, starttime, score, paired, pictureconfirmed, invitation){
    MongoClient.connect(url, function(err,db) {
       if (err) throw err;
        var myobj = {username : username, password: password, nickname : nickname, email : email, phone : phone, starttime: starttime, score: score, paired: paired, pictureconfirmed: pictureconfirmed, invitation: invitation };
        db.collection("users").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
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
