// models/PestDisease.js
import mongoose from "mongoose";

const pestDiseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  localName: String,
  type: {
    type: String,
    enum: ["pest", "disease", "deficiency"],
    required: true
  },
  affectedCrops: [{
    type: String,
    required: true
  }],
  symptoms: [String],
  causes: [String],
  prevention: [String],
  organicTreatment: [String],
  chemicalTreatment: [String],
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"]
  },
  season: [String],
  image: String,
  emergencyContact: {
    department: String,
    phone: String
  }
});

const PestDisease = mongoose.model("PestDisease", pestDiseaseSchema);
export default PestDisease;