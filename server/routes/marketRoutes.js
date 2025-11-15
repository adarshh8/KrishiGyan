// routes/marketRoutes.js - FIXED
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
  getMarketPrices, 
  getPriceTrends 
} from "../controllers/marketController.js";

const router = express.Router();

router.get("/prices", verifyToken, getMarketPrices);
router.get("/trends/:cropName", verifyToken, getPriceTrends); // Remove optional parameter
router.get("/trends/:cropName/:days", verifyToken, getPriceTrends); // Add separate route for days

export default router;