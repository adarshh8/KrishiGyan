// controllers/marketController.js - FIXED
import MarketPrice from "../models/MarketPrice.js";

// 💰 Get current market prices
export const getMarketPrices = async (req, res) => {
  try {
    const { crop, district, limit = 50 } = req.query;
    
    let query = {};
    if (crop) query.cropName = { $regex: crop, $options: "i" };
    if (district) query.district = { $regex: district, $options: "i" };

    const prices = await MarketPrice.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Group by crop for analysis
    const cropAnalysis = {};
    prices.forEach(price => {
      if (!cropAnalysis[price.cropName]) {
        cropAnalysis[price.cropName] = {
          prices: [],
          average: 0,
          trend: "stable"
        };
      }
      cropAnalysis[price.cropName].prices.push(price);
    });

    // Calculate averages and trends
    Object.keys(cropAnalysis).forEach(crop => {
      const cropData = cropAnalysis[crop];
      const priceValues = cropData.prices.map(p => p.price);
      cropData.average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
      
      // Simple trend analysis
      if (priceValues.length >= 2) {
        const recent = priceValues[0];
        const previous = priceValues[1];
        cropData.trend = recent > previous ? "increasing" : recent < previous ? "decreasing" : "stable";
      }
    });

    res.json({
      success: true,
      prices,
      analysis: cropAnalysis,
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📈 Get price trends for specific crop
export const getPriceTrends = async (req, res) => {
  try {
    const { cropName, days } = req.params;
    const daysToShow = days ? parseInt(days) : 30; // Default to 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToShow);

    const trends = await MarketPrice.find({
      cropName: { $regex: cropName, $options: "i" },
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Process for chart data
    const chartData = trends.map(entry => ({
      date: entry.date,
      price: entry.price,
      market: entry.market,
      district: entry.district
    }));

    res.json({
      success: true,
      crop: cropName,
      period: `${daysToShow} days`,
      data: chartData,
      summary: {
        currentPrice: trends.length > 0 ? trends[trends.length - 1].price : 0,
        averagePrice: trends.length > 0 ? trends.reduce((sum, entry) => sum + entry.price, 0) / trends.length : 0,
        priceChange: trends.length >= 2 ? trends[trends.length - 1].price - trends[0].price : 0,
        dataPoints: trends.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};