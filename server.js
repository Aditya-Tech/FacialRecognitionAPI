var express = require('express'),
  app = express(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  mongodb = require("mongodb"),
  ObjectID = mongodb.ObjectID,
  db,
  AWS = require('aws-sdk'),
  uuid = require('node-uuid'),
  fs = require('fs-extra'),
  path = require('path');


app.use(cors());
AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.ACCESSKEY;
AWS.config.secretAccessKey = process.env.SECRET;
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

  // Begin by checking if a user exists
  rekognition.searchFacesByImage({
    "CollectionId" : "TestCollection",
    "FaceMatchThreshold" : 70,
    "Image" : {
      "Bytes" : new Buffer(req.body.image, 'base64')
    }
  }, function(err, data) {
    console.log(data)
    if (data) {
      // If patient doesn't exist
      console.log(data.FaceMatches.length)
      if (data.FaceMatches.length === 0) {
        rekognition.indexFaces({
          "CollectionId" : "TestCollection",
          "DetectionAttributes" : ["ALL"],
          "Image" : {
            "Bytes" : new Buffer(req.body.image, 'base64')
          }
        }, function(err, data) {          
          if (err) {
            console.log("Error adding patient to Rekognition " + err);
            process.exit(1);
          } else {
            var newId = data.FaceRecords[0].Face.ImageId;
            db.collection("patient-data").insertOne({_id : newId}, function(err) {
              if (err) {
                console.log("Error adding patient! " + err);
                process.exit(1);
              }
              
              res.status(300).json({"_id" : newId });
            });            
          }
        });        
      } else {

        for (var i = 0; i < data.FaceMatches.length; i++) {   // Print out similar faces for reference
          console.log(data.FaceMatches[i].Face);
          console.log(data.FaceMatches[i].Face.Confidence);        
        }
  
        var matchedFaceId = data.FaceMatches[0].Face.ImageId;  // Get image id of most similar face, we'll use this to query db
        db.collection("patient-data").findOne({_id : matchedFaceId}, function(err, doc) {
          if (err) {
            console.log("Error connecting to mongodb " + err);
            process.exit(1);
          } else {
            console.log(data.FaceMatches[0].Face.Confidence);
            res.send(doc)
          }
        });
      }
            
    }
  });
});

// Pass id of face via
// medications: something, etc }   DO NOT INCLUDE AN ID
app.put("/register", function(req, res) {
  db.collection("patient-data").updateOne({_id : req.body.id}, req.body, function(err, data) {
    if (err) {
      console.log("There was an error updating a record " + err);
    } else {
      console.log(req.body); 
      res.send(true);
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


app.get("/reset", function(req, res) {
  db.collection.remove("patient-data");
  rekognition.deleteCollection({"CollectionId" : config.collectionName}, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  })

  rekognition.createCollection( { "CollectionId": config.collectionName }, function(err, data) {
    if (err) {
    console.log(err, err.stack); // an error occurred
    } else {
    console.log(data);           // successful response
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
