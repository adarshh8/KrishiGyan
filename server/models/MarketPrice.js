// models/MarketPrice.js
import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  market: String,
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: "INR/kg"
  },
  quality: {
    type: String,
    enum: ["grade-a", "grade-b", "grade-c", "organic"]
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: String,
  trend: {
    type: String,
    enum: ["increasing", "decreasing", "stable"]
  }
});

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);
export default MarketPrice;