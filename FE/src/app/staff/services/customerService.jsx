import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Search customers by name
 * @param {string} name - Customer name to search
 * @returns {Promise} - Promise containing customers data
 */
export const searchCustomersByName = async (name) => {
  try {
    const token = localStorage.getItem('token');
    
          const response = await axios.post(
      `${API_URL}/staff/searchCustomerByName`,
      { name: name },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || []
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Invalid response format'
      };
    }
  } catch (error) {
    console.error('Error searching customers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search customers'
    };
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer data {name, address, email, phoneNumber}
 * @returns {Promise} - Promise containing the result
 */
export const createCustomer = async (customerData) => {
  try {
    const token = localStorage.getItem('token');
    
          const response = await axios.post(
      `${API_URL}/staff/createCustomer`,
      customerData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create customer'
      };
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create customer'
    };
  }
};
