import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all dealer accounts
 * @returns {Promise} Promise containing users data
 */
export const fetchAllDealerAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/viewAllDealerAccounts`,
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
        message: response.data?.message || 'Failed to fetch users',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch users',
      data: []
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
        message: response.data?.message || 'Failed to fetch dealers',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch dealers',
      data: []
    };
  }
};

/**
 * Create a new dealer account
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.phoneNumber - Phone number
 * @param {string} userData.password - Password
 * @param {number} userData.dealerId - Dealer ID
 * @param {number} userData.roleId - Role ID (2 for Manager, 3 for Staff)
 * @returns {Promise} Promise containing the result
 */
export const createDealerAccount = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/createDealerAccount`,
      {
        username: userData.username.trim(),
        email: userData.email.trim(),
        phoneNumber: userData.phoneNumber.trim(),
        password: userData.password,
        dealerId: parseInt(userData.dealerId),
        roleId: parseInt(userData.roleId)
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
        message: response.data.message || 'User created successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create user'
      };
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create user'
    };
  }
};

/**
 * Update dealer account
 * @param {Object} userData - User data
 * @param {number} userData.userId - User ID
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.phoneNumber - Phone number
 * @param {number} userData.dealerId - Dealer ID
 * @param {number} userData.roleId - Role ID
 * @param {boolean} userData.isActive - Active status
 * @returns {Promise} Promise containing the result
 */
export const updateDealerAccount = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/updateDealerAccount`,
      {
        userId: parseInt(userData.userId),
        username: userData.username.trim(),
        email: userData.email.trim(),
        phoneNumber: userData.phoneNumber.trim(),
        dealerId: parseInt(userData.dealerId),
        roleId: parseInt(userData.roleId),
        isActive: userData.isActive
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
        message: response.data.message || 'User updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update user'
      };
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user'
    };
  }
};

/**
 * Toggle user active status
 * @param {number} userId - User ID
 * @param {boolean} isActive - New active status
 * @returns {Promise} Promise containing the result
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/EVM/updateDealerAccount`,
      {
        userId: parseInt(userId),
        isActive: isActive
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
        message: response.data.message || 'User status updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update user status'
      };
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user status'
    };
  }
};

