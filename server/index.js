// index.js - UPDATED
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import farmRoutes from "./routes/farmRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import cropRoutes from "./routes/cropRoutes.js"; // NEW
import pestRoutes from "./routes/pestRoutes.js"; // NEW
import marketRoutes from "./routes/marketRoutes.js"; // NEW
import schemeRoutes from "./routes/schemeRoutes.js"; // NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/crops", cropRoutes); // NEW
app.use("/api/pests", pestRoutes); // NEW
app.use("/api/market", marketRoutes); // NEW
app.use("/api/schemes", schemeRoutes); // NEW

app.get("/", (req, res) => {
  res.send("🌾 AI Assistance for Kerala Farmers - Backend running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
    features: [
      "Authentication",
      "Farm Management", 
      "Weather Data",
      "Crop Recommendations",
      "Pest & Disease Database",
      "Market Prices",
      "Government Schemes"
    ]
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌾 AI Kerala Farmers Platform - Day 8 Features Active`);
});