// src/components/Farms.jsx
import React, { useState, useEffect } from 'react';
import { farmAPI } from '../services/api';
import { Plus, Edit, Trash2, MapPin, AlertCircle, Loader } from 'lucide-react';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    cropType: '',
    size: { value: '', unit: 'acres' }
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setError('');
      console.log('Fetching farms...');
      const response = await farmAPI.getFarms();
      console.log('Farms response:', response);
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load farms';
      setError(errorMsg);
      setDebugInfo(`Status: ${error.response?.status}, URL: ${error.config?.url}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      console.log('Submitting farm data:', formData);
      
      // Prepare data for backend
      const submitData = {
        farmName: formData.farmName,
        location: formData.location,
        cropType: formData.cropType || undefined,
        size: formData.size.value ? {
          value: parseFloat(formData.size.value),
          unit: formData.size.unit
        } : undefined
      };

      console.log('Sending to backend:', submitData);

      let response;
      if (editingFarm) {
        response = await farmAPI.updateFarm(editingFarm._id, submitData);
        console.log('Update response:', response);
      } else {
        response = await farmAPI.addFarm(submitData);
        console.log('Add response:', response);
      }
      
      // Reset form and close modal
      setShowForm(false);
      setEditingFarm(null);
      setFormData({
        farmName: '',
        location: '',
        cropType: '',
        size: { value: '', unit: 'acres' }
      });
      
      // Refresh farms list
      await fetchFarms();
      
    } catch (error) {
      console.error('Error saving farm:', error);
      console.log('Full error object:', error);
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to save farm';
      
      setError(errorMsg);
      
      // Debug information
      setDebugInfo(`
        Status: ${error.response?.status}
        URL: ${error.config?.url}
        Method: ${error.config?.method}
        Has Token: ${!!localStorage.getItem('token')}
      `);
      
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (farm) => {
    console.log('Editing farm:', farm);
    setEditingFarm(farm);
    setFormData({
      farmName: farm.farmName,
      location: farm.location,
      cropType: farm.cropType || '',
      size: farm.size || { value: '', unit: 'acres' }
    });
    setShowForm(true);
  };

  const handleDelete = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      try {
        await farmAPI.deleteFarm(farmId);
        await fetchFarms();
      } catch (error) {
        console.error('Error deleting farm:', error);
        setError(error.response?.data?.message || 'Failed to delete farm');
      }
    }
  };

  const cropTypes = ['Rice', 'Coconut', 'Rubber', 'Black Pepper', 'Banana', 'Vegetables', 'Fruits', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-primary-green">My Farms</h1>
          <p className="text-natural-brown mt-2">Manage your agricultural lands</p>
        </div>
        <button 
          className="bg-gradient-to-r from-primary-green to-primary-light text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
          onClick={() => {
            setShowForm(true);
            setEditingFarm(null);
            setFormData({
              farmName: '',
              location: '',
              cropType: '',
              size: { value: '', unit: 'acres' }
            });
          }}
        >
          <Plus size={20} />
          <span>Add Farm</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          {debugInfo && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800">
              <strong>Debug Info:</strong>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      )}

      {/* Farm Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary-green text-center mb-6">
              {editingFarm ? 'Edit Farm' : 'Add New Farm'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-green mb-2">
                  Farm Name *
                </label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
                  placeholder="Enter farm name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-green mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="District, Village"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-green mb-2">
                  Crop Type
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
                >
                  <option value="">Select Crop (Optional)</option>
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-green mb-2">
                  Farm Size
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.size.value}
                    onChange={(e) => setFormData({
                      ...formData, 
                      size: {...formData.size, value: e.target.value}
                    })}
                    placeholder="Size"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
                  />
                  <select
                    value={formData.size.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      size: {...formData.size, unit: e.target.value}
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all duration-200"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFarm(null);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-primary-green to-primary-light text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <Loader size={16} className="animate-spin" />}
                  {loading ? 'Saving...' : (editingFarm ? 'Update' : 'Add')} Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farms List */}
      <div className="space-y-4">
        {farms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-primary-green mb-2">No farms added yet</h3>
            <p className="text-natural-brown mb-6">Add your first farm to start getting agricultural advice</p>
            <button 
              className="bg-gradient-to-r from-primary-green to-primary-light text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 mx-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              <span>Add Your First Farm</span>
            </button>
          </div>
        ) : (
          farms.map((farm) => (
            <div key={farm._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-green mb-2">{farm.farmName}</h3>
                  <div className="flex items-center text-natural-brown mb-2">
                    <MapPin size={16} className="mr-2" />
                    <span>{farm.location}</span>
                  </div>
                  {farm.cropType && (
                    <span className="inline-block bg-primary-green text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {farm.cropType}
                    </span>
                  )}
                  {farm.size?.value && (
                    <div className="text-natural-brown font-medium">
                      {farm.size.value} {farm.size.unit}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button 
                    onClick={() => handleEdit(farm)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Edit size={18} className="text-primary-green" />
                  </button>
                  <button 
                    onClick={() => handleDelete(farm._id)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Farms;