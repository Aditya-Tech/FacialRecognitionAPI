'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PatientSchema = new Schema({
  Patient: {
    CurrentMedications: [{
      MedicationName: String,
      Dosage: String,
      PrescribingDoctor: String,
      TimesMedicineTaken: String
      //required: false
    }],
    CurrentAllergies: [{Allergy: String}],
    MedicalHistory: [{Condition: String}],
    Created_date: {
      type: Date,
      default: Date.now
    }
  }
});
module.exports = mongoose.model('PatientInfo', PatientSchema);