// routes/schemeRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
  getSchemes, 
  getEligibleSchemes, 
  getSchemeDetails 
} from "../controllers/schemeController.js";

const router = express.Router();

router.get("/", verifyToken, getSchemes);
router.post("/eligible", verifyToken, getEligibleSchemes);
router.get("/:schemeId", verifyToken, getSchemeDetails);

export default router;