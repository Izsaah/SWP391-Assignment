import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all promotions with dealer count
 * @returns {Promise} Promise containing promotions data
 */
export const fetchPromotions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/viewPromotionDealerCount`,
      { _empty: true },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch promotions'
      };
    }
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch promotions'
    };
  }
};

/**
 * Fetch all dealers
 * @returns {Promise} Promise containing dealers data
 */
export const fetchAllDealers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/viewAllDealer`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch dealers'
      };
    }
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch dealers'
    };
  }
};

/**
 * Create a new promotion
 * @param {Object} promotionData - Promotion data
 * @param {string} promotionData.description - Promotion description
 * @param {string} promotionData.startDate - Start date (YYYY-MM-DD)
 * @param {string} promotionData.endDate - End date (YYYY-MM-DD)
 * @param {string|number} promotionData.discountRate - Discount rate (0.05 for 5% or fixed amount)
 * @param {string} promotionData.type - Type: 'PERCENTAGE' or 'FIXED'
 * @returns {Promise} Promise containing the result
 */
export const createPromotion = async (promotionData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/createPromotion`,
      {
        description: promotionData.description.trim(),
        startDate: promotionData.startDate.trim(),
        endDate: promotionData.endDate.trim(),
        discountRate: promotionData.discountRate,
        type: promotionData.type
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Promotion created successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create promotion'
      };
    }
  } catch (error) {
    console.error('Error creating promotion:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create promotion'
    };
  }
};

/**
 * Apply promotion to a dealer
 * @param {number} promoId - Promotion ID
 * @param {number} dealerId - Dealer ID
 * @returns {Promise} Promise containing the result
 */
export const applyPromotionToDealer = async (promoId, dealerId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/createDealerPromotions`,
      {
        promoId: parseInt(promoId),
        dealerId: parseInt(dealerId)
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Promotion applied to dealer successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to apply promotion to dealer'
      };
    }
  } catch (error) {
    console.error('Error applying promotion:', error);
    if (error.response?.status === 400 || error.response?.status === 409) {
      return {
        success: false,
        message: error.response?.data?.message || 'Promotion may already be assigned to this dealer'
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to apply promotion to dealer'
    };
  }
};

/**
 * Delete a promotion
 * @param {number} promoId - Promotion ID
 * @returns {Promise} Promise containing the result
 */
export const deletePromotion = async (promoId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/deletePromotion`,
      { promoId: parseInt(promoId) },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Promotion deleted successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to delete promotion'
      };
    }
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete promotion'
    };
  }
};

/**
 * Unassign promotion from a dealer
 * @param {number} promoId - Promotion ID
 * @param {number} dealerId - Dealer ID
 * @returns {Promise} Promise containing the result
 */
export const unassignPromotionFromDealer = async (promoId, dealerId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/deleteDealerPromotion`,
      {
        promoId: parseInt(promoId),
        dealerId: parseInt(dealerId)
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Promotion unassigned from dealer successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to unassign promotion from dealer'
      };
    }
  } catch (error) {
    console.error('Error unassigning promotion:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to unassign promotion from dealer'
    };
  }
};

