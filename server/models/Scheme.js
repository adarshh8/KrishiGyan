// models/Scheme.js
import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  department: String,
  eligibility: [String],
  benefits: [String],
  documentsRequired: [String],
  applicationProcess: [String],
  deadline: Date,
  contact: {
    phone: String,
    email: String,
    website: String
  },
  category: {
    type: String,
    enum: ["subsidy", "loan", "insurance", "training", "equipment"]
  },
  state: {
    type: String,
    default: "Kerala"
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Scheme = mongoose.model("Scheme", schemeSchema);
export default Scheme;