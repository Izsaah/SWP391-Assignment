import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout';
import { CreditCard, DollarSign, Edit2, TrendingDown, AlertCircle, Loader2, Info, Minus } from 'lucide-react';
import { getCustomersWithActiveInstallments, getCompletedPayments, updateInstallmentPlan } from '../services/paymentService';
import { viewOrdersByCustomerId } from '../services/orderService';

const Payment = () => {
  const [activeTab, setActiveTab] = useState('installments'); // 'installments' or 'completed'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [monthsToDeduct, setMonthsToDeduct] = useState(1);
  
  // API data states
  const [installmentPayments, setInstallmentPayments] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Format currency helper function (defined early for use in fetchActiveInstallments)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

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
        // ✅ Backend now returns ALL needed data: planId, interestRate, termMonth, monthlyPay, status, paymentId, orderId, totalAmount, paymentDate, method
        // ✅ totalAmount comes from Payment.amount (Payment table) - this is the correct source
        // ✅ paidAmount = totalAmount - outstandingAmount (NOT calculated from monthlyPay * months + interest)
        const transformed = result.data.map((customer) => {
          // ✅ Use backend data directly - no need to fetch from orders API anymore!
          const planId = customer.planId || null;
          const interestRate = parseFloat(customer.interestRate || 0);
          const termMonth = customer.termMonth ? parseInt(customer.termMonth) : null;
          const monthlyPay = parseFloat(customer.monthlyPay || 0);
          const status = customer.status || 'ACTIVE';
          const outstandingAmount = parseFloat(customer.outstandingAmount || 0);
          
          // ✅ Get payment information directly from backend response (Payment table)
          // Backend now returns: paymentId, orderId, totalAmount, paymentDate, method
          const paymentId = customer.paymentId || null;
          const orderId = customer.orderId || null;
          const totalAmount = parseFloat(customer.totalAmount || 0); // ⭐ From Payment.amount (Payment table)
          const paymentDate = customer.paymentDate || null;
          const method = customer.method || 'TG';
          
          // ⭐ CORRECT CALCULATION: paidAmount = totalAmount - outstandingAmount
          // ❌ WRONG: paidAmount ≠ monthlyPay * monthsPaid + interest (cannot calculate this way)
          // ✅ RIGHT: paidAmount = totalAmount (from Payment table) - outstandingAmount (from InstallmentPlan)
          const paidAmount = totalAmount > 0 ? Math.max(0, totalAmount - outstandingAmount) : 0;
          
          // Log if totalAmount is missing (should not happen after backend fix)
          if (totalAmount === 0) {
            console.warn(`⚠️ totalAmount is 0 for customer ${customer.customerId} (${customer.name}) - check backend response`);
          }
          
          // Map data - all from backend now!
          return {
            // Customer info (from backend)
            customerId: customer.customerId,
            customerName: customer.name || 'N/A',
            customerEmail: customer.email || 'N/A',
            customerPhone: customer.phoneNumber || 'N/A',
            customerAddress: customer.address || 'N/A',
            
            // Payment info (from backend - Payment table) ✅
            paymentId: paymentId || null,
            orderId: orderId || null,
            totalAmount: totalAmount || 0,
            paidAmount: paidAmount,
            outstandingAmount: outstandingAmount,
            paymentDate: paymentDate || null,
            method: method,
            
            // InstallmentPlan info (from backend) ✅
            planId: planId,
            currentTermMonth: termMonth,
            monthlyPay: monthlyPay,
            interestRate: interestRate,
            status: status
          };
        });
        
        console.log('✅ Transformed data:', transformed);
        setInstallmentPayments(transformed);
      } else {
        setInstallmentPayments([]);
        
        // Show error message if available
        if (result.message) {
          setError(result.message);
        } else if (!result.success) {
          setError('Failed to retrieve installment payments');
        } else {
          setError(null); // No error, just empty data
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

  // Workaround: Fetch TT payments from orders when backend endpoint doesn't exist
  // 
  // 💡 BACKEND RECOMMENDATION: Create PaymentService.getCompletedPayments() method:
  //   - Query Payment table where method = "TT"
  //   - Join with Order table to get customer_id
  //   - Join with Customer table to get full customer info (name, phone, email, address)
  //   - Join with OrderDetail to get vehicle information
  //   - Return: [{paymentId, orderId, customerId, customerName, phone, email, address, amount, paymentDate, method, vehicleInfo}]
  // 
  // This will provide complete information directly from the Payment table!
  const fetchCompletedPaymentsFromOrders = useCallback(async () => {
    try {
      console.log('🔄 Attempting to fetch TT payments from orders...');
      
      const completedPaymentsList = [];
      const processedPaymentIds = new Set(); // Avoid duplicates
      const processedCustomerIds = new Set(); // Track processed customers
      
      // Method 1: Check customers with active installments (they might have other orders with TT payments)
      const activeInstallmentsResult = await getCustomersWithActiveInstallments();
      if (activeInstallmentsResult.success && activeInstallmentsResult.data) {
        for (const customer of activeInstallmentsResult.data) {
          if (customer.customerId && !processedCustomerIds.has(customer.customerId)) {
            processedCustomerIds.add(customer.customerId);
            
            try {
              const ordersResult = await viewOrdersByCustomerId(customer.customerId);
              if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
                for (const order of ordersResult.data) {
                  // Check if order has payment with method = "TT"
                  if (order.payment) {
                    const payment = order.payment;
                    const paymentMethod = payment.method || payment.paymentMethod;
                    const paymentId = payment.paymentId || payment.payment_id;
                    
                    if (paymentId && processedPaymentIds.has(paymentId)) continue;
                    
                    // Check if it's a TT payment (full payment) and no installment plan
                    if ((paymentMethod === 'TT' || paymentMethod === 'tt') && !payment.installmentPlan) {
                      // Get vehicle information from order detail
                      let vehicleInfo = 'N/A';
                      if (order.detail) {
                        const detail = order.detail;
                        if (detail.vehicleName) vehicleInfo = detail.vehicleName;
                        else if (detail.modelName) vehicleInfo = detail.modelName;
                        else if (detail.serialId) vehicleInfo = `VIN: ${detail.serialId}`;
                        else if (order.modelId) vehicleInfo = `Model ${order.modelId}`;
                      } else if (order.vehicleName) {
                        vehicleInfo = order.vehicleName;
                      } else if (order.vehicle?.name) {
                        vehicleInfo = order.vehicle.name;
                      } else if (order.modelId) {
                        vehicleInfo = `Model ${order.modelId}`;
                      }
                      
                      completedPaymentsList.push({
                        paymentId: paymentId,
                        orderId: order.orderId || order.order_id,
                        customerName: customer.name || 'N/A',
                        customerId: customer.customerId,
                        customerAddress: customer.address || 'N/A',
                        amount: payment.amount || payment.totalAmount || 0,
                        paymentDate: payment.paymentDate || payment.payment_date || order.orderDate || 'N/A',
                        method: 'TT',
                        vehicle: vehicleInfo,
                        phone: customer.phoneNumber || 'N/A',
                        email: customer.email || 'N/A'
                      });
                      if (paymentId) processedPaymentIds.add(paymentId);
                    }
                  }
                  
                  // Also check direct order fields for TT payments
                  if (order.method === 'TT' && order.paymentId && !processedPaymentIds.has(order.paymentId)) {
                    // Get vehicle information
                    let vehicleInfo = 'N/A';
                    if (order.detail) {
                      const detail = order.detail;
                      if (detail.vehicleName) vehicleInfo = detail.vehicleName;
                      else if (detail.modelName) vehicleInfo = detail.modelName;
                      else if (detail.serialId) vehicleInfo = `VIN: ${detail.serialId}`;
                      else if (order.modelId) vehicleInfo = `Model ${order.modelId}`;
                    } else if (order.vehicleName) {
                      vehicleInfo = order.vehicleName;
                    } else if (order.vehicle?.name) {
                      vehicleInfo = order.vehicle.name;
                    } else if (order.modelId) {
                      vehicleInfo = `Model ${order.modelId}`;
                    }
                    
                    completedPaymentsList.push({
                      paymentId: order.paymentId || order.payment_id,
                      orderId: order.orderId || order.order_id,
                      customerName: customer.name || 'N/A',
                      customerId: customer.customerId,
                      customerAddress: customer.address || 'N/A',
                      amount: order.amount || order.totalAmount || 0,
                      paymentDate: order.paymentDate || order.payment_date || order.orderDate || 'N/A',
                      method: 'TT',
                      vehicle: vehicleInfo,
                      phone: customer.phoneNumber || 'N/A',
                      email: customer.email || 'N/A'
                    });
                    processedPaymentIds.add(order.paymentId || order.payment_id);
                  }
                }
              }
            } catch (orderErr) {
              console.warn(`⚠️ Could not fetch orders for customer ${customer.customerId}:`, orderErr);
            }
          }
        }
      }
      
      // Method 2: Search for customers by common Vietnamese names to find more customers
      // This helps find customers who paid in full and don't have active installments
      const { searchCustomersByName } = await import('../services/customerService');
      const commonSearchTerms = ['Nguyễn', 'Lê', 'Trần', 'Phạm', 'Hoàng'];
      
      for (const searchTerm of commonSearchTerms.slice(0, 3)) { // Limit to avoid too many API calls
        try {
          const searchResult = await searchCustomersByName(searchTerm);
          if (searchResult.success && searchResult.data && searchResult.data.length > 0) {
            for (const customer of searchResult.data) {
              const customerId = customer.customerId || customer.id;
              if (!customerId || processedCustomerIds.has(customerId)) continue;
              processedCustomerIds.add(customerId);
              
              try {
                const ordersResult = await viewOrdersByCustomerId(customerId);
                if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
                  for (const order of ordersResult.data) {
                    if (order.payment) {
                      const payment = order.payment;
                      const paymentMethod = payment.method || payment.paymentMethod;
                      const paymentId = payment.paymentId || payment.payment_id;
                      
                      if (paymentId && processedPaymentIds.has(paymentId)) continue;
                      
                      // Check if it's a TT payment (full payment) and no installment plan
                      if ((paymentMethod === 'TT' || paymentMethod === 'tt') && !payment.installmentPlan) {
                        // Get vehicle information
                        let vehicleInfo = 'N/A';
                        if (order.detail) {
                          const detail = order.detail;
                          if (detail.vehicleName) vehicleInfo = detail.vehicleName;
                          else if (detail.modelName) vehicleInfo = detail.modelName;
                          else if (detail.serialId) vehicleInfo = `VIN: ${detail.serialId}`;
                          else if (order.modelId) vehicleInfo = `Model ${order.modelId}`;
                        } else if (order.vehicleName) {
                          vehicleInfo = order.vehicleName;
                        } else if (order.vehicle?.name) {
                          vehicleInfo = order.vehicle.name;
                        } else if (order.modelId) {
                          vehicleInfo = `Model ${order.modelId}`;
                        }
                        
                        completedPaymentsList.push({
                          paymentId: paymentId,
                          orderId: order.orderId || order.order_id,
                          customerName: customer.name || 'N/A',
                          customerId: customerId,
                          customerAddress: customer.address || 'N/A',
                          amount: payment.amount || payment.totalAmount || 0,
                          paymentDate: payment.paymentDate || payment.payment_date || order.orderDate || 'N/A',
                          method: 'TT',
                          vehicle: vehicleInfo,
                          phone: customer.phoneNumber || customer.phone || 'N/A',
                          email: customer.email || 'N/A'
                        });
                        if (paymentId) processedPaymentIds.add(paymentId);
                      }
                    }
                  }
                }
              } catch {
                // Silently skip - customer might not have orders
              }
            }
          }
        } catch {
          // Silently skip search term if it fails
        }
      }
      
      // Method 3: Try direct customer IDs (1, 2, 3, 4, 5) as fallback
      const customerIdsToTry = [1, 2, 3, 4, 5];
      for (const customerId of customerIdsToTry) {
        if (processedCustomerIds.has(customerId)) continue;
        
        try {
          const ordersResult = await viewOrdersByCustomerId(customerId);
          if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
            processedCustomerIds.add(customerId);
            for (const order of ordersResult.data) {
              if (order.payment) {
                const payment = order.payment;
                const paymentMethod = payment.method || payment.paymentMethod;
                const paymentId = payment.paymentId || payment.payment_id;
                
                if (paymentId && processedPaymentIds.has(paymentId)) continue;
                
                if ((paymentMethod === 'TT' || paymentMethod === 'tt') && !payment.installmentPlan) {
                  // Get vehicle information
                  let vehicleInfo = 'N/A';
                  if (order.detail) {
                    const detail = order.detail;
                    if (detail.vehicleName) vehicleInfo = detail.vehicleName;
                    else if (detail.modelName) vehicleInfo = detail.modelName;
                    else if (detail.serialId) vehicleInfo = `VIN: ${detail.serialId}`;
                    else if (order.modelId) vehicleInfo = `Model ${order.modelId}`;
                  } else if (order.vehicleName) {
                    vehicleInfo = order.vehicleName;
                  } else if (order.vehicle?.name) {
                    vehicleInfo = order.vehicle.name;
                  } else if (order.modelId) {
                    vehicleInfo = `Model ${order.modelId}`;
                  }
                  
                  completedPaymentsList.push({
                    paymentId: paymentId,
                    orderId: order.orderId || order.order_id,
                    customerName: `Customer ${customerId}`,
                    customerId: customerId,
                    customerAddress: 'N/A',
                    amount: payment.amount || payment.totalAmount || 0,
                    paymentDate: payment.paymentDate || payment.payment_date || order.orderDate || 'N/A',
                    method: 'TT',
                    vehicle: vehicleInfo,
                    phone: 'N/A',
                    email: 'N/A'
                  });
                  if (paymentId) processedPaymentIds.add(paymentId);
                }
              }
            }
          }
        } catch {
          // Silently skip - customer might not exist
        }
      }
      
      if (completedPaymentsList.length > 0) {
        setCompletedPayments(completedPaymentsList);
        console.log(`✅ Found ${completedPaymentsList.length} completed TT payments from orders`);
      } else {
        setCompletedPayments([]);
        console.log('ℹ️ No TT payments found in orders (workaround)');
      }
    } catch (err) {
      console.error('❌ Error in fetchCompletedPaymentsFromOrders workaround:', err);
      setCompletedPayments([]);
    }
  }, []);

  const fetchCompletedPayments = useCallback(async () => {
     // Don't set loading=true here because it will conflict with installment loading
     // Use separate loading state if needed
     try {
       console.log('📥 Fetching completed payments (TT) from backend...');
       const result = await getCompletedPayments();
       console.log('📥 Completed Payments API Response:', result);
       
       if (result.success && result.data && result.data.length > 0) {
         // ✅ Backend returns data in format: {customerId, name, address, email, phoneNumber, paymentId, orderId, amount, paymentDate, method}
         // Transform data to match frontend format
         const transformedData = result.data.map((payment) => {
           return {
             paymentId: payment.paymentId || payment.payment_id,
             orderId: payment.orderId || payment.order_id,
             customerName: payment.name || payment.customerName || payment.customer_name || 'N/A',
             customerId: payment.customerId || payment.customer_id,
             customerAddress: payment.address || payment.customerAddress || 'N/A',
             amount: payment.amount || 0,
             paymentDate: payment.paymentDate || payment.payment_date,
             method: payment.method || 'TT',
             // Additional fields from backend response
             phone: payment.phoneNumber || payment.phone || payment.customerPhone || 'N/A',
             email: payment.email || payment.customerEmail || 'N/A',
             vehicle: payment.vehicle || payment.vehicleName || 'N/A' // May not be in backend response
           };
         });
         setCompletedPayments(transformedData);
         console.log(`✅ Loaded ${transformedData.length} completed payments (TT) filtered by staff ID`);
       } else {
         // No data or empty response - this is OK, just means no TT payments for this staff
         setCompletedPayments([]);
         console.log('ℹ️ No completed payments (TT) found for this staff member');
         
         // Only use workaround if endpoint truly doesn't exist (404/405)
         if (result.message && (result.message.includes('not found') || result.message.includes('404') || result.message.includes('405'))) {
           console.warn('⚠️ Completed payments endpoint not available, trying workaround...');
           await fetchCompletedPaymentsFromOrders();
         }
       }
     } catch (err) {
       console.error('❌ Error fetching completed payments:', err);
       // Only try workaround if it's a network/endpoint error, not authentication
       if (err.response?.status === 404 || err.response?.status === 405) {
         await fetchCompletedPaymentsFromOrders();
       } else {
         setCompletedPayments([]);
       }
     }
   }, [fetchCompletedPaymentsFromOrders]);

  // Fetch completed payments on mount
  useEffect(() => {
    fetchCompletedPayments();
  }, [fetchCompletedPayments]);



  // Handle view details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  // Handle edit payment (deduct months)
  // Try to fetch missing planId and termMonth if not available
  const handleEditPayment = async (payment) => {
    // If planId or termMonth is missing, try to fetch from orders
    if (!payment.planId || payment.currentTermMonth === null || payment.currentTermMonth === undefined) {
      try {
        console.log('⚠️ Missing planId or termMonth, attempting to fetch from orders...');
        const ordersResult = await viewOrdersByCustomerId(payment.customerId);
        
        if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
          const order = ordersResult.data[0];
          
          // Try to get payment/installment data from order
          if (order.payment && order.payment.installmentPlan) {
            const plan = order.payment.installmentPlan;
            payment.planId = payment.planId || plan.planId || plan.plan_id;
            payment.currentTermMonth = payment.currentTermMonth || 
              (plan.termMonth ? parseInt(plan.termMonth) : null) || 
              (plan.term_month ? parseInt(plan.term_month) : null);
            payment.monthlyPay = payment.monthlyPay || plan.monthlyPay || plan.monthly_pay || 0;
            payment.interestRate = payment.interestRate || plan.interestRate || plan.interest_rate || 0;
            payment.status = payment.status || plan.status || 'ACTIVE';
          }
          
          // Also update payment info
          if (order.payment) {
            payment.paymentId = payment.paymentId || order.payment.paymentId || order.payment.payment_id;
            payment.totalAmount = payment.totalAmount || order.payment.amount || order.payment.totalAmount || 0;
            payment.paymentDate = payment.paymentDate || order.payment.paymentDate || order.payment.payment_date;
          }
          
          // Update in the list
          setInstallmentPayments(prev => 
            prev.map(p => 
              p.customerId === payment.customerId ? payment : p
            )
          );
        }
      } catch (err) {
        console.warn('Could not fetch missing data:', err);
      }
    }
    
    setSelectedPayment(payment);
    setMonthsToDeduct(1);
    setIsEditPaymentModalOpen(true);
  };

  // Handle reduce 1 month (quick action from details modal)
  const handleReduceOneMonth = async () => {
    if (!selectedPayment) return;

    // Try to fetch missing planId if not available
    let payment = { ...selectedPayment };
    if (!payment.planId || payment.currentTermMonth === null || payment.currentTermMonth === undefined) {
      try {
        console.log('⚠️ Missing planId or termMonth, attempting to fetch from orders...');
        const ordersResult = await viewOrdersByCustomerId(payment.customerId);
        
        if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
          const order = ordersResult.data[0];
          
          if (order.payment && order.payment.installmentPlan) {
            const plan = order.payment.installmentPlan;
            payment.planId = payment.planId || plan.planId || plan.plan_id;
            payment.currentTermMonth = payment.currentTermMonth || 
              (plan.termMonth ? parseInt(plan.termMonth) : null) || 
              (plan.term_month ? parseInt(plan.term_month) : null);
            payment.monthlyPay = payment.monthlyPay || plan.monthlyPay || plan.monthly_pay || 0;
          }
        }
      } catch (err) {
        console.warn('Could not fetch missing data:', err);
      }
    }

    // Validate required data
    if (!payment.planId) {
      alert('⚠️ Cannot update payment: planId is missing.\n\n' +
            'Unable to fetch planId from backend. Please ensure the installment plan exists.');
      return;
    }

    const currentTermMonth = payment.currentTermMonth;
    if (currentTermMonth === null || currentTermMonth === undefined || isNaN(currentTermMonth) || currentTermMonth <= 0) {
      alert('⚠️ Cannot reduce months: No remaining months or data is missing.');
      return;
    }

    setUpdating(true);
    
    try {
      // Calculate new values
      const newTermMonth = Math.max(0, currentTermMonth - 1);
      const monthlyPay = payment.monthlyPay || 0;
      const currentOutstanding = payment.outstandingAmount || 0;
      const newOutstanding = Math.max(0, currentOutstanding - monthlyPay);
      
      // Determine new status
      let newStatus = 'ACTIVE';
      if (newTermMonth <= 0) {
        newStatus = 'PAID';
      } else {
        newStatus = payment.status === 'OVERDUE' || payment.status === 'Overdue' ? 'OVERDUE' : 'ACTIVE';
      }

      // Call backend to update installment plan
      const result = await updateInstallmentPlan(
        payment.planId,
        newStatus,
        String(newTermMonth)
      );

      if (result.success) {
        // Update local state immediately for better UX
        const updatedPayment = {
          ...payment,
          currentTermMonth: newTermMonth,
          outstandingAmount: newOutstanding,
          status: newStatus,
          paidAmount: (payment.paidAmount || 0) + monthlyPay
        };
        setSelectedPayment(updatedPayment);
        
        // Update the payment in the list
        setInstallmentPayments(prev => 
          prev.map(p => 
            p.customerId === payment.customerId 
              ? updatedPayment 
              : p
          )
        );

        alert(`✅ Successfully recorded 1 month payment!\n\n` +
              `Amount paid: ${formatCurrency(monthlyPay)}\n` +
              `Remaining months: ${newTermMonth > 0 ? newTermMonth : 0}\n` +
              `New outstanding: ${formatCurrency(newOutstanding)}`);
      } else {
        alert(`❌ Failed to update payment: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error reducing month:', err);
      alert('Failed to update payment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle save payment deduction
  // NOTE: Backend only supports status updates (ACTIVE, PAID, OVERDUE)
  // Months tracking would need to be implemented on the backend
  const handleSavePaymentDeduction = async () => {
    if (!selectedPayment) return;

    const months = parseInt(monthsToDeduct);
    if (months <= 0 || isNaN(months)) {
      alert('Please enter a valid number of months (greater than 0).');
      return;
    }

    // Try to fetch missing planId if not available
    let payment = { ...selectedPayment };
    if (!payment.planId || payment.currentTermMonth === null || payment.currentTermMonth === undefined) {
      try {
        console.log('⚠️ Missing planId or termMonth, attempting to fetch from orders...');
        const ordersResult = await viewOrdersByCustomerId(payment.customerId);
        
        if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
          const order = ordersResult.data[0];
          
          if (order.payment && order.payment.installmentPlan) {
            const plan = order.payment.installmentPlan;
            payment.planId = payment.planId || plan.planId || plan.plan_id;
            payment.currentTermMonth = payment.currentTermMonth || 
              (plan.termMonth ? parseInt(plan.termMonth) : null) || 
              (plan.term_month ? parseInt(plan.term_month) : null);
            payment.monthlyPay = payment.monthlyPay || plan.monthlyPay || plan.monthly_pay || 0;
          }
        }
      } catch (err) {
        console.warn('Could not fetch missing data:', err);
      }
    }

    // Validate planId exists - required for update
    if (!payment.planId) {
      alert('⚠️ Cannot update payment: planId is missing.\n\n' +
            'Unable to fetch planId from backend. Please ensure:\n' +
            '1. The installment plan exists in the database\n' +
            '2. The backend returns planId in the response\n' +
            '3. The payment has an associated installment plan');
      return;
    }

    // Validate currentTermMonth exists - required for calculation
    const currentTermMonth = payment.currentTermMonth;
    if (currentTermMonth === null || currentTermMonth === undefined || isNaN(currentTermMonth)) {
      alert('⚠️ Cannot update payment: remaining months information is missing.\n\n' +
            'Unable to fetch termMonth from backend. Please ensure:\n' +
            '1. The installment plan has a valid term_month value\n' +
            '2. The backend returns termMonth in the response');
      return;
    }
    
    // Update selectedPayment with fetched data
    setSelectedPayment(payment);

    if (months > currentTermMonth) {
      alert(`You cannot record more than ${currentTermMonth} months (remaining months).`);
      return;
    }

    setUpdating(true);
    
    try {
      // Calculate new term month
      const newTermMonth = Math.max(0, currentTermMonth - months);
      
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
        // Calculate new outstanding amount
        const monthlyPay = selectedPayment.monthlyPay || 0;
        const amountToDeduct = monthlyPay * months;
        const currentOutstanding = selectedPayment.outstandingAmount || 0;
        const newOutstanding = Math.max(0, currentOutstanding - amountToDeduct);
        
        // Update local state immediately for better UX
        const updatedPayment = {
          ...payment,
          currentTermMonth: newTermMonth,
          outstandingAmount: newOutstanding,
          status: newStatus,
          paidAmount: (payment.paidAmount || 0) + amountToDeduct
        };
        
        // Update the payment in the list
        setInstallmentPayments(prev => 
          prev.map(p => 
            p.customerId === payment.customerId 
              ? updatedPayment 
              : p
          )
        );

        alert(`✅ Successfully recorded ${months} month(s) payment!\n\n` +
              `Amount paid: ${formatCurrency(amountToDeduct)}\n` +
              `Remaining months: ${newTermMonth > 0 ? newTermMonth : 0}\n` +
              `New outstanding: ${formatCurrency(newOutstanding)}`);
        
        setIsEditPaymentModalOpen(false);
        setMonthsToDeduct(1);
        setSelectedPayment(null);
        
        // Refresh data from server to ensure consistency
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
              <span>Trả góp (Installment)</span>
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
              <span>Trả xong (Full Payment)</span>
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
                          Outstanding
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Pay
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining Months
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interest Rate
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
                        <tr 
                          key={payment.customerId || index} 
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() => handleViewDetails(payment)}
                        >
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
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(payment.totalAmount || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('vi-VN') : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(payment.paidAmount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-red-600">
                              {formatCurrency(payment.outstandingAmount || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.monthlyPay || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.currentTermMonth !== null && payment.currentTermMonth !== undefined 
                                ? `${payment.currentTermMonth} tháng`
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {payment.interestRate ? `${payment.interestRate}%` : 'N/A'}
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
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(payment);
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                title="View details"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPayment(payment);
                                }}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                                title="Edit payment"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
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
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              <div>📞 {payment.phone}</div>
                              {payment.email && payment.email !== 'N/A' && (
                                <div>✉️ {payment.email}</div>
                              )}
                              {payment.customerAddress && payment.customerAddress !== 'N/A' && (
                                <div className="mt-1">📍 {payment.customerAddress}</div>
                              )}
                            </div>
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

        {/* Payment Details Modal */}
        {isDetailsModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setSelectedPayment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Customer Information</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-base font-semibold text-gray-900">{selectedPayment.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="text-base font-semibold text-gray-900">#{selectedPayment.customerId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-base text-gray-900">{selectedPayment.customerEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-base text-gray-900">{selectedPayment.customerPhone || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-base text-gray-900">{selectedPayment.customerAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Payment Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order ID</span>
                        <span className="text-base font-semibold text-gray-900">#{selectedPayment.orderId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment ID</span>
                        <span className="text-base font-semibold text-gray-900">#{selectedPayment.paymentId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(selectedPayment.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Paid Amount</span>
                        <span className="text-base font-semibold text-green-600">
                          {formatCurrency(selectedPayment.paidAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Outstanding Amount</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(selectedPayment.outstandingAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedPayment.method === 'TT' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedPayment.method === 'TT' ? 'Full Payment' : 'Installment'}
                        </span>
                      </div>
                      {selectedPayment.paymentDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Date</span>
                          <span className="text-base text-gray-900">
                            {new Date(selectedPayment.paymentDate).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Installment Plan Information */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <TrendingDown className="w-5 h-5" />
                      <span>Installment Plan</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Plan ID</span>
                        <span className="text-base font-semibold text-gray-900">#{selectedPayment.planId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Payment</span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatCurrency(selectedPayment.monthlyPay || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Remaining Months</span>
                        <span className="text-base font-semibold text-gray-900">
                          {selectedPayment.currentTermMonth !== null && selectedPayment.currentTermMonth !== undefined 
                            ? `${selectedPayment.currentTermMonth} tháng`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Interest Rate</span>
                        <span className="text-base font-semibold text-gray-900">
                          {selectedPayment.interestRate ? `${selectedPayment.interestRate}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedPayment.status === 'Active' || selectedPayment.status === 'ACTIVE' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedPayment.status === 'Overdue' || selectedPayment.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedPayment.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {selectedPayment.planId && selectedPayment.currentTermMonth !== null && selectedPayment.currentTermMonth !== undefined && selectedPayment.currentTermMonth > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                      <button
                        onClick={handleReduceOneMonth}
                        disabled={updating || selectedPayment.currentTermMonth <= 0}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-5 h-5" />
                            <span>Reduce 1 Month</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        This will deduct 1 month, reduce outstanding amount by {formatCurrency(selectedPayment.monthlyPay || 0)}, and update the database
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setSelectedPayment(null);
                    }}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      setIsDetailsModalOpen(false);
                      await handleEditPayment(selectedPayment);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Payment Modal */}
        {isEditPaymentModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Payment</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Customer Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                    <div className="text-base text-gray-900">{selectedPayment.customerName}</div>
                    <div className="text-xs text-gray-500">Order ID: #{selectedPayment.orderId || 'N/A'}</div>
                  </div>
                  
                  {/* Payment Info from Payment table */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Payment Information</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid Amount:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(selectedPayment.paidAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Outstanding Amount:</span>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(selectedPayment.outstandingAmount || 0)}
                      </span>
                    </div>
                    {selectedPayment.paymentDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(selectedPayment.paymentDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* InstallmentPlan Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                    <div className="text-sm font-semibold text-purple-900 mb-2">Installment Plan</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Payment:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedPayment.monthlyPay || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Số tháng còn lại:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedPayment.currentTermMonth !== null && selectedPayment.currentTermMonth !== undefined 
                          ? `${selectedPayment.currentTermMonth} tháng`
                          : 'N/A'}
                      </span>
                    </div>
                    {selectedPayment.interestRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Interest Rate:</span>
                        <span className="text-sm text-gray-900">{selectedPayment.interestRate}%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedPayment.status === 'Active' || selectedPayment.status === 'ACTIVE' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedPayment.status === 'Overdue' || selectedPayment.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPayment.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Record Payment Input */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tháng cần ghi nhận thanh toán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedPayment.currentTermMonth || undefined}
                      value={monthsToDeduct}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const maxMonths = selectedPayment.currentTermMonth;
                        if (maxMonths && maxMonths > 0) {
                          setMonthsToDeduct(Math.min(Math.max(1, value), maxMonths));
                        } else {
                          setMonthsToDeduct(Math.max(1, value));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={updating || !selectedPayment.currentTermMonth || selectedPayment.currentTermMonth === null || selectedPayment.currentTermMonth === undefined}
                    />
                    {selectedPayment.currentTermMonth && selectedPayment.currentTermMonth > 0 ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          Tối đa: {selectedPayment.currentTermMonth} tháng
                        </p>
                        {selectedPayment.monthlyPay && monthsToDeduct > 0 && (
                          <p className="text-xs font-semibold text-blue-600">
                            Số tiền sẽ ghi nhận: {formatCurrency(selectedPayment.monthlyPay * monthsToDeduct)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 font-medium">
                          ⚠️ Missing data: Backend needs to return termMonth (remaining months) to enable payment recording.
                        </p>
                      </div>
                    )}
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

