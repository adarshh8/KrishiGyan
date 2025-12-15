// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Farms from './components/Farms';
import CropRecommendations from './components/CropRecommendations';
import GovernmentSchemes from './components/GovernmentSchemes'; // ADD THIS IMPORT
import FarmExpenses from './components/FarmExpenses';
import FarmCalendar from './components/FarmCalendar';
import Layout from './components/Layout';
import PestManagement from './components/PestManagement';
import MarketPrices from './components/MarketPrices';
import Chat from './components/temp';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // avoid redirect while restoring session
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
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
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

            {/* ADD THIS NEW ROUTE */}
            <Route path="/schemes" element={
              <ProtectedRoute>
                <Layout>
                  <GovernmentSchemes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Layout>
                  <FarmExpenses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <FarmCalendar />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            } />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;