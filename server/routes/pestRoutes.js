// routes/pestRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
  getCropIssues, 
  searchIssues, 
  reportIssue 
} from "../controllers/pestController.js";

const router = express.Router();

router.get("/crop/:cropName", verifyToken, getCropIssues);
router.get("/search/:query", verifyToken, searchIssues);
router.post("/report", verifyToken, reportIssue);

export default router;