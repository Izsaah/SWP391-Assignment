import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fix image URL - Thêm base URL nếu cần
 */
const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('/')) {
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }
  
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/images/${imageUrl}`;
};

/**
 * Fetch all dealers from API
 */
export const getDealers = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Prepare headers with ngrok support
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Add ngrok-skip-browser-warning header if using ngrok
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await axios.post(
      `${API_URL}/EVM/viewAllDealer`,
      {},
      { headers }
    );

    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return [];
  }
};

/**
 * Fetch all vehicles from API - only real data from database
 * Returns models and variants with actual data only
 */
export const getVehicles = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    const { search = '' } = filters;
    
    // Prepare headers with ngrok support
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Add ngrok-skip-browser-warning header if using ngrok
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    // Call API to get all vehicles (models and variants)
    const response = await axios.post(
      `${API_URL}/staff/viewVehicle`,
      {},
      { headers }
    );

    if (!response.data || !response.data.data) {
      return [];
    }

    const models = response.data.data;
    const vehicles = [];

    // Transform models and variants to vehicle list - only real data
    models.forEach((model) => {
      if (!model.isActive) return;
      
      const variants = model.lists || [];
      variants.forEach((variant) => {
        if (!variant.isActive) return;
        
        // Only use real data from database
        const modelName = `${model.modelName} ${variant.versionName || ''}`.trim();
        
        vehicles.push({
          modelId: model.modelId,
          variantId: variant.variantId,
          model: modelName,
          modelName: model.modelName,
          versionName: variant.versionName || '',
          color: variant.color || 'N/A',
          price: variant.price || 0,
          image: variant.image ? fixImageUrl(variant.image) : null,
          isActive: variant.isActive,
          description: model.description || '',
        });
      });
    });

    // Apply search filter only (no status/dealer filters since we don't have that data)
    if (search) {
      const term = String(search || '').toLowerCase();
      return vehicles.filter((v) => {
        return v.model.toLowerCase().includes(term) || 
               v.modelName.toLowerCase().includes(term) ||
               v.versionName.toLowerCase().includes(term) ||
               v.color.toLowerCase().includes(term);
      });
    }

    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    
    // Log chi tiết lỗi để debug
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Check if response is HTML (ngrok warning page)
      const responseData = error.response.data;
      const isHtmlResponse = typeof responseData === 'string' && 
                            (responseData.includes('<!DOCTYPE html>') || 
                             responseData.includes('<html') ||
                             responseData.includes('ngrok') ||
                             responseData.includes('Warning'));
      
      if (isHtmlResponse) {
        console.error('❌ Received HTML instead of JSON - ngrok warning page detected');
        const ngrokBaseUrl = API_URL?.replace('/api', '') || 'https://your-ngrok-url.com';
        console.error(`⚠️ Please open ${ngrokBaseUrl} in browser and click "Visit Site" to bypass ngrok warning`);
      }
      
      // Log error message from backend if available
      if (error.response.data && error.response.data.message) {
        console.error('Backend error message:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('Request was made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return [];
  }
};

/**
 * Update vehicle variant information
 * @param {number} variantId - Variant ID
 * @param {number} modelId - Model ID
 * @param {string} versionName - Version name
 * @param {string} color - Color
 * @param {string} image - Image URL (optional)
 * @param {number} price - Price
 * @returns {Promise<boolean>} - Success status
 */
export const updateVehicleVariant = async (variantId, modelId, versionName, color, image, price) => {
  try {
    const token = localStorage.getItem('token');
    
    // Prepare headers with ngrok support
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Add ngrok-skip-browser-warning header if using ngrok
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await axios.post(
      `${API_URL}/staff/updateVehicleVariant`,
      {
        variant_id: variantId,
        model_id: modelId,
        version_name: versionName,
        color: color,
        image: image || null,
        price: price
      },
      { headers }
    );

    if (response.data && response.data.status === 'success') {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating vehicle variant:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
};

/**
 * Calculate stock overview from vehicles list - only real data
 */
export const getStockOverview = (vehicles = []) => {
  const total = vehicles.length;

  // Group by model
  const byModelMap = new Map();
  vehicles.forEach((v) => {
    const key = v.modelId;
    const modelName = v.modelName || v.model.split(' ').slice(0, -1).join(' ') || v.model;
    const entry = byModelMap.get(key) || { 
      modelId: v.modelId, 
      modelName, 
      total: 0,
      variants: []
    };
    entry.total += 1;
    entry.variants.push({
      variantId: v.variantId,
      versionName: v.versionName,
      color: v.color,
      price: v.price
    });
    byModelMap.set(key, entry);
  });
  const byModel = Array.from(byModelMap.values());

  return {
    totals: { total },
    byModel,
  };
};

/**
 * Get model detail data for a specific model
 * This can be enhanced to call API if needed
 */
export const getModelDetail = async (modelId, vehicles = []) => {
  const modelVehicles = vehicles.filter(v => v.modelId === modelId);
  
  if (modelVehicles.length === 0) return null;
  
  // Get model name from first vehicle
  const modelName = modelVehicles[0].model.split(' ').slice(0, -1).join(' ') || modelVehicles[0].model;
  const total = modelVehicles.length;
  const available = modelVehicles.filter(v => v.status === 'Available').length;
  const reserved = modelVehicles.filter(v => v.status === 'Reserved').length;
  const sold = modelVehicles.filter(v => v.status === 'Sold').length;
  
  // Determine stock status
  let stockStatus = 'High';
  if (available < 3) stockStatus = 'Low';
  else if (available < 5) stockStatus = 'Medium';
  
  // Generate demand trend data (last 6 months)
  const demandTrend = [
    { month: 'Jul', reserved: 2, sold: 3 },
    { month: 'Aug', reserved: 3, sold: 4 },
    { month: 'Sep', reserved: 4, sold: 5 },
    { month: 'Oct', reserved: 3, sold: 6 },
    { month: 'Nov', reserved: 5, sold: 7 },
    { month: 'Dec', reserved: reserved, sold: sold },
  ];
  
  // History data
  const history = modelVehicles.map(v => ({
    vin: v.vin,
    color: v.color,
    status: v.status,
    date: v.status === 'Sold' ? v.importDate : null,
    price: v.price
  }));
  
  // Forecast (next 3 months based on trend)
  const avgSold = sold > 0 ? Math.round(sold / 6) : 0;
  const forecast = [
    { month: 'Jan', predicted: Math.max(0, available - avgSold * 1) },
    { month: 'Feb', predicted: Math.max(0, available - avgSold * 2) },
    { month: 'Mar', predicted: Math.max(0, available - avgSold * 3) },
  ];
  
  return {
    modelId,
    modelName,
    description: '',
    total,
    available,
    reserved,
    sold,
    stockStatus,
    demandTrend,
    history,
    forecast
  };
};

/**
 * Create stock request (reorder from manufacturer)
 */
export const createStockRequest = async (modelId, quantity, notes = '') => {
  try {
    const token = localStorage.getItem('token');
    // TODO: Replace with actual API endpoint when available
    const request = {
      requestId: `REQ-${Date.now()}`,
      modelId,
      quantity,
      notes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Stock Request Created:', request);
    return { success: true, data: request };
  } catch (error) {
    console.error('Error creating stock request:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get brands, models, colors from API
 * These can be enhanced to call actual API endpoints when available
 */
export const getBrands = async () => {
  // TODO: Replace with actual API endpoint
  return [
    { brandId: 1, brandName: 'Tesla' },
    { brandId: 2, brandName: 'VinFast' },
    { brandId: 3, brandName: 'BYD' },
    { brandId: 4, brandName: 'Porsche' },
  ];
};

export const getModelsByBrand = async (brandName) => {
  // TODO: Replace with actual API endpoint
  if (!brandName || brandName === '') return [];
  return [];
};

export const getColorsByBrandAndModel = async (brandName, modelName) => {
  // TODO: Replace with actual API endpoint
  if (!brandName || !modelName) return [];
  return [];
};

export const getPriceByModelAndColor = async (brandName, modelName, color) => {
  // TODO: Replace with actual API endpoint
  if (!brandName || !modelName || !color) return null;
  return null;
};

export const createManufacturerRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('token');
    // TODO: Replace with actual API endpoint when available
    const request = {
      requestId: `REQ-${Date.now()}`,
      brand: requestData.brand,
      model: requestData.model,
      color: requestData.color,
      quantity: requestData.quantity,
      price: requestData.price || null,
      notes: requestData.notes || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Manufacturer Request Created:', request);
    return { success: true, data: request };
  } catch (error) {
    console.error('Error creating manufacturer request:', error);
    return { success: false, message: error.message };
  }
};

