import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fix image URL - Thêm base URL nếu cần
 * @param {string} imageUrl - URL ảnh từ BE
 * @returns {string} - URL ảnh đã fix
 */
const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  console.log('🖼️ Original image URL from BE:', imageUrl);
  
  // Nếu đã có http/https thì giữ nguyên
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('✅ URL already has protocol, keeping as is:', imageUrl);
    return imageUrl;
  }
  
  // Nếu là relative path (bắt đầu bằng /), thêm base URL
  if (imageUrl.startsWith('/')) {
    const baseUrl = API_URL.replace('/api', ''); // Remove /api
    const fixedUrl = `${baseUrl}${imageUrl}`;
    console.log('🔧 Fixed relative path:', fixedUrl);
    return fixedUrl;
  }
  
  // Nếu chỉ là filename (không có / và không có http), thêm base URL + /images/
  // Ví dụ: "tesla-model3-white.jpg" -> "https://.../images/tesla-model3-white.jpg"
  const baseUrl = API_URL.replace('/api', ''); // Remove /api
  const fixedUrl = `${baseUrl}/images/${imageUrl}`;
  console.log('🔧 Fixed filename with /images/ path:', fixedUrl);
  return fixedUrl;
};

/**
 * Fetches variants for a specific model
 * @param {number} modelId - The model ID
 * @returns {Promise} - Promise containing variants data
 */
const fetchVariantsForModel = async (modelId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/searchVehicleVariant`,
      { id: modelId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data && response.data.data.variants) {
      return response.data.data.variants;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching variants for model ${modelId}:`, error);
    return [];
  }
};

/**
 * Fetches all inventory data from the backend
 * @returns {Promise} - Promise containing inventory data
 */
export const fetchInventory = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/viewInventory`,
      {}, // Empty body for POST request
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data) {
      // ✅ THÊM: Fetch variants cho mỗi model
      const inventories = response.data.data;
      
      for (const inventory of inventories) {
        if (inventory.list && Array.isArray(inventory.list)) {
          for (const model of inventory.list) {
            // Gọi API để lấy variants
            const variants = await fetchVariantsForModel(model.modelId);
            model.lists = variants; // Set variants vào model
          }
        }
      }
      
      return {
        success: true,
        data: inventories
      };
    } else {
      return {
        success: false,
        message: 'Invalid response format'
      };
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch inventory data'
    };
  }
};

/**
 * Transform backend inventory data to frontend format
 * Chỉ lấy xe có hàng (isActive=true và quantity>0)
 * @param {Array} backendData - Data from backend API
 * @returns {Array} - Transformed data for frontend
 */
export const transformInventoryData = (backendData) => {
  if (!backendData || !Array.isArray(backendData)) {
    return [];
  }

  const transformedData = [];

  backendData.forEach((inventory) => {
    // Kiểm tra có hàng không (quantity > 0)
    const hasStock = inventory.quantity && parseInt(inventory.quantity) > 0;
    
    if (!hasStock) {
      return; // Skip inventory không có hàng
    }

    // Iterate through each model in the inventory
    if (inventory.list && Array.isArray(inventory.list)) {
      inventory.list.forEach((model) => {
        // Chỉ lấy model đang active
        if (!model.isActive) {
          return;
        }

        // Check nếu có variants
        if (model.lists && Array.isArray(model.lists) && model.lists.length > 0) {
          // Có variants - iterate qua từng variant
          model.lists.forEach((variant) => {
            // Chỉ lấy variant đang active (có sẵn để bán)
            if (!variant.isActive) {
              return;
            }

            transformedData.push({
              // Basic IDs
              id: `${model.modelName}-${variant.variantId}`,
              inventoryId: inventory.inventoryId,
              modelId: model.modelId,
              variantId: variant.variantId,
              
              // Display information
              title: `${model.modelName} ${variant.versionName}`,
              model: model.modelName,
              variant: variant.versionName,
              color: variant.color,
              description: model.description,
              
              // Pricing
              price: variant.price,
              priceUsd: variant.price,
              
              // Image - Fix URL nếu cần
              imageUrl: variant.image ? fixImageUrl(variant.image) : null,
              
              // Status - luôn là "available" vì đã filter xe có hàng
              status: 'available',
              condition: 'New Vehicle',
              
              // Quantity
              quantity: inventory.quantity,
              
              // Active flags
              isActive: variant.isActive,
              modelActive: model.isActive
            });
          });
        } else {
          // KHÔNG có variants - hiển thị ở model level
          transformedData.push({
            // Basic IDs
            id: `model-${model.modelId}`,
            inventoryId: inventory.inventoryId,
            modelId: model.modelId,
            variantId: null,
            
            // Display information
            title: model.modelName,
            model: model.modelName,
            variant: 'Standard', // Default variant name
            color: 'N/A',
            description: model.description,
            
            // Pricing (default hoặc từ model nếu có)
            price: 0, // BE không có price ở model level
            priceUsd: 0,
            
            // Image - Fix URL nếu cần (model level không có image từ BE)
            imageUrl: null,
            
            // Status
            status: 'available',
            condition: 'New Vehicle',
            
            // Quantity
            quantity: inventory.quantity,
            
            // Active flags
            isActive: true,
            modelActive: model.isActive
          });
        }
      });
    }
  });

  return transformedData;
};

