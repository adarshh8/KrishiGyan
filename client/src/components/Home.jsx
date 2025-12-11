// src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, CloudRain, TrendingUp, Shield, Award, 
  ChevronLeft, ChevronRight, ArrowRight, Play
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Chatbot from './Chatbot';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider images
  const slides = [
    {
      image: image1,
      title: t('welcomeToKrishiGyan') || 'Welcome to KrishiGyan',
      subtitle: t('smartFarmingAssistant') || 'Your Smart Farming Assistant',
      description: t('empowerYourFarming') || 'Empower your farming journey with AI-powered insights and expert guidance',
      buttonText: t('getStarted') || 'Get Started',
      buttonLink: '/farms'
    },
    {
      image: image2,
      title: t('cropRecommendations') || 'Smart Crop Recommendations',
      subtitle: t('aiPoweredAdvice') || 'AI-Powered Crop Advice',
      description: t('getPersonalizedCropAdvice') || 'Get personalized crop recommendations based on soil, weather, and market conditions',
      buttonText: t('exploreCrops') || 'Explore Crops',
      buttonLink: '/crops'
    },
    {
      image: image3,
      title: t('marketPrices') || 'Real-Time Market Prices',
      subtitle: t('stayUpdated') || 'Stay Updated',
      description: t('trackMarketPrices') || 'Track real-time agricultural commodity prices and make informed selling decisions',
      buttonText: t('viewPrices') || 'View Prices',
      buttonLink: '/market'
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Quick access features
  const features = [
    {
      icon: Sprout,
      title: t('myFarms') || 'My Farms',
      description: t('manageYourFarms') || 'Manage and track your farm activities',
      link: '/farms',
      color: 'green'
    },
    {
      icon: CloudRain,
      title: t('cropAdvice') || 'Crop Advice',
      description: t('getPersonalizedAdvice') || 'Get personalized crop recommendations',
      link: '/crops',
      color: 'blue'
    },
    {
      icon: Shield,
      title: t('pestControl') || 'Pest Control',
      description: t('managePests') || 'Identify and manage agricultural pests',
      link: '/pest',
      color: 'orange'
    },
    {
      icon: TrendingUp,
      title: t('marketPrices') || 'Market Prices',
      description: t('viewMarketPrices') || 'View real-time commodity prices',
      link: '/market',
      color: 'purple'
    },
    {
      icon: Award,
      title: t('governmentSchemes') || 'Government Schemes',
      description: t('applyForSchemes') || 'Apply for subsidies and benefits',
      link: '/schemes',
      color: 'pink'
    }
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Slider Section */}
      <div className="relative w-full max-w-full h-[500px] overflow-hidden rounded-2xl mb-8 shadow-2xl mx-auto">
        {/* Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div 
                className="w-full h-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-3xl px-8 md:px-12 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-green-300 mb-4">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-gray-200">
                      {slide.description}
                    </p>
                    <button
                      onClick={() => navigate(slide.buttonLink)}
                      className="bg-gradient-to-r from-primary-green to-primary-light text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
                    >
                      {slide.buttonText}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary-green'
                  : 'w-3 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-green mb-2">
            {t('welcomeToKrishiGyan') || 'Welcome to KrishiGyan'} 👋
          </h2>
          <p className="text-xl text-natural-brown">
            {t('smartFarmingAssistant') || 'Your Smart Farming Assistant'}
          </p>
        </div>
      </div>

      {/* Latest News & Announcements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Latest News - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-green flex items-center gap-2">
              <TrendingUp size={24} />
              {t('latestNews') || 'Latest News & Updates'}
            </h2>
            <button 
              onClick={() => navigate('/news')}
              className="text-primary-green hover:text-primary-light text-sm font-semibold flex items-center gap-1"
            >
              {t('viewAll') || 'View All'}
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: t('news1Title') || 'New Organic Farming Scheme Launched',
                date: '2024-01-15',
                category: t('schemes') || 'Schemes',
                excerpt: t('news1Excerpt') || 'Government announces new subsidies for organic farming practices. Apply now!'
              },
              {
                title: t('news2Title') || 'Monsoon Forecast: Above Normal Rainfall Expected',
                date: '2024-01-14',
                category: t('weather') || 'Weather',
                excerpt: t('news2Excerpt') || 'IMD predicts above normal rainfall for Kerala this monsoon season.'
              },
              {
                title: t('news3Title') || 'Coconut Prices Reach All-Time High',
                date: '2024-01-13',
                category: t('marketPrices') || 'Market',
                excerpt: t('news3Excerpt') || 'Coconut prices surge to ₹45 per kg in major Kerala markets.'
              },
              {
                title: t('news4Title') || 'AI Chatbot Now Available in Malayalam',
                date: '2024-01-12',
                category: t('updates') || 'Updates',
                excerpt: t('news4Excerpt') || 'Our AI assistant now supports full Malayalam language for better communication.'
              }
            ].map((news, index) => (
              <div 
                key={index}
                className="p-4 border-l-4 border-primary-green bg-gradient-to-r from-green-50 to-white rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate('/news')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary-green bg-green-100 px-2 py-1 rounded">
                        {news.category}
                      </span>
                      <span className="text-xs text-gray-500">{news.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 hover:text-primary-green transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {news.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & Quick Links - Takes 1 column */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
              <Award size={20} />
              {t('announcements') || 'Announcements'}
            </h2>
            <div className="space-y-3">
              {[
                {
                  text: t('announcement1') || 'New crop insurance scheme registration open',
                  type: 'important'
                },
                {
                  text: t('announcement2') || 'Weather alert: Heavy rain expected this week',
                  type: 'warning'
                },
                {
                  text: t('announcement3') || 'Market prices updated daily at 9 AM',
                  type: 'info'
                }
              ].map((announcement, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    announcement.type === 'important' ? 'border-red-500 bg-red-50' :
                    announcement.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <p className="text-sm text-gray-800">{announcement.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-primary-green to-primary-light rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">
              {t('quickLinks') || 'Quick Links'}
            </h2>
            <div className="space-y-2">
              {features.slice(0, 4).map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(feature.link)}
                    className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-left"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{feature.title}</span>
                    <ArrowRight size={16} className="ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stats Section */}
      <div className="bg-gradient-to-br from-primary-green to-primary-light rounded-2xl shadow-xl p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('platformStats') || 'Platform Statistics'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">1000+</div>
            <div className="text-green-100">{t('activeFarmers') || 'Active Farmers'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">50+</div>
            <div className="text-green-100">{t('cropVarieties') || 'Crop Varieties'}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-green-100">{t('aiSupport') || 'AI Support'}</div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;

