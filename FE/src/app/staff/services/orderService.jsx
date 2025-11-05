import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise} - Promise containing the result
 */
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/createOrder`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Order created successfully',
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create order'
      };
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create order'
    };
  }
};

/**
 * View orders by customer ID
 * @param {number} customerId - Customer ID
 * @returns {Promise} - Promise containing orders data
 */
export const viewOrdersByCustomerId = async (customerId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/viewOrders`,
      { customerId: customerId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data || []
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to retrieve orders',
        data: []
      };
    }
  } catch (error) {
    console.error('Error viewing orders:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve orders',
      data: []
    };
  }
};

/**
 * Approve custom order
 * @param {number} orderId - Order ID
 * @param {boolean} isAgree - Whether to approve or disagree
 * @param {number} unitPrice - Unit price
 * @returns {Promise} - Promise containing the result
 */
export const approveCustomOrder = async (orderId, isAgree, unitPrice) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/approveCustomOrder`,
      { orderId, isAgree, unitPrice },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Custom order processed successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to process custom order'
      };
    }
  } catch (error) {
    console.error('Error approving custom order:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to process custom order'
    };
  }
};

/**
 * View orders by dealer staff ID
 * NOTE: Backend endpoint does not exist yet - this is prepared for future implementation
 * @returns {Promise} - Promise containing orders data
 */
export const viewOrdersByStaffId = async () => {
  // TODO: Implement when backend endpoint is available
  // The service method GetListOrderByDealerStaffId exists but no controller endpoint
  return {
    success: false,
    message: 'Backend endpoint for viewing orders by staff ID is not available yet',
    data: []
  };
};

/**
 * Update order status
 * NOTE: Backend endpoint does not exist yet - this is prepared for future implementation
 * @returns {Promise} - Promise containing the result
 */
export const updateOrderStatus = async () => {
  // TODO: Implement when backend endpoint is available
  return {
    success: false,
    message: 'Backend endpoint for updating order status is not available yet'
  };
};
