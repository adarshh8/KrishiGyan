// src/components/CropRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, Droplets, Leaf, CloudRain, Thermometer, Wind } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

// Note: You'll need to install @google/generative-ai via npm: npm install @google/generative-ai
// For Vite, set your Gemini API key in .env as VITE_GEMINI_API_KEY (not REACT_APP_)
import { GoogleGenerativeAI } from '@google/generative-ai';

const CropRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const { t } = useLanguage();

  const [filters, setFilters] = useState({
    soilType: 'loamy',
    waterAvailability: 'medium',
    district: ''
  });

  const soilTypes = [
    { value: 'clay', label: 'Clay Soil' },
    { value: 'sandy', label: 'Sandy Soil' },
    { value: 'loamy', label: 'Loamy Soil' },
    { value: 'laterite', label: 'Laterite Soil' },
    { value: 'alluvial', label: 'Alluvial Soil' }
  ];

  const waterOptions = [
    { value: 'low', label: 'Low Water' },
    { value: 'medium', label: 'Medium Water' },
    { value: 'high', label: 'High Water' }
  ];

  // Function to geocode district to lat/long using Nominatim (free API)
  const geocodeDistrict = async (district) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(district)}&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Function to fetch weather using Open-Meteo (free API, no key needed)
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Weather fetch error:', error);
      return null;
    }
  };

  // Fetch weather when district changes
  useEffect(() => {
    if (filters.district.trim()) {
      setWeatherLoading(true);
      geocodeDistrict(filters.district).then(coords => {
        if (coords) {
          fetchWeather(coords.lat, coords.lon).then(weatherData => {
            setWeather(weatherData);
            setWeatherLoading(false);
          });
        } else {
          setWeather(null);
          setWeatherLoading(false);
        }
      });
    } else {
      setWeather(null);
    }
  }, [filters.district]);

  // Function to get recommendations using Gemini API
  const getRecommendations = async () => {
  setLoading(true);
  
  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Based on the following farming conditions, recommend suitable crops.
      Return ONLY valid JSON with this structure:
      {
        "recommendations": [
          {
            "name": "Crop Name",
            "localName": "Local Name",
            "recommendationScore": 85,
            "season": "Kharif",
            "waterRequirements": "Medium",
            "duration": 90,
            "yieldPerAcre": { "min": 10, "max": 20, "unit": "tons" },
            "benefits": ["Benefit A", "Benefit B"]
          }
        ]
      }

      Conditions:
      - Soil Type: ${filters.soilType}
      - Water: ${filters.waterAvailability}
      - District: ${filters.district || "Not specified"}
      - Current Weather: ${
        weather
          ? `Temperature ${weather.current_weather.temperature}°C, Wind ${weather.current_weather.windspeed} km/h, Precipitation ${weather.hourly.precipitation_probability[0]}%`
          : "Not available"
      }

      Return ONLY JSON. No text, no explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("RAW GEMINI RESPONSE:", text);

    // -----------------------------
    // CLEAN & EXTRACT VALID JSON
    // -----------------------------

    // Remove ```json or ```
    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract text between first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    console.log("CLEANED JSON STRING:", cleaned);

    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ JSON PARSE ERROR:", err);
      console.log("FAILED JSON TEXT:", cleaned);
      setRecommendations([]);
      return;
    }

    setRecommendations(data.recommendations || []);

  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    setRecommendations([]);
  } finally {
    setLoading(false);
  }
};


  // Real-time updates: Poll the API every 10 minutes if hasSearched is true
  useEffect(() => {
    if (!hasSearched) return;

    const interval = setInterval(() => {
      getRecommendations();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [hasSearched, filters, weather]); // Include weather in dependencies

  const handleAnalyze = () => {
    setHasSearched(true);
    getRecommendations();
  };

  const getSuitabilityColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSuitabilityText = (score) => {
    if (score >= 80) return t('suitabilityHigh');
    if (score >= 60) return t('suitabilitySuitable');
    if (score >= 40) return t('suitabilityModerate');
    return t('suitabilityLow');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-green mb-4">{t('cropRecoTitle')}</h1>
        <p className="text-xl text-natural-brown">
          {t('cropRecoSubtitle')}
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-primary-green text-center mb-6">{t('farmConditions')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Soil Type */}
          <div>
            <label className="block text-sm font-medium text-primary-green mb-2">
              {t('soilTypeLabel')}
            </label>
            <select
              value={filters.soilType}
              onChange={(e) => setFilters({...filters, soilType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
            >
              {soilTypes.map(soil => (
                <option key={soil.value} value={soil.value}>
                  {soil.label}
                </option>
              ))}
            </select>
          </div>

          {/* Water Availability */}
          <div>
            <label className="block text-sm font-medium text-primary-green mb-2">
              {t('waterAvailabilityLabel')}
            </label>
            <select
              value={filters.waterAvailability}
              onChange={(e) => setFilters({...filters, waterAvailability: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
            >
              {waterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-primary-green mb-2">
              {t('districtOptionalLabel')}
            </label>
            <input
              type="text"
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
              placeholder={t('districtPlaceholderReco')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
            />
          </div>
        </div>

        {/* Weather Display */}
        {filters.district && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold text-primary-green mb-2">{t('currentWeather')}</h4>
            {weatherLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-green mr-2"></div>
                <span className="text-natural-brown">{t('loadingWeather')}</span>
              </div>
            ) : weather ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Thermometer size={20} className="mr-2 text-red-500" />
                  <span className="text-sm">{t('temperature')}: {weather.current_weather.temperature}°C</span>
                </div>
                <div className="flex items-center">
                  <Wind size={20} className="mr-2 text-blue-500" />
                  <span className="text-sm">{t('windspeed')}: {weather.current_weather.windspeed} km/h</span>
                </div>
                <div className="flex items-center">
                  <CloudRain size={20} className="mr-2 text-gray-500" />
                  <span className="text-sm">{t('precipitation')}: {weather.hourly.precipitation_probability[0]}%</span>
                </div>
              </div>
            ) : (
              <p className="text-natural-brown text-sm">{t('weatherNotFound')}</p>
            )}
          </div>
        )}

        <button 
          onClick={handleAnalyze}
          className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('analyzingText') : t('analyzeButton')}
        </button>
        {hasSearched && (
          <p className="text-center text-sm text-natural-brown mt-2">
            {t('realTimeUpdateNote')}
          </p>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
              <p className="mt-4 text-natural-brown">{t('analyzingSpinnerText')}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Leaf size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-primary-green mb-2">{t('noRecoTitle')}</h3>
              <p className="text-natural-brown">{t('noRecoText')}</p>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-primary-green text-center mb-8">{t('recommendedCropsTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((crop, index) => (
                  <div key={crop._id || index} className="bg-gradient-to-br from-gray-50 to-green-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-green">
                    {/* Crop Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-primary-green flex-1 mr-2">{crop.name}</h4>
                      <span className={`${getSuitabilityColor(crop.recommendationScore)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {crop.recommendationScore}%
                      </span>
                    </div>
                    
                    {/* Local Name */}
                    <p className="text-secondary-green italic text-sm mb-2">{crop.localName}</p>
                    
                    {/* Suitability */}
                    <p className="text-natural-brown text-sm mb-4 font-medium">
                      {getSuitabilityText(crop.recommendationScore)}
                    </p>

                    {/* Crop Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-natural-brown text-sm">
                        <TrendingUp size={16} className="mr-2" />
                          <span>{t('seasonLabel')}: {crop.season}</span>
                      </div>
                      <div className="flex items-center text-natural-brown text-sm">
                        <Droplets size={16} className="mr-2" />
                          <span>{t('waterLabel')}: {crop.waterRequirements}</span>
                      </div>
                      <div className="flex items-center text-natural-brown text-sm">
                        <Sprout size={16} className="mr-2" />
                          <span>{t('durationLabel')}: {crop.duration} days</span>
                      </div>
                    </div>

                    {/* Yield Information */}
                    {crop.yieldPerAcre && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded-lg text-sm text-center mb-4 font-medium">
                        {t('yieldLabel')}: {crop.yieldPerAcre.min}-{crop.yieldPerAcre.max} {crop.yieldPerAcre.unit}
                      </div>
                    )}

                    {/* Benefits */}
                    {crop.benefits && crop.benefits.length > 0 && (
                      <div className="text-sm">
                        <strong className="text-primary-green">{t('benefitsLabel')}</strong>
                        <ul className="mt-2 space-y-1">
                          {crop.benefits.slice(0, 2).map((benefit, i) => (
                            <li key={i} className="text-secondary-green flex items-start">
                              <span className="mr-2">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CropRecommendations;
