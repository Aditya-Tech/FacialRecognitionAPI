var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongodb = require("mongodb"),
  ObjectID = mongodb.ObjectID,
  db,
  AWS = require('aws-sdk'),
  uuid = require('node-uuid'),
  fs = require('fs-extra'),
  path = require('path');


// AWS.config = new AWS.Config();
// AWS.config.accessKeyId = process.env.S3_KEY;
// AWS.config.secretAccessKey = process.env.S3_SECRET;
// AWS.config.accessKeyId = process.env.S3_KEY
// AWS.config.secretAccessKey = "L9mH633mVLD1oubYah78EkNFHFVVY4pK4fM1cHvk";
var rekognition = new AWS.Rekognition({region : "us-east-1"});

const MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect("mongodb://aditya:aditya@ds129374.mlab.com:29374/patiant-data", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = database;
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}


app.get("/getAllPatients", function(req, res) {
	db.collection("patient-data").find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get patients.");
    } else {
      res.status(200).json(docs);
    }
  });
});


app.post("/register", function(req, res) {

  // Connect to AWS rekognition
  rekognition.indexFaces({
    "CollectionId" : "TestCollection",
    "DetectionAttributes" : ["ALL"],
    "Image" : {
      "Bytes" : new Buffer(req.body.image, 'base64')
    } 
  }, function(err, data) {
    if (err) {
      console.log("Error connecting to Rekognition " + err);
      process.exit(1);
    } else {
      var faceId = data.FaceRecords[0].Face.ImageId;      
      console.log("Face Id is: " + faceId);

      // Query database to check if patient exists
      db.collection("patient-data").findOne({_id : faceId}, function(err, doc) {
        if (err) {
          console.log("Error connecting to collection " + err);
          res.status(500);
        } else {
          if (doc == null) {    // If patient doesn't exist, create a new record and return the id
            db.collection("patient-data").insertOne({_id : faceId}, function(err, doc) {
              if (err) {
                console.log("Error creating patient! " + err);
              } else {
                console.log("Created new patient record for id: " + faceId);
              }
            });
            res.status(300).json(faceId);    // Tells the client that the user still must enter information
          } else {              // If patient exists, return information
            console.log("Found patient: ");
            console.log(doc);
            res.status(200).json(doc);
          }
        }
      });
    }
  });


});


app.get("/recognize/:id", function(req, res) {
	db.collection("patient-data").findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get patient");
    } else {
      res.status(200).json(doc);
    }
  });
});


app.put("/editPatient/:id", function(req, res) {
  var updated = req.body;
  delete updated;

  db.collection("patient-data").updateOne({_id: new ObjectID(req.params.id)}, updated, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update patient");
    } else {
      res.status(204).end();
    }
  });
});

