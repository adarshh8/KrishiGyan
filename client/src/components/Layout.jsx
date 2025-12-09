// src/components/Layout.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Sprout, CloudRain, Shield, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, labelKey: 'dashboard' },
    { path: '/farms', icon: Sprout, labelKey: 'myFarms' },
    { path: '/crops', icon: CloudRain, labelKey: 'cropAdvice' },
    { path: '/pest', icon: Shield, labelKey: 'pestControl' },
    { path: '/market', icon: TrendingUp, labelKey: 'marketPrices' },
    { path: '/schemes', icon: Award, labelKey: 'governmentSchemes' }, // ADD THIS
  ];

  return (
    
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-primary-green to-primary-light text-white flex flex-col shadow-xl fixed left-0 top-0 bottom-0 z-50 transition-all duration-300`}>
        {/* Logo & Toggle Button */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2 text-center w-full">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src="/src/assets/agri_logo.jpg" 
                    alt="KRISHIGNAN Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">KRISHIGNAN</h2>
                  <p className="text-accent-gold text-xs font-medium">FARMING WISDOM</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src="/src/assets/agri_logo.jpg" 
                    alt="KRISHIGNAN Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className={`absolute ${isSidebarCollapsed ? 'left-16' : 'left-60'} top-4 transition-all duration-300`}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-white/20 text-white border-l-4 border-accent-gold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => navigate(item.path)}
                title={isSidebarCollapsed ? t(item.labelKey) : ''}
              >
                <Icon size={20} />
                {!isSidebarCollapsed && (
                  <span className="font-medium">{t(item.labelKey)}</span>
                )}
                {/* Tooltip when collapsed */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {t(item.labelKey)}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 bg-black/10">
          {!isSidebarCollapsed ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 bg-accent-gold text-primary-green rounded-full flex items-center justify-center font-bold text-lg cursor-pointer hover:bg-accent-gold/80 transition-colors" title={user?.name}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} min-h-screen bg-gradient-to-br from-gray-50 to-natural-beige relative transition-all duration-300`}>
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