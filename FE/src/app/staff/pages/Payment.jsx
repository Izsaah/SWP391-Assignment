import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { CreditCard, DollarSign, Edit2, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { getCustomersWithActiveInstallments, getCompletedPayments } from '../services/paymentService';
import { viewOrdersByCustomerId } from '../services/orderService';

const Payment = () => {
  const [activeTab, setActiveTab] = useState('installments'); // 'installments' or 'completed'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [monthsToDeduct, setMonthsToDeduct] = useState(1);
  
  // API data states
  const [installmentPayments, setInstallmentPayments] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch active installments on mount
  useEffect(() => {
    fetchActiveInstallments();
  }, []);

  const fetchActiveInstallments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Fetching active installments...');
      const result = await getCustomersWithActiveInstallments();
      console.log('📥 API Response:', result);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log(`✅ Received ${result.data.length} customers with active installments`);
        
        // Transform backend data to frontend format
        // Backend returns: customerId, name, address, email, phoneNumber, outstandingAmount
        // ⚠️ NOTE: Backend KHÔNG trả về planId, termMonth, paymentId, orderId
        const transformed = await Promise.all(
          result.data.map(async (customer) => {
            console.log('👤 Processing customer:', customer);
            console.log('👤 Customer keys:', Object.keys(customer));
            
            // Fetch orders for this customer to get order details (optional, for better UX)
            let orderId = null;
            try {
              const ordersResult = await viewOrdersByCustomerId(customer.customerId);
              if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
                orderId = ordersResult.data[0].orderId;
                console.log('✅ Found orderId:', orderId, 'for customer:', customer.customerId);
              }
            } catch (orderErr) {
              console.warn('⚠️ Could not fetch orders for customer:', customer.customerId, orderErr);
            }
            
            const transformedItem = {
              customerId: customer.customerId,
              customerName: customer.name || 'N/A',
              customerEmail: customer.email || 'N/A',
              customerPhone: customer.phoneNumber || 'N/A',
              customerAddress: customer.address || 'N/A',
              // Payment & Order info
              paymentId: customer.paymentId || customer.payment_id || null,
              orderId: customer.orderId || customer.order_id || orderId,
              // Amount info
              totalAmount: customer.totalAmount || customer.total_amount || 0, // Số tiền lúc mua xe
              paidAmount: customer.paidAmount || customer.paid_amount || 0, // Số tiền đã thanh toán
              outstandingAmount: customer.outstandingAmount || customer.outstanding_amount || 0, // Số tiền còn nợ
              // InstallmentPlan info (from backend)
              planId: customer.planId || customer.plan_id || null,
              currentTermMonth: customer.termMonth || customer.term_month || customer.currentTermMonth || null,
              monthlyPay: customer.monthlyPay || customer.monthly_pay || 0, // Số tiền trả hàng tháng
              status: customer.status || 'Active',
              method: 'TG' // Payment method for installment
            };
            
            console.log('👤 Transformed item:', transformedItem);
            return transformedItem;
          })
        );
        
        console.log('✅ Transformed data:', transformed);
        setInstallmentPayments(transformed);
      } else {
        console.warn('⚠️ No data received or invalid response:', result);
        console.warn('⚠️ Result success:', result.success);
        console.warn('⚠️ Result message:', result.message);
        setInstallmentPayments([]);
        
        // Hiển thị error message từ service
        if (result.message) {
          setError(result.message);
          console.log('📢 Error message set:', result.message);
        } else if (!result.success) {
          setError('Failed to retrieve installment payments');
        } else {
          // Nếu không có data nhưng success = true
          setError('No active installments found or empty response');
        }
      }
    } catch (err) {
      console.error('❌ Error fetching active installments:', err);
      setError(err.message || 'Failed to load installment payments. Please check the console for details.');
      setInstallmentPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed payments on mount
  useEffect(() => {
    fetchCompletedPayments();
  }, []);

     const fetchCompletedPayments = async () => {
     // Don't set loading=true here because it will conflict with installment loading
     // Use separate loading state if needed
     try {
       const result = await getCompletedPayments();
       if (result.success) {
         // Transform data to match frontend format
         const transformedData = result.data.map((payment) => {
           return {
             paymentId: payment.paymentId || payment.payment_id,
             orderId: payment.orderId || payment.order_id,
             customerName: payment.customerName || payment.customer_name || 'N/A',
             customerId: payment.customerId || payment.customer_id,
             amount: payment.amount || 0,
             paymentDate: payment.paymentDate || payment.payment_date,
             method: payment.method || 'TT',
             // Additional fields if available
             vehicle: payment.vehicle || payment.vehicleName || 'N/A',
             phone: payment.phone || payment.phoneNumber || 'N/A',
             email: payment.email || 'N/A'
           };
         });
         setCompletedPayments(transformedData);
         console.log('📦 Completed Payments:', transformedData);
       } else {
         // If endpoint doesn't exist, show empty state (not error)
         if (result.message && result.message.includes('does not exist')) {
           setCompletedPayments([]);
           console.warn('⚠️ Completed payments endpoint not available:', result.message);
         } else {
           setCompletedPayments([]);
         }
       }
     } catch (err) {
       console.error('❌ Error fetching completed payments:', err);
       setCompletedPayments([]);
     }
   };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };



  // Handle edit payment (deduct months)
  // NOTE: Backend doesn't track months paid directly, only status
  // This is a placeholder implementation - full months tracking would need backend support
  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setMonthsToDeduct(1);
    setIsEditPaymentModalOpen(true);
  };

  // Handle save payment deduction
  // NOTE: Backend only supports status updates (ACTIVE, PAID, OVERDUE)
  // Months tracking would need to be implemented on the backend
  const handleSavePaymentDeduction = async () => {
    if (!selectedPayment) return;

    const months = parseInt(monthsToDeduct);
    if (months <= 0) {
      alert('Please enter a valid number of months (greater than 0).');
      return;
    }

    // Validate planId exists
    if (!selectedPayment.planId) {
      alert('⚠️ Error: planId is missing from backend response.\n\nBackend needs to include planId in getCustomersWithActiveInstallments response.');
      return;
    }

    // Validate currentTermMonth exists
    if (selectedPayment.currentTermMonth === null || selectedPayment.currentTermMonth === undefined) {
      alert('⚠️ Error: currentTermMonth is missing from backend response.\n\nBackend needs to include termMonth in getCustomersWithActiveInstallments response.');
      return;
    }

    if (months > selectedPayment.currentTermMonth) {
      alert(`You cannot record more than ${selectedPayment.currentTermMonth} months (remaining months).`);
      return;
    }

    setUpdating(true);
    
    try {
      // Calculate new term month
      const newTermMonth = selectedPayment.currentTermMonth - months;
      
      // Determine new status
      let newStatus = 'ACTIVE';
      if (newTermMonth <= 0) {
        newStatus = 'PAID';
      } else {
        newStatus = selectedPayment.status === 'OVERDUE' || selectedPayment.status === 'Overdue' ? 'OVERDUE' : 'ACTIVE';
      }

      // Call backend to update installment plan
      const { updateInstallmentPlan } = await import('../services/paymentService');
      const result = await updateInstallmentPlan(
        selectedPayment.planId,
        newStatus,
        String(newTermMonth)
      );

      if (result.success) {
        alert(`✅ Successfully recorded ${months} month(s) payment!\n\nRemaining months: ${newTermMonth > 0 ? newTermMonth : 0}`);
        setIsEditPaymentModalOpen(false);
        setMonthsToDeduct(1);
        setSelectedPayment(null);
        
        // Refresh data
        await fetchActiveInstallments();
      } else {
        alert(`❌ Failed to update payment: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Failed to update payment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <CreditCard className="w-7 h-7" />
                <span>Payment Management</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage customer payments and debt tracking
              </p>
            </div>
          </div>
        </div>

        {/* Debug info - remove in production */}
        {import.meta.env.DEV && installmentPayments.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            <strong>Debug:</strong> Loaded {installmentPayments.length} installment payment(s)
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('installments')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'installments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Installment Payments</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'installments' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {installmentPayments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Completed Payments</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {completedPayments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Installment Payments Tab */}
        {activeTab === 'installments' && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading installment payments...</p>
                  </div>
                                 </div>
               </div>
             ) : error ? (
               <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                 <div className="text-center text-red-600">
                   <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                   <p className="font-medium mb-2">Lỗi khi tải dữ liệu</p>
                    <div className="mt-4 space-y-2 text-sm text-red-700 bg-red-50 p-4 rounded-lg text-left max-w-3xl mx-auto">
                       {/* Hiển thị error message với line breaks */}
                       <div className="whitespace-pre-line font-medium mb-4">
                         {error}
                       </div>
                       {error && error.includes('ngrok') ? (
                         <>
                           <p className="font-semibold mb-2">⚠️ Ngrok Warning Page Issue:</p>
                           <p className="mb-2">The API is returning an HTML warning page instead of JSON. This happens when ngrok free tier blocks the request.</p>
                           <p className="font-semibold mt-3 mb-2">Backend CORS Fix Needed:</p>
                           <p className="mb-2">In <code className="bg-gray-200 px-1 rounded">BE/src/main/java/filter/CorsFilter.java</code>, add:</p>
                           <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto mb-2">
{`resp.setHeader("Access-Control-Allow-Headers", 
  "Content-Type, Authorization, ngrok-skip-browser-warning");`}
                           </pre>
                           <p className="text-xs mt-2">After updating, restart your backend server.</p>
                         </>
                       ) : (
                         <>
                           <p className="font-semibold mb-2">Known Backend Issues (Cannot fix from frontend):</p>
                           <ul className="list-disc list-inside space-y-1 text-left mb-3">
                             <li><strong>Column Name Mismatch:</strong> InstallmentPlanDAO tries to read "monthly_rate" but database has "monthly_pay"</li>
                             <li><strong>IndexOutOfBoundsException:</strong> PaymentDAO.findPaymentById() doesn't check for empty list before accessing index 0</li>
                             <li><strong>Status Case Sensitivity:</strong> Ensure database status values match query ("Active" vs "ACTIVE")</li>
                           </ul>
                           <p className="font-semibold mt-3 mb-2">Backend Fixes Needed:</p>
                           <ol className="list-decimal list-inside space-y-1 text-left">
                             <li>In InstallmentPlanDAO.mapToInstallmentPlan(), change "monthly_rate" to "monthly_pay"</li>
                             <li>In PaymentDAO.findPaymentById(), add null/empty check: if (list == null || list.isEmpty()) return null;</li>
                             <li>Update CORS filter to allow "ngrok-skip-browser-warning" header</li>
                             <li>Check backend server console logs for SQLException details</li>
                             <li>Verify database InstallmentPlan table has status = "Active" (matching case)</li>
                           </ol>
                         </>
                       )}
                     </div>
                 </div>
               </div>
             ) : installmentPayments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No active installments found</p>
                  <p className="text-sm text-gray-500 mt-1">All customers have completed their payments</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outstanding Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining Months
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {installmentPayments.map((payment, index) => (
                        <tr key={payment.customerId || index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.customerName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">ID: {payment.customerId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.customerEmail || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{payment.customerPhone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.orderId ? `#${payment.orderId}` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-900">
                              {payment.totalAmount > 0 ? formatCurrency(payment.totalAmount) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Lúc mua xe</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">
                              {payment.paidAmount > 0 ? formatCurrency(payment.paidAmount) : '0 ₫'}
                            </div>
                            <div className="text-xs text-gray-500">Đã thanh toán</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-600">
                              {formatCurrency(payment.outstandingAmount)}
                            </div>
                            <div className="text-xs text-gray-500">Còn nợ</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.monthlyPay > 0 ? formatCurrency(payment.monthlyPay) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Mỗi tháng</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.currentTermMonth !== null && payment.currentTermMonth !== undefined 
                                ? `${payment.currentTermMonth} tháng`
                                : 'N/A'}
                            </div>
                          </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                               payment.status === 'Active' || payment.status === 'ACTIVE' 
                                 ? 'bg-yellow-100 text-yellow-800'
                                 : payment.status === 'Overdue' || payment.status === 'OVERDUE'
                                 ? 'bg-red-100 text-red-800'
                                 : 'bg-gray-100 text-gray-800'
                             }`}>
                               {payment.status || 'Active'}
                             </span>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Payments Tab */}
        {activeTab === 'completed' && (
          <div className="space-y-6">
                         {loading && activeTab === 'completed' ? (
               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                 <div className="flex items-center justify-center">
                   <div className="text-center">
                     <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                     <p className="text-gray-600 font-medium">Loading completed payments...</p>
                   </div>
                 </div>
               </div>
             ) : completedPayments.length === 0 && error && error.includes('does not exist') ? (
              <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
                <div className="text-center text-yellow-700">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-medium mb-2">Backend endpoint not available</p>
                  <div className="mt-4 space-y-2 text-sm text-yellow-700 bg-yellow-50 p-4 rounded-lg text-left max-w-3xl mx-auto">
                    <div className="whitespace-pre-line font-medium mb-4">
                      {error}
                    </div>
                    <p className="font-semibold mb-2">⚠️ Backend cần tạo:</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>PaymentService.getCompletedPayments() - lấy payments với method = &quot;TT&quot;</li>
                      <li>ViewCompletedPaymentsController - endpoint POST /api/staff/viewCompletedPayments</li>
                      <li>Trả về format: customerName, orderId, amount, paymentDate và các field khác</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : completedPayments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No completed payments found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    There are no completed payments (full payment - method = "TT") yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedPayments.map((payment, index) => (
                        <tr key={payment.paymentId || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                            <div className="text-sm text-gray-500">{payment.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">#{payment.orderId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.vehicle}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {payment.method || 'TT'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Payment Modal */}
        {isEditPaymentModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Payment</h2>
                
                                 <div className="space-y-4 mb-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                     <div className="text-base text-gray-900">{selectedPayment.customerName}</div>
                     <div className="text-xs text-gray-500">ID: {selectedPayment.customerId}</div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-blue-50 p-3 rounded-lg">
                       <label className="block text-xs font-medium text-blue-700 mb-1">Total Amount</label>
                       <div className="text-lg font-semibold text-blue-900">
                         {selectedPayment.totalAmount > 0 ? formatCurrency(selectedPayment.totalAmount) : 'N/A'}
                       </div>
                       <div className="text-xs text-blue-600 mt-1">Lúc mua xe</div>
                     </div>
                     
                     <div className="bg-green-50 p-3 rounded-lg">
                       <label className="block text-xs font-medium text-green-700 mb-1">Paid Amount</label>
                       <div className="text-lg font-semibold text-green-900">
                         {formatCurrency(selectedPayment.paidAmount || 0)}
                       </div>
                       <div className="text-xs text-green-600 mt-1">Đã thanh toán</div>
                     </div>
                   </div>
                   
                   <div className="bg-red-50 p-3 rounded-lg">
                     <label className="block text-xs font-medium text-red-700 mb-1">Outstanding Amount</label>
                     <div className="text-lg font-semibold text-red-900">
                       {formatCurrency(selectedPayment.outstandingAmount)}
                     </div>
                     <div className="text-xs text-red-600 mt-1">Còn nợ</div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     {selectedPayment.monthlyPay > 0 && (
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Payment</label>
                         <div className="text-base font-semibold text-gray-900">
                           {formatCurrency(selectedPayment.monthlyPay)}
                         </div>
                         <div className="text-xs text-gray-500">Mỗi tháng</div>
                       </div>
                     )}
                     
                     {selectedPayment.currentTermMonth !== null && selectedPayment.currentTermMonth !== undefined && (
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Số tháng còn lại</label>
                         <div className="text-base font-semibold text-gray-900">
                           {selectedPayment.currentTermMonth} tháng
                         </div>
                       </div>
                     )}
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Months to Record <span className="text-red-500">*</span>
                     </label>
                     <input
                       type="number"
                       min="1"
                       max={selectedPayment.currentTermMonth || undefined}
                       value={monthsToDeduct}
                       onChange={(e) => {
                         const value = parseInt(e.target.value) || 1;
                         const maxMonths = selectedPayment.currentTermMonth;
                         setMonthsToDeduct(maxMonths ? Math.min(value, maxMonths) : value);
                       }}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       disabled={updating || !selectedPayment.currentTermMonth}
                     />
                     {selectedPayment.currentTermMonth && (
                       <p className="text-xs text-gray-500 mt-1">
                         Maximum: {selectedPayment.currentTermMonth} months
                       </p>
                     )}
                   </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> Backend currently only supports status updates, not month-by-month tracking.
                      Full month reduction functionality requires backend support.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsEditPaymentModalOpen(false);
                      setSelectedPayment(null);
                      setMonthsToDeduct(1);
                    }}
                    disabled={updating}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePaymentDeduction}
                    disabled={updating}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payment;

