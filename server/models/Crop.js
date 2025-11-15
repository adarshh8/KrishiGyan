// models/Crop.js
import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  localName: {
    type: String, // Malayalam name
    required: true
  },
  season: {
    type: String,
    enum: ["kharif", "rabi", "zaid", "perennial"],
    required: true
  },
  suitableSoil: [{
    type: String,
    enum: ["clay", "sandy", "loamy", "laterite", "alluvial"]
  }],
  waterRequirements: {
    type: String,
    enum: ["low", "medium", "high"]
  },
  duration: {
    type: Number, // in days
    required: true
  },
  yieldPerAcre: {
    min: Number,
    max: Number,
    unit: String
  },
  marketPriceRange: {
    min: Number,
    max: Number,
    unit: { type: String, default: "INR/kg" }
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  image: String,
  description: String,
  benefits: [String],
  challenges: [String]
});

const Crop = mongoose.model("Crop", cropSchema);
export default Crop;