// src/components/CropRecommendations.jsx
import React, { useState } from 'react';
import { cropAPI } from '../services/api';
import { Sprout, TrendingUp, Droplets, Leaf } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const CropRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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

  const getRecommendations = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await cropAPI.getRecommendations(filters);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
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

        <button 
          onClick={getRecommendations}
          className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('analyzingText') : t('analyzeButton')}
        </button>
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