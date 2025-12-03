// src/components/Layout.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Sprout, CloudRain, Shield, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, labelKey: 'dashboard' },
    { path: '/farms', icon: Sprout, labelKey: 'myFarms' },
    { path: '/crops', icon: CloudRain, labelKey: 'cropAdvice' },
    { path: '/pest', icon: Shield, labelKey: 'pestControl' }, // Fixed path to match App.jsx
    { path: '/market', icon: TrendingUp, labelKey: 'marketPrices' },
  ];

  return (
    
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-primary-green to-primary-light text-white flex flex-col shadow-xl fixed left-0 top-0 bottom-0 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="logo-image">
              <img 
                src="/src/assets/agri_logo.jpg" 
                alt="KRISHIGNAN Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">KRISHIGNAN</h2>
              <p className="text-accent-gold text-sm font-medium">FARMING WISDOM</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 pt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white border-l-4 border-accent-gold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4 justify-center text-center">
            <div className="w-10 h-10 bg-accent-gold text-primary-green rounded-full flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{user?.name}</p>
              <p className="text-accent-gold text-xs capitalize">{user?.role || 'Farmer'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/20 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-natural-beige relative">
        {/* Global Language Dropdown (top-right) */}
        <div className="fixed top-4 right-6 z-40">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen((open) => !open)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow-md border border-gray-200 text-sm text-gray-800 hover:bg-white"
            >
              <span className="text-xs font-semibold uppercase text-gray-500">{t('languageLabelShort')}</span>
              <span className="font-medium">
                {language === 'ml'
                  ? t('languageMalayalam')
                  : language === 'ta'
                  ? t('languageTamil')
                  : language === 'kn'
                  ? t('languageKannada')
                  : language === 'tl'
                  ? t('languageTulu')
                  : language === 'kok'
                  ? t('languageKonkani')
                  : language === 'hi'
                  ? t('languageHindi')
                  : language === 'ur'
                  ? t('languageUrdu')
                  : t('languageEnglish')}
              </span>
              <span className="text-xs">▾</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'en' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageEnglish')} – English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ml');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'ml' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageMalayalam')} – Malayalam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ta');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'ta' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageTamil')} – Tamil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('kn');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'kn' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageKannada')} – Kannada
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('tl');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'tl' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageTulu')} – Tulu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('kok');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'kok' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageKonkani')} – Konkani
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('hi');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'hi' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageHindi')} – Hindi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ur');
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    language === 'ur' ? 'font-semibold text-primary-green' : 'text-gray-800'
                  }`}
                >
                  {t('languageUrdu')} – Urdu
                </button>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Layout;