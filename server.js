var express = require('express'),
  app = express(),
  // port = process.env.PORT || 8000,
  //mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  db;

const MongoClient = require('mongodb').MongoClient
  
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/Patientdb'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect("mongodb://aditya:aditya@ds129374.mlab.com:29374/patiant-data", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});


// var routes = require('./api/routes/RecognitionRoutes');
// routes(app);

// app.listen(port);
// console.log('API Running on port : ' + port);

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/register", function(req, res) {
	res.json("hello")
});

app.post("/register", function(req, res) {
	var patient_info = req.body;
  	patient_info.createDate = new Date();

  	db.collection("patients").insertOne(patient_info, function(err, doc) {
	    if (err) {
	      handleError(res, err.message, "Failed to create new contact.");
	    } else {
	      res.status(201).json(doc.ops[0]);
	    }
  	});
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/recognize/:id", function(req, res) {
});

