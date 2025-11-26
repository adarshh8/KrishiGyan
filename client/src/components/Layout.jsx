// src/components/Layout.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Sprout, CloudRain, Shield, TrendingUp } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/farms', icon: Sprout, label: 'My Farms' },
    { path: '/crops', icon: CloudRain, label: 'Crop Advice' },
    { path: '/pest', icon: Shield, label: 'Pest Control' }, // Fixed path to match App.jsx
    { path: '/market', icon: TrendingUp, label: 'Market Prices' },
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
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
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
                <span className="font-medium">{item.label}</span>
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
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-natural-beige">
        {children}
      </div>
    </div>
  );
};

export default Layout;