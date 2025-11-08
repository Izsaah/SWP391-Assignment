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
 * Backend endpoint: POST /api/staff/viewOrdersByStaffId
 * Gets orders for the logged-in staff member (extracted from JWT token)
 * @returns {Promise} - Promise containing orders data
 */
export const viewOrdersByStaffId = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await axios.post(
      `${API_URL}/staff/viewOrdersByStaffId`,
      {},
      {
        headers
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
    console.error('Error viewing orders by staff ID:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve orders',
      data: []
    };
  }
};

/**
 * Update order status
 * Backend endpoint: POST /api/staff/updateOrderStatuss (note: double 's' in the URL)
 * @param {number} orderId - Order ID
 * @param {string} status - New status: "Pending", "Delivered", or "Cancel"
 * @returns {Promise} - Promise containing the result
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    
    // Validate status values
    const validStatuses = ['Pending', 'Delivered', 'Cancel'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      };
    }
    
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await axios.post(
      `${API_URL}/staff/updateOrderStatuss`, // Note: double 's' in the endpoint URL
      {
        order_id: orderId,
        status: status
      },
      { headers }
    );
    
    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Order status updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update order status'
      };
    }
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update order status'
    };
  }
};
