import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get auth headers with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
};

// ==================== MODELS ====================

/**
 * Fetch all vehicle models
 * @returns {Promise} Promise containing models data
 */
export const fetchVehicleModels = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/viewVehicleForEVM`,
      { _empty: true },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch models',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch models',
      data: []
    };
  }
};

/**
 * Create a new vehicle model
 * @param {Object} modelData - Model data
 * @param {string} modelData.model_name - Model name
 * @param {string} modelData.description - Model description
 * @returns {Promise} Promise containing the result
 */
export const createVehicleModel = async (modelData) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/createVehicleModel`,
      {
        model_name: modelData.model_name,
        description: modelData.description || ''
      },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Model created successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create model'
      };
    }
  } catch (error) {
    console.error('Error creating model:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create model'
    };
  }
};

/**
 * Update a vehicle model
 * @param {Object} modelData - Model data
 * @param {number} modelData.model_id - Model ID
 * @param {string} modelData.model_name - Model name
 * @param {string} modelData.description - Model description
 * @returns {Promise} Promise containing the result
 */
export const updateVehicleModel = async (modelData) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/updateVehicleModel`,
      {
        model_id: modelData.model_id,
        model_name: modelData.model_name,
        description: modelData.description || ''
      },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Model updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update model'
      };
    }
  } catch (error) {
    console.error('Error updating model:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update model'
    };
  }
};

/**
 * Enable a vehicle model
 * @param {number} modelId - Model ID
 * @returns {Promise} Promise containing the result
 */
export const enableVehicleModel = async (modelId) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/enableVehicleModel`,
      { model_id: parseInt(modelId) },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Model enabled successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to enable model'
      };
    }
  } catch (error) {
    console.error('Error enabling model:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to enable model'
    };
  }
};

/**
 * Disable a vehicle model
 * @param {number} modelId - Model ID
 * @returns {Promise} Promise containing the result
 */
export const disableVehicleModel = async (modelId) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/disableVehicleModel`,
      { model_id: parseInt(modelId) },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Model disabled successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to disable model'
      };
    }
  } catch (error) {
    console.error('Error disabling model:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to disable model'
    };
  }
};

// ==================== VARIANTS ====================

/**
 * Fetch variants for a specific model
 * @param {number} modelId - Model ID
 * @returns {Promise} Promise containing variants data
 */
export const fetchVehicleVariants = async (modelId) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/viewVehicleVariant`,
      { model_id: parseInt(modelId) },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch variants',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching variants:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch variants',
      data: []
    };
  }
};

/**
 * Create a new vehicle variant
 * @param {Object} variantData - Variant data
 * @param {number} variantData.model_id - Model ID
 * @param {string} variantData.version_name - Version name
 * @param {string} variantData.color - Color
 * @param {number} variantData.price - Price
 * @returns {Promise} Promise containing the result
 */
export const createVehicleVariant = async (variantData) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/createVehicleVariant`,
      {
        model_id: parseInt(variantData.model_id),
        version_name: variantData.version_name,
        color: variantData.color,
        image: variantData.image || '',
        price: parseFloat(variantData.price)
      },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Variant created successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create variant'
      };
    }
  } catch (error) {
    console.error('Error creating variant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create variant'
    };
  }
};

/**
 * Update a vehicle variant
 * @param {Object} variantData - Variant data
 * @param {number} variantData.variant_id - Variant ID
 * @param {number} variantData.model_id - Model ID
 * @param {string} variantData.version_name - Version name
 * @param {string} variantData.color - Color
 * @param {number} variantData.price - Price
 * @returns {Promise} Promise containing the result
 */
export const updateVehicleVariant = async (variantData) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/updateVehicleVariant`,
      {
        variant_id: parseInt(variantData.variant_id),
        model_id: parseInt(variantData.model_id),
        version_name: variantData.version_name,
        color: variantData.color,
        image: variantData.image || '',
        price: parseFloat(variantData.price)
      },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Variant updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update variant'
      };
    }
  } catch (error) {
    console.error('Error updating variant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update variant'
    };
  }
};

/**
 * Enable a vehicle variant
 * @param {number} variantId - Variant ID
 * @returns {Promise} Promise containing the result
 */
export const enableVehicleVariant = async (variantId) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/enableVehicleVariant`,
      { variant_id: parseInt(variantId) },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Variant enabled successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to enable variant'
      };
    }
  } catch (error) {
    console.error('Error enabling variant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to enable variant'
    };
  }
};

/**
 * Disable a vehicle variant
 * @param {number} variantId - Variant ID
 * @returns {Promise} Promise containing the result
 */
export const disableVehicleVariant = async (variantId) => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/disableVehicleVariant`,
      { variant_id: parseInt(variantId) },
      { headers: getAuthHeaders() }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Variant disabled successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to disable variant'
      };
    }
  } catch (error) {
    console.error('Error disabling variant:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to disable variant'
    };
  }
};

