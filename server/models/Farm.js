// models/Farm.js
import mongoose from "mongoose";

const farmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  cropType: {
    type: String,
    default: ""
  },
  size: {
    value: { type: Number, default: 0 },
    unit: { type: String, enum: ["acres", "hectares"], default: "acres" }
  },
  status: {
    type: String,
    enum: ["active", "inactive", "harvested"],
    default: "active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove any strict validation that might be causing issues
farmSchema.set('strict', false);

const Farm = mongoose.model("Farm", farmSchema);
export default Farm;