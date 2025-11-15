// controllers/cropController.js
import Crop from "../models/Crop.js";
import Weather from "../models/Weather.js";

// 🌱 Get crop recommendations based on soil, season, and location
export const getCropRecommendations = async (req, res) => {
  try {
    const { soilType, district, season, waterAvailability } = req.body;
    
    // Get current weather for the district
    const weather = await Weather.findOne({ district });
    
    let query = {
      suitableSoil: soilType,
      season: season || getCurrentSeason()
    };

    // Adjust recommendations based on water availability
    if (waterAvailability === "low") {
      query.waterRequirements = { $in: ["low", "medium"] };
    }

    const recommendedCrops = await Crop.find(query);
    
    // Enhance with weather considerations
    const enhancedRecommendations = recommendedCrops.map(crop => {
      const score = calculateCropScore(crop, weather, soilType, waterAvailability);
      return {
        ...crop._doc,
        recommendationScore: score,
        suitability: getSuitabilityLevel(score)
      };
    });

    // Sort by recommendation score
    enhancedRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      success: true,
      recommendations: enhancedRecommendations,
      filters: { soilType, district, season }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Get crop details
export const getCropDetails = async (req, res) => {
  try {
    const { cropId } = req.params;
    const crop = await Crop.findById(cropId);
    
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Search crops
export const searchCrops = async (req, res) => {
  try {
    const { query } = req.params;
    const crops = await Crop.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { localName: { $regex: query, $options: "i" } }
      ]
    });

    res.json({ success: true, crops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper functions
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
}

function calculateCropScore(crop, weather, soilType, waterAvailability) {
  let score = 50; // Base score

  // Soil compatibility
  if (crop.suitableSoil.includes(soilType)) score += 20;

  // Water requirements match
  if (waterAvailability === "high" && crop.waterRequirements === "high") score += 15;
  if (waterAvailability === "low" && crop.waterRequirements === "low") score += 15;

  // Weather considerations
  if (weather) {
    if (weather.condition === "rainy" && crop.waterRequirements === "high") score += 10;
    if (weather.temperature.current > 30 && crop.waterRequirements === "high") score -= 5;
  }

  // Difficulty level (easier crops get higher score for beginners)
  if (crop.difficulty === "easy") score += 10;
  if (crop.difficulty === "hard") score -= 5;

  return Math.min(100, Math.max(0, score));
}

function getSuitabilityLevel(score) {
  if (score >= 80) return "Highly Suitable";
  if (score >= 60) return "Suitable";
  if (score >= 40) return "Moderately Suitable";
  return "Less Suitable";
}