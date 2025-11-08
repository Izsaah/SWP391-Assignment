import axios from 'axios';
import { getAllCustomers } from './customerService';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get customer by ID
 * Uses getAllCustomers and filters by customer ID
 * @param {number} customerId - Customer ID
 * @returns {Promise} - Promise containing customer data
 */
export const getCustomerById = async (customerId) => {
  try {
    // Use getAllCustomers to get all customers, then filter by ID
    const result = await getAllCustomers();
    
    if (result.success && result.data && Array.isArray(result.data)) {
      const customer = result.data.find(c => {
        const id = c.customerId || c.customer_id || c.id;
        return id === customerId || String(id) === String(customerId);
      });
      
      if (customer) {
        return {
          success: true,
          data: customer
        };
      }
    }
    
    return {
      success: false,
      message: 'Customer not found',
      data: null
    };
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get customer',
      data: null
    };
  }
};

/**
 * Get feedback by customer ID
 * Uses the searchCustomerForFeedBack endpoint which returns customers with their feedback
 * @param {number} customerId - Customer ID
 * @returns {Promise} - Promise containing feedback data
 */
export const getFeedbackByCustomerId = async (customerId) => {
  try {
    const token = localStorage.getItem('token');
    
    // First get customer to know their name
    const customerResult = await getCustomerById(customerId);
    
    if (!customerResult.success || !customerResult.data) {
      return {
        success: true,
        data: []
      };
    }
    
    const customerName = customerResult.data.name;
    
    // Use searchCustomerForFeedBack to get customer with feedback
    const response = await axios.post(
      `${API_URL}/staff/searchCustomerForFeedBack`,
      { name: customerName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      // Find customer by ID (in case multiple customers have same name)
      const customer = response.data.data.find(c => {
        const id = c.customerId || c.customer_id || c.id;
        return id === customerId || String(id) === String(customerId);
      });
      
      if (customer) {
        const feedbackList = customer.feedBackList || 
                            customer.feedbackList || 
                            customer.feedbacks || [];
        
        return {
          success: true,
          data: Array.isArray(feedbackList) ? feedbackList : []
        };
      }
    }
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Error getting feedback by customer ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get feedback',
      data: []
    };
  }
};

/**
 * Get test drive schedules by customer ID
 * Uses the searchCustomerForSchedule endpoint which returns customers with their test drive schedule
 * @param {number} customerId - Customer ID
 * @returns {Promise} - Promise containing test drive data
 */
export const getTestDrivesByCustomerId = async (customerId) => {
  try {
    const token = localStorage.getItem('token');
    
    // First get customer to know their name
    const customerResult = await getCustomerById(customerId);
    
    if (!customerResult.success || !customerResult.data) {
      return {
        success: true,
        data: []
      };
    }
    
    const customerName = customerResult.data.name;
    
    // Use searchCustomerForSchedule to get customer with test drive schedule
    const response = await axios.post(
      `${API_URL}/staff/searchCustomerForSchedule`,
      { name: customerName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      // Find customer by ID (in case multiple customers have same name)
      const customer = response.data.data.find(c => {
        const id = c.customerId || c.customer_id || c.id;
        return id === customerId || String(id) === String(customerId);
      });
      
      if (customer && customer.testDriveSchedule) {
        // Backend returns one test drive schedule, but we'll wrap it in an array
        const testDrive = customer.testDriveSchedule;
        return {
          success: true,
          data: [testDrive] // Return as array for consistency
        };
      }
    }
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Error getting test drives by customer ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get test drives',
      data: []
    };
  }
};

