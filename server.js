var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongodb = require("mongodb"),
  ObjectID = mongodb.ObjectID,
  db;


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
	db.collection("patients").find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get patients.");
    } else {
      res.status(200).json(docs);
    }
  });
});


app.post("/register/:id", function(req, res) {
	db.collection("patients").findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
	    if (err) {
	      handleError(res, err.message, "Failed to get patient");
	    } else {
	    	var patient_info = req.body;
		  	patient_info.createDate = new Date();
		  	db.collection("patients").insertOne(patient_info, function(err, doc) {
			    if (err) {
			      handleError(res, err.message, "Failed to create new patient.");
			    } else {
			      res.status(201).json(doc.ops[0]);
			    }
		  	});
	    }
  	});
});


app.get("/recognize/:id", function(req, res) {
	db.collection("patients").findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
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

  db.collection("patients").updateOne({_id: new ObjectID(req.params.id)}, updated, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update patient");
    } else {
      res.status(204).end();
    }
  });
});

