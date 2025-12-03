// src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Fullscreen } from 'lucide-react';
import backgroundImage from '../assets/image1.png';
import { useLanguage } from '../contexts/LanguageContext.jsx';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
<div 
      className="min-h-screen flex items-center justify-center 
                 bg-cover bg-center bg-no-repeat 
                 from-natural-beige to-green-50 p-4"
      // 💡 Apply background-image using inline style and the imported variable
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-primary-green/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="auth-logo-image mb-4">
              <img 
                src="/src/assets/agri_logo.jpg" 
                alt="KRISHIGNAN Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-primary-green mb-2">KRISHIGNAN</h1>
            <p className="text-natural-brown font-medium">FARMING WISDOM</p>
            <p className="text-gray-600 mt-4">{t('signInToYourAccount')}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-green to-primary-light text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              {t('dontHaveAccount')}{' '}
              <Link to="/register" className="text-primary-green font-semibold hover:underline">
                {t('signUpHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;