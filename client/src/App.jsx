// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Farms from './components/Farms';
import CropRecommendations from './components/CropRecommendations';
import Layout from './components/Layout';
import PestManagement from './components/PestManagement';
import MarketPrices from './components/MarketPrices';
// Remove AnalyticsDashboard import since we're not using it yet

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/farms" element={
              <ProtectedRoute>
                <Layout>
                  <Farms />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/crops" element={
              <ProtectedRoute>
                <Layout>
                  <CropRecommendations />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/pest" element={
              <ProtectedRoute>
                <Layout>
                  <PestManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/market" element={
              <ProtectedRoute>
                <Layout>
                  <MarketPrices />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Remove the AnalyticsDashboard route for now */}
            {/* We'll add it back when we create the component properly */}
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;