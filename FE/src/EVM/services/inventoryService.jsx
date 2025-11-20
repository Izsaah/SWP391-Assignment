import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  const isNgrok = API_URL?.includes('ngrok');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  if (isNgrok) headers['ngrok-skip-browser-warning'] = 'true';
  return headers;
};

/**
 * Fetch consumption rate data from BE
 * Backend endpoint: POST /api/EVM/viewConsumptionRate
 * Returns: List<String> with format "ModelName Consumption Rate: X.XX"
 */
export const fetchConsumptionRate = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/EVM/viewConsumptionRate`,
      {},
      { headers: authHeaders() }
    );

    if (response.data && response.data.status === 'success' && response.data.data) {
      const consumptionData = response.data.data || [];
      
      // Parse consumption rate data from BE format: "ModelName Consumption Rate: X.XX"
      // Just parse and return whatever BE sends, no filtering
      const parsedData = consumptionData.map((item) => {
        if (typeof item === 'string') {
          // Format: "EV Falcon Consumption Rate: 1.23"
          const match = item.match(/^(.+?)\s+Consumption Rate:\s*([\d.]+)$/);
          if (match) {
            return {
              modelName: match[1].trim(),
              consumptionRate: parseFloat(match[2]) || 0
            };
          }
        }
        return null;
      }).filter(Boolean);

      // Return whatever BE sends, even if all rates are 0
      return {
        success: true,
        data: parsedData
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Failed to fetch consumption rate',
      data: []
    };
  } catch (error) {
    console.error('Error fetching consumption rate:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch consumption rate',
      data: []
    };
  }
};

