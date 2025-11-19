import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch dealer sales records
 * @returns {Promise} Promise containing sales data
 */
export const fetchDealerSaleRecords = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found. Please login again.',
        data: []
      };
    }

    const response = await axios.post(
      `${API_URL}/EVM/dealerSaleRecords`,
      { _empty: true },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );

    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch sales data',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch sales data',
      data: []
    };
  }
};

