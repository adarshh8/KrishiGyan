// controllers/pestController.js
import PestDisease from "../models/PestDisease.js";

// 🐛 Get pests/diseases for specific crop
export const getCropIssues = async (req, res) => {
  try {
    const { cropName } = req.params;
    
    const issues = await PestDisease.find({
      affectedCrops: { $regex: cropName, $options: "i" }
    });

    // Categorize by type
    const pests = issues.filter(issue => issue.type === "pest");
    const diseases = issues.filter(issue => issue.type === "disease");
    const deficiencies = issues.filter(issue => issue.type === "deficiency");

    res.json({
      success: true,
      pests,
      diseases,
      deficiencies,
      total: issues.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Search pests/diseases
export const searchIssues = async (req, res) => {
  try {
    const { query } = req.params;
    
    const issues = await PestDisease.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { localName: { $regex: query, $options: "i" } },
        { symptoms: { $regex: query, $options: "i" } }
      ]
    });

    res.json({ success: true, issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📝 Report new pest/disease
export const reportIssue = async (req, res) => {
  try {
    const {
      name,
      type,
      affectedCrops,
      symptoms,
      location,
      images
    } = req.body;

    const newReport = new PestDisease({
      name,
      type,
      affectedCrops: Array.isArray(affectedCrops) ? affectedCrops : [affectedCrops],
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      location,
      image: images && images.length > 0 ? images[0] : null,
      severity: "medium", // Default, can be updated by admin
      reportedBy: req.user.id,
      status: "reported"
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Issue reported successfully. Our experts will review it.",
      report: newReport
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};