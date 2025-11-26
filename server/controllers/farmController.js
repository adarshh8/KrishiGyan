// controllers/farmController.js
import Farm from '../models/Farm.js';

export const addFarm = async (req, res) => {
  try {
    console.log('Received farm data:', req.body);
    console.log('User ID from token:', req.user.userId);

    const { farmName, location, cropType, size } = req.body;
    
    // Validate required fields
    if (!farmName || !location) {
      return res.status(400).json({ 
        message: 'Farm name and location are required' 
      });
    }

    // Create new farm
    const farm = new Farm({
      userId: req.user.userId,
      farmName,
      location,
      cropType: cropType || '',
      size: size || { value: 0, unit: 'acres' },
      status: 'active'
    });

    const savedFarm = await farm.save();
    console.log('Farm saved successfully:', savedFarm);
    
    res.status(201).json({
      message: 'Farm added successfully',
      farm: savedFarm
    });
    
  } catch (error) {
    console.error('Error adding farm:', error);
    res.status(500).json({ 
      message: 'Error adding farm',
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
};

export const getFarms = async (req, res) => {
  try {
    console.log('Fetching farms for user:', req.user.userId);
    const farms = await Farm.find({ userId: req.user.userId });
    console.log('Found farms:', farms);
    res.json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ 
      message: 'Error fetching farms',
      error: error.message 
    });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    
    res.json({ message: 'Farm updated successfully', farm });
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ 
      message: 'Error updating farm',
      error: error.message 
    });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    
    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ 
      message: 'Error deleting farm',
      error: error.message 
    });
  }
};