var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

// insertItem();
findItem();

//create a collection/another word for table
function createTable(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("create users table");
        db.close();
      });
    });
}

//Insert one attribute to a collection
function insertItem(){
    MongoClient.connect(url, function(err,db){
        if (err) throw err;
        var myobj = {name : "Alex", address : "Ellendale"};
        db.collection("users").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
        });
    });
}

//find one attribute from a collection
function findItem(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("users").findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });
}