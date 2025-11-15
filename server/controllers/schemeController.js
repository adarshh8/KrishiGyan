// controllers/schemeController.js
import Scheme from "../models/Scheme.js";

// 🏛️ Get all active schemes
export const getSchemes = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { active: true };
    if (category) query.category = category;

    const schemes = await Scheme.find(query).sort({ deadline: 1 });

    res.json({
      success: true,
      schemes,
      total: schemes.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get schemes by eligibility
export const getEligibleSchemes = async (req, res) => {
  try {
    const { landSize, annualIncome, category } = req.body;
    
    let query = { active: true };
    if (category) query.category = category;

    const allSchemes = await Scheme.find(query);
    
    // Basic eligibility matching (can be enhanced)
    const eligibleSchemes = allSchemes.filter(scheme => {
      // Simple matching logic - can be made more sophisticated
      const eligibilityText = scheme.eligibility.join(' ').toLowerCase();
      
      let score = 0;
      if (landSize < 5 && eligibilityText.includes('small')) score++;
      if (landSize > 10 && eligibilityText.includes('large')) score++;
      if (annualIncome < 100000 && eligibilityText.includes('marginal')) score++;
      
      return score > 0;
    });

    res.json({
      success: true,
      schemes: eligibleSchemes,
      total: eligibleSchemes.length,
      filters: { landSize, annualIncome, category }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📝 Get scheme details
export const getSchemeDetails = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const scheme = await Scheme.findById(schemeId);
    
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json({ success: true, scheme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};