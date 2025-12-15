// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import axios from 'axios';
import {
  Sprout, CloudRain, TrendingUp, AlertCircle, Plus, Shield,
  Award, MessageCircle
} from 'lucide-react';
import Chatbot from './Chatbot';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [farms, setFarms] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Keep this for the badge

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const getAuthConfig = () => {
    const config = {
      headers: {}
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUnreadCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [farmsResponse, weatherResponse] = await Promise.all([
        axios.get(`${API_URL}/farm`, getAuthConfig()),
        user?.location?.district
          ? axios.get(`${API_URL}/weather/${user.location.district}`, getAuthConfig())
          : Promise.resolve(null)
      ]);

      setFarms(farmsResponse.data.data || []);
      if (weatherResponse) {
        setWeather(weatherResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/unread-count`, getAuthConfig());
      setUnreadCount(response.data.data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const stats = [
    {
      icon: Sprout,
      labelKey: 'totalFarms',
      value: farms.length,
      color: 'green'
    },
    {
      icon: CloudRain,
      labelKey: 'weather',
      value: weather ? `${weather.temperature?.current || weather.current?.temp}°C` : 'N/A',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      labelKey: 'activeCrops',
      value: farms.reduce((acc, farm) => acc + (farm.cropType ? 1 : 0), 0),
      color: 'orange'
    },
    {
      icon: MessageCircle,
      labelKey: 'messages',
      value: unreadCount > 0 ? `${unreadCount} new` : 'Chat',
      color: 'purple',
      onClick: () => navigate('/chat')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-natural-brown">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-green mb-4">
          {t('welcomeBack') || 'Welcome Back'} {user?.name}!
        </h1>
        <p className="text-xl text-natural-brown">
          {t('farmingOverview') || 'Your Farming Overview'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            green: 'border-l-primary-green bg-gradient-to-r from-white to-green-50',
            blue: 'border-l-natural-sky bg-gradient-to-r from-white to-blue-50',
            orange: 'border-l-accent-gold bg-gradient-to-r from-white to-amber-50',
            purple: 'border-l-purple-500 bg-gradient-to-r from-white to-purple-50'
          };

          return (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg border-l-4 ${colorClasses[stat.color]} transition-transform duration-200 hover:scale-105 cursor-pointer relative`}
              onClick={stat.onClick}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.color === 'green' ? 'bg-primary-green' :
                    stat.color === 'blue' ? 'bg-natural-sky' :
                      stat.color === 'orange' ? 'bg-accent-gold' : 'bg-purple-500'
                  } text-white`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-green">{stat.value}</h3>
                  <p className="text-natural-brown">{t(stat.labelKey) || stat.labelKey}</p>
                </div>
              </div>
              {stat.color === 'purple' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/pest')}
        >
          <div className="flex items-center gap-3">
            <Shield className="text-green-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Pest Control</h3>
              <p className="text-sm text-gray-600">Identify and manage pests</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/market')}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Market Prices</h3>
              <p className="text-sm text-gray-600">Check latest prices</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/schemes')}
        >
          <div className="flex items-center gap-3">
            <Award className="text-purple-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Government Schemes</h3>
              <p className="text-sm text-gray-600">Apply for subsidies & benefits</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/crops')}
        >
          <div className="flex items-center gap-3">
            <Sprout className="text-orange-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Crop Advice</h3>
              <p className="text-sm text-gray-600">Get personalized advice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      {weather && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-natural-sky rounded-xl p-6 mb-8 flex items-center space-x-4">
          <AlertCircle size={24} className="text-natural-sky flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-primary-green">
              Weather in {user?.location?.district || 'your area'}
            </h4>
            <p className="text-natural-brown">
              {weather.condition || weather.current?.condition} •
              {weather.temperature?.current || weather.current?.temp}°C •
              Humidity: {weather.humidity || weather.current?.humidity}% •
              Rainfall: {weather.rainfall || weather.current?.rainfall || 0}mm
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-primary-green text-center mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/farms')}
            className="p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-green hover:shadow-md transition-all duration-200 flex flex-col items-center space-y-3 text-natural-brown hover:text-primary-green"
          >
            <Sprout size={32} />
            <span className="font-semibold">Manage Farms</span>
          </button>
          <button
            onClick={() => navigate('/crops')}
            className="p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-green hover:shadow-md transition-all duration-200 flex flex-col items-center space-y-3 text-natural-brown hover:text-primary-green"
          >
            <TrendingUp size={32} />
            <span className="font-semibold">Crop Advice</span>
          </button>
          <button
            onClick={() => navigate('/farms?add=true')}
            className="p-6 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-green hover:shadow-md transition-all duration-200 flex flex-col items-center space-y-3 text-natural-brown hover:text-primary-green"
          >
            <Plus size={32} />
            <span className="font-semibold">Add New Farm</span>
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:shadow-md transition-all duration-200 flex flex-col items-center space-y-3 text-natural-brown hover:text-purple-600"
          >
            <MessageCircle size={32} />
            <span className="font-semibold">Chat with Farmers</span>
          </button>
        </div>
      </div>

      {/* Recent Farms */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-primary-green text-center mb-6">Your Farms</h2>
        {farms.length === 0 ? (
          <div className="text-center py-12">
            <Sprout size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-primary-green mb-2">No Farms Yet</h3>
            <p className="text-natural-brown mb-6">Start by adding your first farm to get personalized recommendations</p>
            <button
              onClick={() => navigate('/farms')}
              className="bg-gradient-to-r from-primary-green to-green-400 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Add Your First Farm</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.slice(0, 3).map((farm) => (
              <div
                key={farm._id}
                className="p-6 border border-gray-200 rounded-lg hover:border-primary-green hover:shadow-md transition-all duration-200 bg-gradient-to-br from-gray-50 to-green-50"
              >
                <h4 className="font-semibold text-primary-green text-lg mb-2">{farm.farmName}</h4>
                <p className="text-natural-brown text-sm mb-3">{farm.location}</p>
                {farm.cropType && (
                  <span className="inline-block bg-primary-green text-white px-3 py-1 rounded-full text-xs font-medium mb-3">
                    {farm.cropType}
                  </span>
                )}
                <div className="text-natural-brown text-sm font-medium">
                  {farm.size?.value} {farm.size?.unit}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;