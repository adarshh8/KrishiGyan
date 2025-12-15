// index.js - UPDATED FOR LOCAL MONGODB
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import farmRoutes from "./routes/farmRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import pestRoutes from "./routes/pestRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/pests", pestRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("🌾 AI Kerala Farmers Backend Running on LOCAL MongoDB ✅");
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running smoothly",
    database: "Local MongoDB",
    timestamp: new Date().toISOString(),
    features: [
      "Authentication",
      "Farm Management",
      "Weather Data",
      "Crop Recommendations",
      "Pest & Disease Database",
      "Market Prices",
      "Government Schemes",
    ],
  });
});

// 🔥 Connect to MongoDB (env or local fallback)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/krishigyan";
mongoose
  .connect(MONGO_URI)
  .then(() =>
    console.log(`✅ Connected to MongoDB at ${MONGO_URI}`)
  )
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌾 AI Kerala Farmers Platform - Local DB Active");
});
