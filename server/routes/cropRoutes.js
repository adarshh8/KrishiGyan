// routes/cropRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
  getCropRecommendations, 
  getCropDetails, 
  searchCrops 
} from "../controllers/cropController.js";

const router = express.Router();

router.post("/recommendations", verifyToken, getCropRecommendations);
router.get("/search/:query", verifyToken, searchCrops);
router.get("/:cropId", verifyToken, getCropDetails);

export default router;