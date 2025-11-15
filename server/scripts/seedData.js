// scripts/seedData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Crop from "../models/Crop.js";
import PestDisease from "../models/PestDisease.js";
import Scheme from "../models/Scheme.js";
import MarketPrice from "../models/MarketPrice.js";

dotenv.config();

const keralaCrops = [
  {
    name: "Rice",
    localName: "അരി",
    season: "kharif",
    suitableSoil: ["clay", "loamy"],
    waterRequirements: "high",
    duration: 120,
    yieldPerAcre: { min: 2000, max: 3000, unit: "kg" },
    marketPriceRange: { min: 25, max: 40, unit: "INR/kg" },
    difficulty: "medium",
    description: "Staple food crop of Kerala, grown in both seasons",
    benefits: ["High demand", "Government support", "Multiple varieties available"]
  },
  {
    name: "Coconut",
    localName: "തേങ്ങ",
    season: "perennial",
    suitableSoil: ["sandy", "laterite", "loamy"],
    waterRequirements: "medium",
    duration: 365,
    yieldPerAcre: { min: 6000, max: 10000, unit: "nuts/year" },
    marketPriceRange: { min: 15, max: 30, unit: "INR/nut" },
    difficulty: "easy",
    description: "Main cash crop of Kerala, known as 'Kalpavriksha'"
  },
  {
    name: "Rubber",
    localName: "റബ്ബർ",
    season: "perennial", 
    suitableSoil: ["laterite", "loamy"],
    waterRequirements: "high",
    duration: 1095,
    yieldPerAcre: { min: 1000, max: 1800, unit: "kg/year" },
    marketPriceRange: { min: 120, max: 180, unit: "INR/kg" },
    difficulty: "medium",
    description: "Important plantation crop with stable market"
  },
  {
    name: "Black Pepper",
    localName: "കുരുമുളക്",
    season: "perennial",
    suitableSoil: ["laterite", "loamy"],
    waterRequirements: "medium", 
    duration: 270,
    yieldPerAcre: { min: 800, max: 1200, unit: "kg/year" },
    marketPriceRange: { min: 400, max: 600, unit: "INR/kg" },
    difficulty: "medium",
    description: "Kerala is famous for high-quality black pepper"
  },
  {
    name: "Banana",
    localName: "വാഴ",
    season: "perennial",
    suitableSoil: ["loamy", "alluvial"],
    waterRequirements: "high",
    duration: 300,
    yieldPerAcre: { min: 20000, max: 35000, unit: "kg/year" },
    marketPriceRange: { min: 15, max: 40, unit: "INR/kg" },
    difficulty: "easy",
    description: "Popular fruit crop with quick returns"
  }
];

const commonPests = [
  {
    name: "Rice Blast",
    localName: "അരി ബ്ലാസ്റ്റ്",
    type: "disease",
    affectedCrops: ["Rice"],
    symptoms: ["Spindle-shaped lesions on leaves", "White to gray centers with dark borders", "Node rot causing lodging"],
    causes: ["Fungus Magnaporthe oryzae", "High humidity", "Excessive nitrogen"],
    prevention: ["Use resistant varieties", "Avoid excess nitrogen", "Proper spacing", "Field sanitation"],
    organicTreatment: ["Neem oil spray", "Garlic extract", "Proper water management"],
    chemicalTreatment: ["Tricyclazole", "Carbendazim", "Edifenphos"],
    severity: "high",
    season: ["kharif", "rabi"]
  },
  {
    name: "Coconut Rhinoceros Beetle",
    localName: "കൊമ്പൻ ശംഖുവണ്ടൻ",
    type: "pest", 
    affectedCrops: ["Coconut"],
    symptoms: ["V-shaped cuts on leaves", "Holes in crown", "Reduced yield"],
    causes: ["Beetle infestation", "Poor sanitation", "Decomposing organic matter"],
    prevention: ["Field sanitation", "Use of pheromone traps", "Destroy breeding sites"],
    organicTreatment: ["Neem cake application", "Biological control with Metarhizium"],
    chemicalTreatment: ["Carbaryl dust", "Chlorpyrifos"],
    severity: "medium",
    season: ["all"]
  }
];

const governmentSchemes = [
  {
    title: "Pradhan Mantri Kisan Samman Nidhi",
    description: "Income support scheme for farmers",
    department: "Agriculture Department, Kerala",
    eligibility: ["Small and marginal farmers", "Land ownership required", "Annual income less than 5 lakhs"],
    benefits: ["₹6,000 per year in three installments", "Direct bank transfer"],
    documentsRequired: ["Aadhaar card", "Land records", "Bank account details"],
    applicationProcess: ["Visit local agriculture office", "Submit required documents", "Get verified"],
    deadline: new Date("2024-12-31"),
    contact: {
      phone: "1800-180-1551",
      website: "https://pmkisan.gov.in"
    },
    category: "subsidy"
  },
  {
    title: "Kerala State Crop Insurance Scheme",
    description: "Protection against crop loss due to natural calamities",
    department: "Kerala Agriculture Insurance Department", 
    eligibility: ["All farmers in Kerala", "Registered cultivated land"],
    benefits: ["Financial protection", "Quick claim settlement", "Coverage for multiple crops"],
    documentsRequired: ["Land documents", "Crop details", "Aadhaar card"],
    applicationProcess: ["Contact local agriculture office", "Fill application form", "Pay premium"],
    contact: {
      phone: "0471-2320000",
      website: "https://agriculture.kerala.gov.in"
    },
    category: "insurance"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Crop.deleteMany({});
    await PestDisease.deleteMany({});
    await Scheme.deleteMany({});

    // Insert new data
    await Crop.insertMany(keralaCrops);
    await PestDisease.insertMany(commonPests);
    await Scheme.insertMany(governmentSchemes);

    console.log("✅ Database seeded successfully!");
    console.log(`🌱 Crops: ${keralaCrops.length} added`);
    console.log(`🐛 Pests/Diseases: ${commonPests.length} added`);
    console.log(`🏛️ Schemes: ${governmentSchemes.length} added`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();