import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Create a payment
 * @param {Object} paymentData - Payment data {orderId, method, interestRate?, termMonth?, monthlyPay?, status?}
 * @returns {Promise} - Promise containing the result
 */
export const createPayment = async (paymentData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/createPayment`,
      paymentData,
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
        message: response.data.message || 'Payment created successfully',
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to create payment'
      };
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create payment'
    };
  }
};

/**
 * Update installment plan status (reduce months paid)
 * @param {number} planId - Installment plan ID
 * @param {string} status - New status (ACTIVE, PAID, OVERDUE)
 * @param {string} termMonth - New term month (remaining months)
 * @returns {Promise} - Promise containing the result
 */
export const updateInstallmentPlan = async (planId, status, termMonth) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/staff/updateInstallmentPlan`,
      { planId, status, termMonth },
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
        message: response.data.message || 'Installment plan updated successfully',
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to update installment plan'
      };
    }
  } catch (error) {
    console.error('Error updating installment plan:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update installment plan'
    };
  }
};

/**
 * Get customers with active installments
 * @returns {Promise} - Promise containing customers with active installments   
 */
export const getCustomersWithActiveInstallments = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/staff/viewCustomerWithActiveInstallments`;
    
    // Kiểm tra xem có phải ngrok URL không và chuẩn bị headers
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // ✅ Nếu backend đã cập nhật CORS để allow ngrok-skip-browser-warning,
    // thì thêm header này để tự động bypass ngrok warning
    // Backend cần cập nhật: resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
      console.log('🔍 Detected ngrok URL, adding ngrok-skip-browser-warning header');
      console.log('⚠️ Note: Nếu backend chưa allow header này trong CORS, sẽ bị lỗi 405');
      console.log('⚠️ Backend cần cập nhật CorsFilter.java line 28:');
      console.log('⚠️ resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");');
    }
    
    // Thử POST trước (theo đúng BE - doPost)
    let response;
    let method = 'POST';
    
    try {
      console.log('🔍 API Call: POST', url);
      response = await axios.post(
        url,
        {}, // Empty body vì backend không cần params
        { headers }
      );
    } catch (postError) {
      // Nếu POST bị 405 (Method Not Allowed), thử GET
      if (postError.response?.status === 405 || postError.message?.includes('405')) {
        console.warn('⚠️ POST failed with 405, trying GET instead...');
        method = 'GET';
        try {
          console.log('🔍 API Call: GET (fallback)', url);
          response = await axios.get(
            url,
            { headers }
          );
          // Nếu GET thành công, tiếp tục với response
          console.log('✅ GET fallback successful');
        } catch (getError) {
          // Nếu cả GET cũng lỗi, throw error GET để có thông tin mới nhất
          console.error('❌ Both POST and GET failed');
          throw getError;
        }
      } else {
        // Nếu không phải 405, throw error POST
        throw postError;
      }
    }

    console.log(`📦 API Response (${method}):`, response);
    console.log('📦 Response Data:', response.data);
    console.log('📦 Response Data Type:', typeof response.data);
    
    // Check if response is HTML (ngrok warning page or error page)
    const isHtmlResponse = typeof response.data === 'string' && 
                          (response.data.includes('<!DOCTYPE html>') || 
                           response.data.includes('<html') ||
                           response.data.includes('ngrok') ||
                           response.data.includes('Warning'));
    
    if (isHtmlResponse) {
      console.error('❌ Received HTML instead of JSON - ngrok warning page detected');
      console.error('❌ HTML Response Preview:', response.data.substring(0, 500));
      
      // Extract ngrok URL từ API_URL
      const ngrokBaseUrl = API_URL?.replace('/api', '') || 'https://your-ngrok-url.com';
      
      return {
        success: false,
        message: '⚠️ NGROK WARNING PAGE ĐANG CHẶN REQUEST!\n\n' +
                 'Ngrok free tier đang chặn request và trả về HTML warning page thay vì JSON.\n\n' +
                 '🔧 GIẢI PHÁP (Làm theo thứ tự):\n\n' +
                 '1. ⭐ BƯỚC QUAN TRỌNG - Bypass ngrok warning:\n' +
                 `   → Mở URL này trong browser: ${ngrokBaseUrl}\n` +
                 '   → Click vào nút "Visit Site" để bypass warning\n' +
                 '   → Đợi trang load xong (có thể thấy JSON error - đó là OK, vì không có token)\n' +
                 '   → ĐÓNG tab đó lại\n' +
                 '   → Quay lại tab Payment này và REFRESH lại (F5 hoặc Ctrl+R)\n\n' +
                 '2. ⚠️ LƯU Ý: Response bạn thấy khi mở URL trực tiếp:\n' +
                 '   {"status":"error","message":"Missing or invalid Authorization header"}\n' +
                 '   → Đây là BÌNH THƯỜNG vì mở trực tiếp không có token\n' +
                 '   → Quan trọng là đã bypass được ngrok warning\n\n' +
                 '3. Sau khi refresh trang Payment, request từ frontend (có token) sẽ đi qua\n\n' +
                 '4. Nếu vẫn không được, thử:\n' +
                 '   → Clear browser cache và cookies\n' +
                 '   → Đăng nhập lại\n' +
                 '   → Refresh trang Payment\n\n' +
                 '5. Hoặc sử dụng ngrok paid plan để không bị warning',
        data: []
      };
    }
    
    // Log chi tiết structure của data
    if (response.data && response.data.data) {
      console.log('📦 Response Data Array:', response.data.data);
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        console.log('📦 First Item Structure:', response.data.data[0]);
        console.log('📦 First Item Keys:', Object.keys(response.data.data[0]));
      }
    }

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data || []
      };
    } else {
      console.warn('⚠️ API returned non-success status:', response.data);
      return {
        success: false,
        message: response.data?.message || 'Failed to retrieve customers',      
        data: response.data?.data || []
      };
    }
  } catch (error) {
    console.error('❌ Error getting customers with active installments:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error response status:', error.response?.status);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error response data type:', typeof error.response?.data);
    console.error('❌ Error response headers:', error.response?.headers);
    
    // Kiểm tra xem error.response.data có phải HTML không (ngrok warning page)
    const errorData = error.response?.data;
    const isErrorHtml = typeof errorData === 'string' && 
                        (errorData.includes('<!DOCTYPE html>') || 
                         errorData.includes('<html') ||
                         errorData.includes('ngrok') ||
                         errorData.includes('Warning'));
    
    if (isErrorHtml) {
      console.error('❌ Ngrok Warning Page detected in error response!');
      console.error('❌ HTML Error Response Preview:', errorData.substring(0, 500));
      return {
        success: false,
        message: '⚠️ Ngrok Warning Page đang chặn request!\n\n' +
                 'Ngrok free tier đang chặn request và trả về HTML warning page.\n\n' +
                 '🔧 Giải pháp:\n' +
                 '1. ⭐ QUAN TRỌNG: Truy cập URL ngrok trực tiếp trong browser để bypass warning:\n' +
                 `   ${API_URL?.replace('/api', '') || 'https://your-ngrok-url.com'}\n` +
                 '   → Click vào nút "Visit Site" để bypass warning\n' +
                 '   → Sau đó quay lại trang này và refresh\n\n' +
                 '2. (Tùy chọn) Backend có thể cập nhật CORS filter để allow header:\n' +
                 '   File: BE/src/main/java/filter/CorsFilter.java\n' +
                 '   resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");\n' +
                 '   Sau đó restart backend và thêm lại header vào code\n\n' +
                 '3. Hoặc sử dụng ngrok paid plan để không bị warning',
        data: []
      };
    }
    
    // Xử lý CORS error
    if (error.message && (error.message.includes('CORS') || error.message.includes('Access-Control'))) {
      console.error('❌ CORS Error detected!');
      console.error('❌ CORS Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      return {
        success: false,
        message: '🚫 CORS Error: Backend không cho phép header hoặc origin.\n\n' +
                 'Giải pháp:\n' +
                 '1. Kiểm tra backend CORS filter có allow origin của bạn không\n' +
                 '2. Nếu dùng ngrok, truy cập URL ngrok trực tiếp trong browser để bypass warning\n' +
                 '3. Backend có thể cập nhật CORS filter nếu cần:\n' +
                 '   File: BE/src/main/java/filter/CorsFilter.java',
        data: []
      };
    }
    
    // Xử lý 405 Method Not Allowed
    if (error.response?.status === 405) {
      console.error('❌ 405 Method Not Allowed!');
      const isNgrokUrl = API_URL?.includes('ngrok');
      const ngrokBaseUrl = API_URL?.replace('/api', '') || '';
      
      // Extract ngrok domain từ URL
      let ngrokDomain = '';
      if (isNgrokUrl && ngrokBaseUrl) {
        try {
          const url = new URL(ngrokBaseUrl);
          ngrokDomain = url.hostname;
        } catch {
          ngrokDomain = ngrokBaseUrl.replace('https://', '').replace('http://', '').split('/')[0];
        }
      }
      
      return {
        success: false,
        message: '❌ 405 Method Not Allowed!\n\n' +
                 '⚠️ NGUYÊN NHÂN CÓ THỂ:\n' +
                 '1. CORS Filter chưa có ngrok URL mới của bạn\n' +
                 '2. Backend không hỗ trợ method này\n\n' +
                 (isNgrokUrl && ngrokDomain ? 
                   '🔧 GIẢI PHÁP - Backend cần cập nhật CORS Filter:\n\n' +
                   `File: BE/src/main/java/filter/CorsFilter.java\n` +
                   `Dòng 22-25, thêm ngrok URL mới:\n\n` +
                   `if (origin != null && (\n` +
                   `        origin.equals("http://localhost:5173") ||\n` +
                   `        origin.equals("https://${ngrokDomain}") ||\n` +
                   `        origin.equals("https://de5c6309160a.ngrok-free.app")\n` +
                   `)) {\n\n` +
                   `Sau đó restart backend server.\n\n` :
                   '') +
                 '⚠️ Lưu ý: Nếu người khác chạy ngrok trên máy khác, họ cần:\n' +
                 '1. Cập nhật CORS filter với ngrok URL mới\n' +
                 '2. Restart backend server',
        data: []
      };
    }
    
    // Xử lý network error (có thể là ngrok đang chặn)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Failed to fetch') || error.message.includes('ERR_FAILED')) {
      console.error('❌ Network Error detected!');
      console.error('❌ This could be ngrok blocking the request');
      
      // Kiểm tra xem có phải ngrok URL không
      const isNgrokUrl = API_URL?.includes('ngrok');
      
      return {
        success: false,
        message: '🌐 Network Error: Không thể kết nối đến server.\n\n' +
                 (isNgrokUrl ? 
                   '⚠️ Bạn đang dùng ngrok - có thể ngrok đang chặn request!\n\n' :
                   'Vui lòng kiểm tra:\n') +
                 '1. Backend server đang chạy\n' +
                 '2. URL API đúng: ' + API_URL + '\n' +
                 '3. Ngrok tunnel đang hoạt động (nếu dùng ngrok)\n\n' +
                 (isNgrokUrl ? 
                   '🔧 Nếu dùng ngrok:\n' +
                   `   - Truy cập ${API_URL?.replace('/api', '') || 'ngrok URL'} trong browser\n` +
                   '   - Click "Visit Site" để bypass warning\n' +
                   '   - Sau đó refresh lại trang này\n\n' :
                   '') +
                 '4. Kiểm tra firewall/antivirus có chặn không\n' +
                 '5. Kiểm tra network connection',
        data: []
      };
    }
    
    // Extract error message from response
    let errorMessage = 'Failed to retrieve customers';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
      data: []
    };
  }
};

/**
 * Get completed payments (payments with method = "TT")
 * Backend endpoint needed: POST /api/staff/viewCompletedPayments
 * @returns {Promise} - Promise containing completed payments data
 */
export const getCompletedPayments = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/staff/viewCompletedPayments`;
    
    const isNgrokUrl = API_URL?.includes('ngrok');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    if (isNgrokUrl) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    let response;
    
    try {
      console.log('🔍 API Call: POST', url);
      response = await axios.post(
        url,
        {}, // Empty body
        { headers }
      );
    } catch (postError) {
      if (postError.response?.status === 405 || postError.message?.includes('405')) {
        console.warn('⚠️ POST failed with 405, trying GET instead...');
        try {
          console.log('🔍 API Call: GET (fallback)', url);
          response = await axios.get(url, { headers });
          console.log('✅ GET fallback successful');
        } catch (getError) {
          console.error('❌ Both POST and GET failed');
          throw getError;
        }
      } else {
        throw postError;
      }
    }
    
    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data || []
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to retrieve completed payments',
        data: response.data?.data || []
      };
    }
  } catch (error) {
    console.error('❌ Error getting completed payments:', error);
    
    // If endpoint doesn't exist (404), return empty data with helpful message
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Backend endpoint /api/staff/viewCompletedPayments does not exist yet.\n\n' +
                 'Backend needs to create:\n' +
                 '1. PaymentService.getCompletedPayments() - filter payments where method = "TT"\n' +
                 '2. ViewCompletedPaymentsController - POST endpoint\n' +
                 '3. Return data format: [{customerName, orderId, amount, paymentDate, ...}]',
        data: []
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve completed payments',
      data: []
    };
  }
};

/**
 * Get all payments (full payment and installments)
 * NOTE: Backend endpoint does not exist - only active installments endpoint is available
 * @returns {Promise} - Promise containing all payments data
 */
export const getAllPayments = async () => {
  // TODO: Implement when backend endpoint is available
  return {
    success: false,
    message: 'Backend endpoint for viewing all payments is not available yet',
    data: []
  };
};
