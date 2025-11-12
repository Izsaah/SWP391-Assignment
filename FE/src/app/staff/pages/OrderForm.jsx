import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout';
import { Plus, Eye, Edit2, Trash2, FileText, CheckCircle, Loader2, RefreshCw, AlertTriangle, X, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { createOrder, viewOrdersByStaffId } from '../services/orderService';
import { createPayment } from '../services/paymentService';
import { fetchInventory } from '../services/inventoryService';
import { getUserIdFromStoredToken } from '../../utils/jwtUtils';
import { createCustomer, getAllCustomers } from '../services/customerService';

const OrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleData = location.state?.vehicleData;
  const redirectToDelivery = location.state?.redirectToDelivery;
  
  const [selectedOrderForm, setSelectedOrderForm] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Data states
  const [orderForms, setOrderForms] = useState([]);
  const [loadingOrderForms, setLoadingOrderForms] = useState(false);
  const [orderFormsError, setOrderFormsError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [allCustomersCache, setAllCustomersCache] = useState([]); // Cache all customers for client-side filtering
  
  // Form state for creating order form
  const [formData, setFormData] = useState({
    // Customer Information
    customer: '',
    customerId: '',
    phone: '',
    email: '',
    customerType: 'Returning',
    contactMethod: 'Email',
    
    // Vehicle Information
    model: '',
    modelId: '',
    variantId: '',
    vehicleId: '',
    vin: '',
    color: 'White',
    config: '',
    dealerStock: '',
    source: 'From Inventory',
    
    // Pricing & Payment
    basePrice: '',
    discountCode: '',
    discountAmount: '0',
    totalPrice: '',
    paymentMethod: 'Full Payment',
    bankName: '',
    loanTerm: '',
    interestRate: '',
    installmentMonths: '12',
    remainingAmount: '',
    monthlyPayment: '',
    
    quantity: '1',
    
    // Notes
    internalNotes: '',
    attachments: [],
  });

  // Transform backend OrderDTO to order form format
  const transformOrderToOrderForm = (order, customerName = null) => {
    // Parse order date from backend (format: "yyyy-MM-dd HH:mm:ss" or ISO string)
    let orderDate = new Date().toISOString().split('T')[0];
    if (order.orderDate) {
      try {
        // Backend returns date as "yyyy-MM-dd HH:mm:ss" string
        const dateStr = order.orderDate.split(' ')[0]; // Get just the date part
        orderDate = dateStr;
      } catch {
        console.warn('Error parsing order date:', order.orderDate);
      }
    }
    
    // Get order detail information
    const detail = order.detail || {};
    const quantity = detail.quantity ? parseInt(detail.quantity) : 1;
    const unitPrice = detail.unitPrice || 0;
    const totalPrice = unitPrice * quantity;
    const serialId = detail.serialId || 'Pending';
    
    // Get status from backend (can be "Pending", "Delivered", "Cancelled")
    const status = order.status || 'Pending';
    
    return {
      id: `OF-${order.orderId}`,
      orderId: order.orderId,
      customer: customerName || `Customer ${order.customerId}`,
      customerId: order.customerId,
      vehicle: `Model ${order.modelId}`, // Will be replaced with actual model name if available
      modelId: order.modelId,
      variantId: null, // Not directly available in OrderDTO
      vin: serialId,
      price: totalPrice,
      discount: 0, // Backend doesn't provide discount in OrderDTO
      discountCode: 'None',
      paymentMethod: 'Full Payment', // Default, will be updated if payment info available
      date: orderDate,
      linked_order_id: `ORD-${order.orderId}`,
      notes: '',
      quantity: quantity,
      status: status,
      // Keep original order data for reference
      _originalOrder: order
    };
  };

  // Filter order forms (only by special orders now)
  const filteredOrderForms = orderForms;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // (removed) contract helper previously used for contract section

  // Handle view order form
  const handleView = (orderForm) => {
    setSelectedOrderForm(orderForm);
    setIsViewModalOpen(true);
  };

  // Handle delete order
  const handleDelete = async (orderFormId) => {
    // Extract order ID from orderFormId (it might be in format "ORD-123" or just "123")
    const orderIdMatch = String(orderFormId).match(/(\d+)/);
    const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;
    
    if (!orderId) {
      alert('❌ Could not extract order ID from order form ID.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?\n\nThis will permanently remove the order from the database.`)) {
      return;
    }
    
    try {
      // TODO: Backend endpoint needed: DELETE /api/staff/deleteOrder
      // For now, show message that backend needs to implement this
      alert('⚠️ Delete order functionality requires backend endpoint:\n\n' +
            'POST /api/staff/deleteOrder\n' +
            'Body: { "orderId": ' + orderId + ' }\n\n' +
            'Please implement this endpoint in the backend to enable order deletion.');
      
      // Once backend is implemented, uncomment this:
      /*
      const { deleteOrder } = await import('../services/orderService');
      const result = await deleteOrder(orderId);
      
      if (result.success) {
        alert(`✅ Order ${orderId} deleted successfully.`);
        // Refresh order list
        if (selectedCustomerForOrders) {
          await fetchOrderForms(
            selectedCustomerForOrders.customerId || selectedCustomerForOrders.id,
            selectedCustomerForOrders.name
          );
        } else {
          // Reload all orders
          window.location.reload();
        }
      } else {
        alert(`❌ Failed to delete order: ${result.message}`);
      }
      */
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`❌ Error: ${error.message || 'Failed to delete order'}`);
    }
  };


  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Recalculate total if pricing fields change (without VAT)
    if (name === 'basePrice' || name === 'discountAmount' || name === 'quantity') {
      const base = name === 'basePrice' ? value : formData.basePrice;
      const discount = name === 'discountAmount' ? value : formData.discountAmount;
      const quantity = name === 'quantity' ? value : formData.quantity;
      calculateTotalPrice(base, discount, quantity);
    }
  };


  // Handle vehicle model selection
  const handleVehicleModelSelect = useCallback((model) => {
    console.log('🚗 Selecting vehicle model:', model);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        model: model.modelName || model.name,
        modelId: model.modelId || model.id,
        vehicleId: model.modelId || model.id,
      };
      
      // If model has a default price, auto-fill it
      // Check multiple possible price field names from BE
      const modelPrice = model.basePrice || model.price || model.unitPrice || model.modelPrice || 0;
      if (modelPrice > 0) {
        newData.basePrice = modelPrice.toString();
        // Auto-calculate total price (without VAT)
        const baseNum = parseFloat(modelPrice);
        const discountNum = parseFloat(prev.discountAmount || 0);
        const qty = parseFloat(prev.quantity || 1);
        const afterDiscount = (baseNum - discountNum) * qty;
        newData.totalPrice = afterDiscount.toString();
        console.log('💰 Auto-filled price:', modelPrice, 'Total:', afterDiscount);
      } else {
        console.log('⚠️ No price found in model, user must enter manually');
      }
      
      return newData;
    });
    setSelectedVariant(null);
  }, []);

  // Handle variant selection
  const handleVariantSelect = useCallback((variant, model) => {
    setSelectedVariant(variant);
    setFormData(prev => {
      const basePrice = variant.price || 0;
      const newFormData = {
        ...prev,
        variantId: variant.variantId,
        color: variant.color || 'White',
        basePrice: basePrice.toString(),
        model: model.modelName,
        modelId: model.modelId,
      };
      
      // Calculate total price (without VAT)
      const baseNum = parseFloat(basePrice) || 0;
      const discountNum = parseFloat(prev.discountAmount || 0);
      const qty = parseFloat(prev.quantity || 1);
      
      const afterDiscount = (baseNum - discountNum) * qty;
      // No VAT calculation
      
      return {
        ...newFormData,
        totalPrice: afterDiscount.toString(),
      };
    });
  }, []);

  // Handle discount code selection
  const handleDiscountCodeSelect = (code) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        discountCode: code.id,
        discountAmount: code.amount.toString(),
      };
      
      // Calculate total price (without VAT)
      const baseNum = parseFloat(prev.basePrice) || 0;
      const discountNum = code.amount || 0;
      const qty = parseFloat(prev.quantity) || 1;
      
      const afterDiscount = (baseNum - discountNum) * qty;
      // No VAT calculation
      
      return {
        ...newFormData,
        totalPrice: afterDiscount.toString(),
      };
    });
  };

  // Calculate total price (without VAT)
  const calculateTotalPrice = (base, discount, quantity = 1) => {
    const baseNum = parseFloat(base) || 0;
    const discountNum = parseFloat(discount) || 0;
    const qty = parseFloat(quantity) || 1;
    
    const afterDiscount = (baseNum - discountNum) * qty;
    // No VAT calculation
    
    setFormData(prev => ({
      ...prev,
      totalPrice: afterDiscount.toString(),
    }));
  };

  // Calculate installment details (remaining amount and monthly payment)
  useEffect(() => {
    if (formData.paymentMethod === 'Installment' && formData.totalPrice) {
      const totalPriceNum = parseFloat(formData.totalPrice) || 0;
      const months = parseInt(formData.installmentMonths) || 12;
      
      // For installment, remaining amount equals total price (no prepayment)
      const remaining = totalPriceNum;
      const remainingStr = remaining.toFixed(0);
      
      // Calculate monthly payment (divide total by months)
      const monthly = months > 0 ? remaining / months : 0;
      const monthlyStr = monthly.toFixed(0);
      
      // Only update if values changed to prevent infinite loops
      if (formData.remainingAmount !== remainingStr || formData.monthlyPayment !== monthlyStr) {
        setFormData(prev => ({
          ...prev,
          remainingAmount: remainingStr,
          monthlyPayment: monthlyStr,
        }));
      }
    } else if (formData.paymentMethod === 'Full Payment') {
      // Clear installment fields when Full Payment is selected (only if not already cleared)
      if (formData.remainingAmount || formData.monthlyPayment || formData.installmentMonths !== '12') {
        setFormData(prev => ({
          ...prev,
          remainingAmount: '',
          monthlyPayment: '',
          installmentMonths: '12',
        }));
      }
    }
  }, [formData.paymentMethod, formData.totalPrice, formData.installmentMonths, formData.remainingAmount, formData.monthlyPayment]);

  // Handle confirm and create order
  const handleConfirmAndCreate = async () => {
    // Validate customer is selected
    if (!formData.customerId || !formData.customer) {
      alert('Please search and select a customer before creating an order.');
      setShowSearchResults(true); // Show search to help user
      return;
    }
    
    // Validate customerId is a valid number
    const customerIdNum = parseInt(formData.customerId);
    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      alert('Invalid customer selected. Please search and select a customer again.');
      setFormData(prev => ({ ...prev, customer: '', customerId: '', phone: '', email: '' }));
      setCustomerSearchTerm('');
      return;
    }
    
    // Validate other required fields
    if (!formData.modelId || !formData.basePrice) {
      alert('Please fill in all required fields: Customer, Vehicle Model, and Price.');
      return;
    }

    try {
      // Get dealerStaffId from JWT token (same method used by backend for viewing orders)
      const dealerStaffId = getUserIdFromStoredToken();
      if (!dealerStaffId) {
        alert('❌ Cannot extract staff ID from token. Please log in again.');
        return;
      }
      console.log('✅ Extracted dealerStaffId from JWT token:', dealerStaffId);

      // Calculate unit price from total price and quantity
      const totalPrice = parseFloat(formData.totalPrice || formData.basePrice || 0);
      const quantity = parseInt(formData.quantity || '1');
      const unitPrice = quantity > 0 ? totalPrice / quantity : totalPrice;

      // Use the already validated customerIdNum
      const orderData = {
        customerId: customerIdNum,
        dealerstaffId: dealerStaffId,
        modelId: parseInt(formData.modelId),
        variantId: formData.variantId ? parseInt(formData.variantId) : null,
        quantity: quantity,
        unitPrice: unitPrice, // Send unit price to backend
        basePrice: formData.basePrice || totalPrice.toString(), // Also send basePrice as fallback
        totalPrice: totalPrice.toString(), // Also send totalPrice as fallback
        status: 'Pending',
        isCustom: false
      };

      console.log('📤 Creating order with data:', orderData);
      
      const orderResult = await createOrder(orderData);
      
      if (!orderResult.success) {
        alert(`❌ Failed to create order: ${orderResult.message}`);
        return;
      }

      // Extract orderId from response
      const orderIdMatch = orderResult.data?.match(/Order ID: (\d+)/) || orderResult.message?.match(/Order ID: (\d+)/);
      const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;
      
      if (!orderId) {
        alert(`⚠️ Order may have been created but couldn't extract order ID. Response: ${orderResult.data || orderResult.message}`);
        setIsCreateModalOpen(false);
        resetForm();
        return;
      }

      console.log('✅ Order created successfully, orderId:', orderId);

      // Wait a moment for order to be fully committed to database
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create payment if needed
      if (formData.paymentMethod === 'Full Payment' || formData.paymentMethod === 'Installment') {
        const paymentMethod = formData.paymentMethod === 'Full Payment' ? 'TT' : 'TG';
        const paymentData = {
          orderId: orderId,
          method: paymentMethod
        };

        if (paymentMethod === 'TG') {
          paymentData.interestRate = formData.interestRate || '0';
          paymentData.termMonth = formData.installmentMonths || formData.loanTerm || '12';
          paymentData.monthlyPay = formData.monthlyPayment || formData.monthlyPay || '0';
          paymentData.status = 'Active';
        }

        console.log('📤 Creating payment with data:', paymentData);
        
        // Try creating payment with retry mechanism
        let paymentResult = null;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries && !paymentResult?.success) {
          if (retryCount > 0) {
            console.log(`🔄 Retrying payment creation (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
          
          paymentResult = await createPayment(paymentData);
          retryCount++;
        }
        
        if (!paymentResult || !paymentResult.success) {
          // Check if error is IndexOutOfBoundsException (backend bug)
          const isBackendBug = paymentResult?.message?.includes('IndexOutOfBoundsException') || 
                               paymentResult?.message?.includes('Index: 0, Size: 0');
          
          if (isBackendBug) {
            alert(
              `⚠️ Order created (ID: ${orderId}) but payment creation failed due to backend error.\n\n` +
              `Error: ${paymentResult?.message || 'IndexOutOfBoundsException'}\n\n` +
              `🔧 Backend Issue:\n` +
              `PaymentService.getPaymentByOrderId() calls findPaymentById(orderId) instead of findPaymentByOrderId(orderId).\n` +
              `This causes IndexOutOfBoundsException when checking if payment exists.\n\n` +
              `✅ The order was created successfully.\n` +
              `⚠️ You may need to create the payment manually later, or fix the backend bug.\n\n` +
              `📋 Backend Fix Needed:\n` +
              `In PaymentService.java line 137, change:\n` +
              `  return paymentDAO.findPaymentById(orderId);\n` +
              `To:\n` +
              `  List<PaymentDTO> payments = paymentDAO.findPaymentByOrderId(orderId);\n` +
              `  return (payments != null && !payments.isEmpty()) ? payments.get(0) : null;`
            );
          } else {
            alert(`⚠️ Order created (ID: ${orderId}) but payment creation failed: ${paymentResult?.message || 'Unknown error'}\n\n` +
                  `You may need to create payment manually later.`);
          }
        } else {
          const successMsg = `✅ Order & Payment Created Successfully!\n\n` +
            `📋 Order ID: ${orderId}\n` +
            `👤 Customer: ${formData.customer || 'N/A'}\n` +
            `🚗 Vehicle: ${formData.model || 'N/A'}\n` +
            `💰 Amount: ${formatCurrency(parseFloat(formData.totalPrice) || 0)}\n` +
            `💳 Payment Method: ${formData.paymentMethod}\n` +
            `\n✅ The order will now appear in:\n` +
            `• Payment section (${paymentMethod === 'TT' ? 'Full Payment tab' : 'Installment tab'})\n` +
            `• Order list`;
          alert(successMsg);
        }
      } else {
        alert(`✅ Order Created Successfully!\n\n` +
              `📋 Order ID: ${orderId}\n` +
              `👤 Customer: ${formData.customer || 'N/A'}\n` +
              `🚗 Vehicle: ${formData.model || 'N/A'}\n` +
              `\n✅ The order will now appear in the Order list.`);
      }

      setIsCreateModalOpen(false);
      resetForm();
      
      // Refresh vehicles list
      fetchVehicles();
      
      // Check if we should return to CustomerDetail page
      const returnUrl = location.state?.returnUrl;
      const fromCustomerDetail = location.state?.fromCustomerDetail;
      
      if (fromCustomerDetail && returnUrl) {
        // Navigate back to customer detail page after order creation
        setTimeout(() => {
          console.log('🔄 Navigating back to CustomerDetail:', returnUrl);
          navigate(returnUrl);
        }, 1500); // Small delay to show success message and ensure order is saved
        return; // Exit early to prevent other redirects
      }
      
      // Redirect to delivery page if flag is set (from "Pick and Deliver")
      if (redirectToDelivery) {
        setTimeout(() => {
          navigate('/staff/sales/delivery');
        }, 1000); // Small delay to ensure order is saved
      }
      
      // Always refresh all orders to show the newly created order
      // Wait a bit longer to ensure the order is fully committed to the database
      setTimeout(async () => {
        console.log('🔄 Refreshing all orders to show newly created order...');
        await reloadAllOrders();
      }, 800); // Slightly longer delay to ensure database commit
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(`❌ Error: ${error.message || 'Failed to create order'}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer: '',
      customerId: '',
      phone: '',
      email: '',
      customerType: 'Returning',
      contactMethod: 'Email',
      model: '',
      modelId: '',
      variantId: '',
      vehicleId: '',
      vin: '',
      color: 'White',
      config: '',
      dealerStock: '',
      source: 'From Inventory',
      basePrice: '',
      discountCode: '',
      discountAmount: '0',
      totalPrice: '',
      paymentMethod: 'Full Payment',
      bankName: '',
      loanTerm: '',
      interestRate: '',
      installmentMonths: '12',
      remainingAmount: '',
      monthlyPayment: '',
      quantity: '1',
      internalNotes: '',
      attachments: [],
    });
    setSelectedVariant(null);
    setCustomerSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Fetch vehicles from backend
  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      console.log('📦 Fetching vehicles from BE...');
      const result = await fetchInventory();
      console.log('📦 BE Response:', result);
      
      if (result.success && result.data) {
        const vehiclesData = Array.isArray(result.data) ? result.data : [];
        console.log(`✅ Loaded ${vehiclesData.length} vehicle models from BE`);
        console.log('📦 Vehicle models structure:', vehiclesData);
        
        // Verify data structure matches BE (VehicleModelDTO)
        vehiclesData.forEach((model, index) => {
          console.log(`Model ${index + 1}:`, {
            modelId: model.modelId,
            modelName: model.modelName || model.name,
            description: model.description,
            lists: model.lists ? `${model.lists.length} variants` : 'no variants',
            isActive: model.isActive !== undefined ? model.isActive : 'N/A'
          });
        });
        
        setVehicles(vehiclesData);
      } else {
        console.warn('⚠️ Failed to fetch vehicles:', result.message);
        setVehicles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };


  // Reload all orders from database - ONLY orders for the logged-in staff member
  const reloadAllOrders = useCallback(async () => {
    try {
      setLoadingOrderForms(true);
      setOrderFormsError(null);
      const allOrders = [];
      
      // Get all customers to get their IDs and names (needed for customer name mapping)
      const { getAllCustomers } = await import('../services/customerService');
      const customersResult = await getAllCustomers();
      
      // Build customer map: customerId -> customerName
      const customerMap = new Map();
      if (customersResult.success && customersResult.data) {
        for (const customer of customersResult.data) {
          const customerId = customer.customerId || customer.customer_id || customer.id;
          if (customerId) {
            const id = parseInt(customerId);
            if (!isNaN(id)) {
              customerMap.set(id, customer.name || `Customer ${id}`);
            }
          }
        }
      }
      
      // Fetch orders ONLY for the logged-in staff member
      console.log('🔄 Fetching orders for logged-in staff member...');
      try {
        const staffOrdersResult = await viewOrdersByStaffId();
        if (staffOrdersResult.success && staffOrdersResult.data && staffOrdersResult.data.length > 0) {
          console.log(`✅ Found ${staffOrdersResult.data.length} orders for this staff member`);
          
          for (const order of staffOrdersResult.data) {
            const orderId = order.orderId || order.order_id;
            if (orderId) {
              const customerId = order.customerId || order.customer_id;
              const customerName = customerMap.get(customerId) || `Customer ${customerId || 'Unknown'}`;
              
              console.log(`  Order ${orderId}:`, {
                status: order.status,
                modelId: order.modelId,
                customerId: customerId,
                customerName: customerName,
                orderDate: order.orderDate,
                dealerStaffId: order.dealerStaffId || order.dealer_staff_id,
                hasDetail: !!order.detail,
                quantity: order.detail?.quantity,
                unitPrice: order.detail?.unitPrice
              });
              
              const transformed = transformOrderToOrderForm(order, customerName);
              allOrders.push(transformed);
            }
          }
          
          console.log(`✅ Loaded ${allOrders.length} orders for this staff member`);
        } else {
          console.log(`ℹ️ No orders found for this staff member: ${staffOrdersResult.message || 'No data'}`);
          setOrderFormsError('No orders found for your account.');
        }
      } catch (err) {
        console.error('❌ Error fetching orders by staff ID:', err);
        setOrderFormsError(`Failed to load orders: ${err.message || 'Unknown error'}`);
      }
      
      // Sort by order ID (newest first)
      allOrders.sort((a, b) => {
        const idA = parseInt(String(a.orderId || a.id).replace(/[^0-9]/g, '')) || 0;
        const idB = parseInt(String(b.orderId || b.id).replace(/[^0-9]/g, '')) || 0;
        return idB - idA;
      });
      
      setOrderForms(allOrders);
      console.log(`✅ Total orders displayed: ${allOrders.length}`);
    } catch (err) {
      console.error('❌ Error loading orders:', err);
      setOrderForms([]);
      setOrderFormsError(`Failed to load orders: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingOrderForms(false);
    }
  }, []);

  // Load all customers once on mount for client-side filtering
  useEffect(() => {
    const loadAllCustomers = async () => {
      try {
        setSearchingCustomers(true);
        const result = await getAllCustomers();
        if (result.success && result.data && Array.isArray(result.data)) {
          setAllCustomersCache(result.data);
          console.log(`✅ Loaded ${result.data.length} customers for search`);
        }
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        setSearchingCustomers(false);
      }
    };
    loadAllCustomers();
  }, []);

  // Handle customer search input change with client-side filtering
  useEffect(() => {
    const filterCustomers = (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const searchLower = searchTerm.trim().toLowerCase();
      
      // Filter customers client-side - match if name contains the search term (case-insensitive)
      const filtered = allCustomersCache.filter(customer => {
        const customerName = (customer.name || '').toLowerCase();
        // Check if customer name contains the search term (partial match)
        return customerName.includes(searchLower);
      });

      if (filtered.length > 0) {
        setSearchResults(filtered);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(true); // Still show "no results" message with create button
      }
    };

    // Debounce the filtering
    const timeoutId = setTimeout(() => {
      filterCustomers(customerSearchTerm);
    }, 200); // Reduced debounce time since it's client-side filtering

    return () => clearTimeout(timeoutId);
  }, [customerSearchTerm, allCustomersCache]);

  // Select a customer from search results
  const handleSelectCustomer = (customer) => {
    const customerId = customer.customerId || customer.customer_id || customer.id;
    setFormData(prev => ({
      ...prev,
      customer: customer.name || '',
      customerId: customerId.toString(),
      phone: customer.phoneNumber || customer.phone || '',
      email: customer.email || ''
    }));
    setCustomerSearchTerm(customer.name || '');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Handle create customer
  const handleCreateCustomer = async () => {
    if (!newCustomerData.name.trim() || !newCustomerData.email.trim()) {
      alert('Name and Email are required');
      return;
    }

    setCreatingCustomer(true);
    try {
      const result = await createCustomer({
        name: newCustomerData.name.trim(),
        email: newCustomerData.email.trim(),
        phoneNumber: newCustomerData.phoneNumber || '',
        address: newCustomerData.address || ''
      });

      if (result.success) {
        // Extract customer ID from the response message (format: "Customer ID: X")
        let newCustomerId = null;
        if (result.data) {
          const idMatch = String(result.data).match(/Customer ID: (\d+)/);
          if (idMatch) {
            newCustomerId = parseInt(idMatch[1]);
          }
        }

        // Wait a moment for database to be updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh customer cache to include the newly created customer
        try {
          const refreshResult = await getAllCustomers();
          if (refreshResult.success && refreshResult.data && Array.isArray(refreshResult.data)) {
            setAllCustomersCache(refreshResult.data);
            
            // Try to find the newly created customer in the refreshed cache
            let newCustomer = null;
            if (newCustomerId) {
              newCustomer = refreshResult.data.find(c => {
                const id = c.customerId || c.customer_id || c.id;
                return id && parseInt(id) === newCustomerId;
              });
            }
            // Fallback: match by email if ID match fails
            if (!newCustomer) {
              newCustomer = refreshResult.data.find(c => 
                c.email && c.email.trim() === newCustomerData.email.trim()
              );
            }
            // Fallback: match by exact name
            if (!newCustomer) {
              newCustomer = refreshResult.data.find(c => 
                c.name && c.name.trim() === newCustomerData.name.trim()
              );
            }
            
            if (newCustomer) {
              // Auto-select the newly created customer
              handleSelectCustomer(newCustomer);
              alert('✅ Customer created successfully and selected!');
            } else if (newCustomerId) {
              // Create a temporary customer object if we have the ID but can't find it in cache
              const tempCustomer = {
                customerId: newCustomerId,
                customer_id: newCustomerId,
                id: newCustomerId,
                name: newCustomerData.name.trim(),
                email: newCustomerData.email.trim(),
                phoneNumber: newCustomerData.phoneNumber || '',
                phone: newCustomerData.phoneNumber || ''
              };
              handleSelectCustomer(tempCustomer);
              alert('✅ Customer created successfully and selected!');
            } else {
              setCustomerSearchTerm(newCustomerData.name.trim());
              alert('✅ Customer created successfully! Please wait a moment and search for the customer name to select them.');
            }
          }
        } catch (refreshErr) {
          console.error('Error refreshing customer cache:', refreshErr);
          // Fallback: use the customer data we have if cache refresh fails
          if (newCustomerId) {
            const tempCustomer = {
              customerId: newCustomerId,
              customer_id: newCustomerId,
              id: newCustomerId,
              name: newCustomerData.name.trim(),
              email: newCustomerData.email.trim(),
              phoneNumber: newCustomerData.phoneNumber || '',
              phone: newCustomerData.phoneNumber || ''
            };
            handleSelectCustomer(tempCustomer);
            alert('✅ Customer created successfully and selected!');
          }
        }

        // Reset form and close modal
        setNewCustomerData({ name: '', email: '', phoneNumber: '', address: '' });
        setShowCreateCustomerModal(false);
      } else {
        alert(`❌ Failed to create customer: ${result.message || 'Unknown error'}`);
        // Close modal after alert is dismissed
        setNewCustomerData({ name: '', email: '', phoneNumber: '', address: '' });
        setShowCreateCustomerModal(false);
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('❌ An error occurred while creating customer');
      // Close modal after alert is dismissed
      setNewCustomerData({ name: '', email: '', phoneNumber: '', address: '' });
      setShowCreateCustomerModal(false);
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Pre-fill customer when coming from CustomerDetail page
  useEffect(() => {
    const customerData = location.state?.customer;
    const fromCustomerDetail = location.state?.fromCustomerDetail;
    
    if (fromCustomerDetail && customerData) {
      console.log('✅ Pre-filling customer from CustomerDetail:', customerData);
      // Pre-fill customer information
      setFormData(prev => ({
        ...prev,
        customer: customerData.name || '',
        customerId: customerData.customerId?.toString() || customerData.id?.toString() || '',
        phone: customerData.phone || customerData.phoneNumber || '',
        email: customerData.email || ''
      }));
      
      // Set search term to show selected customer
      setCustomerSearchTerm(customerData.name || '');
      
      // Open create modal automatically after a short delay to ensure form is ready
      setTimeout(() => {
        setIsCreateModalOpen(true);
      }, 100);
    }
  }, [location.state]);

  // Initialize customer search term when form opens with existing customer
  useEffect(() => {
    if (isCreateModalOpen && formData.customer && !customerSearchTerm) {
      setCustomerSearchTerm(formData.customer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateModalOpen, formData.customer]); // customerSearchTerm excluded to prevent infinite loop

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Load all orders on mount
  useEffect(() => {
    reloadAllOrders();
  }, [reloadAllOrders]);

  // Sample discount codes for selection
  const sampleDiscountCodes = [
    { 
      id: 'NO-DISCOUNT', 
      code: 'None', 
      amount: 0,
      description: 'No discount applied',
      type: 'none'
    },
    { 
      id: 'SPRING2025', 
      code: 'SPRING2025', 
      amount: 50000000,
      description: 'Spring Sale - 50M off',
      type: 'promotion'
    },
    { 
      id: 'FIRST-CUSTOMER', 
      code: 'FIRST-CUSTOMER', 
      amount: 100000000,
      description: 'First Time Buyer - 100M off',
      type: 'customer'
    },
    { 
      id: 'VIP-DISCOUNT', 
      code: 'VIP-DISCOUNT', 
      amount: 150000000,
      description: 'VIP Member - 150M off',
      type: 'vip'
    },
    { 
      id: 'BULK-50', 
      code: 'BULK-50', 
      amount: 300000000,
      description: 'Bulk Order - 300M off',
      type: 'bulk'
    },
  ];

  // Auto-open create modal and pre-fill vehicle data when coming from Inventory
  useEffect(() => {
    if (vehicleData) {
      setIsCreateModalOpen(true);
      // Try to find the model and variant from the vehicle data
      if (vehicleData.modelId) {
        setFormData(prev => ({
          ...prev,
          modelId: vehicleData.modelId,
          model: vehicleData.modelName || vehicleData.title || vehicleData.model,
        }));
      }
      if (vehicleData.variantId) {
        setFormData(prev => ({
          ...prev,
          variantId: vehicleData.variantId,
          basePrice: vehicleData.price || vehicleData.dealerPrice || '',
          color: vehicleData.color || 'White',
        }));
      }
      // Also set VIN if available
      if (vehicleData.vin || vehicleData.serialId) {
        setFormData(prev => ({
          ...prev,
          vin: vehicleData.vin || vehicleData.serialId || 'Pending',
        }));
      }
      // Set total price if base price is set
      if (vehicleData.price || vehicleData.dealerPrice) {
        const price = vehicleData.price || vehicleData.dealerPrice;
        setFormData(prev => ({
          ...prev,
          totalPrice: price.toString(),
        }));
      }
    }
  }, [vehicleData]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="w-7 h-7" />
                <span>Order Forms</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all orders from the database
                {orderForms.length > 0 && (
                  <span className="ml-2 font-semibold text-blue-600">
                    ({orderForms.length} {orderForms.length === 1 ? 'order' : 'orders'})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => reloadAllOrders()}
                disabled={loadingOrderForms}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh order list from database"
              >
                <RefreshCw className={`w-5 h-5 ${loadingOrderForms ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Order Form</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Forms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loadingOrderForms ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading orders from database...</span>
            </div>
          ) : orderFormsError ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-lg font-medium text-gray-900">Error Loading Orders</p>
              <p className="text-sm mt-2 text-gray-600 max-w-md mx-auto">{orderFormsError}</p>
              <button
                onClick={() => reloadAllOrders()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrderForms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm mt-2">No orders have been created yet in the database</p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={() => reloadAllOrders()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create New Order Form
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrderForms.map((orderForm) => (
                  <tr 
                    key={orderForm.id} 
                    onClick={() => handleView(orderForm)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {orderForm.linked_order_id || orderForm.id}
                      </div>
                      {orderForm.orderId && (
                        <div className="text-xs text-gray-500 font-mono">
                          DB ID: {orderForm.orderId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{orderForm.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{orderForm.vehicle}</div>
                      {orderForm.quantity > 1 && (
                        <div className="text-xs text-orange-700 font-semibold mt-1">
                          Qty: {orderForm.quantity} units
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency((orderForm.price - orderForm.discount) * (orderForm.quantity || 1))}
                      </div>
                      {orderForm.quantity > 1 && (
                        <div className="text-xs text-gray-500">
                          {orderForm.quantity} × {formatCurrency(orderForm.price - orderForm.discount)}
                        </div>
                      )}
                      {orderForm.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Discount: {formatCurrency(orderForm.discount)}
                          {orderForm.discountCode && orderForm.discountCode !== 'None' && (
                            <span className="text-orange-600 font-semibold ml-1">
                              ({orderForm.discountCode})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const status = orderForm.status || orderForm._originalOrder?.status || 'Pending';
                        // Backend returns: "Pending", "Delivered", "Cancelled"
                        const statusLower = status.toLowerCase();
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusLower === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : statusLower === 'cancelled' || statusLower === 'cancel'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(orderForm.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(orderForm.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        {/* Actions can be added here if needed */}
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Order Form Modal - Simplified version of Quotations modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <FileText className="w-7 h-7" />
                      <span>Create Order Form</span>
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Fill in details after discussion with customer
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Delivery Banner (shown when coming from "Pick and Deliver") */}
                {redirectToDelivery && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Pick and Deliver: After creating this order, you'll be redirected to the Delivery section to manage the delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Customer Information */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-blue-600">👤</span>
                    <span>Customer Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Search Customer by Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerSearchTerm}
                          onChange={(e) => {
                            setCustomerSearchTerm(e.target.value);
                            if (!e.target.value) {
                              setFormData(prev => ({ ...prev, customer: '', customerId: '', phone: '', email: '' }));
                            }
                          }}
                          onFocus={() => {
                            // Show results if we have a search term (at least 2 characters)
                            // This will show either matching results or the "no results" message with create button
                            if (customerSearchTerm.trim().length >= 2) {
                              setShowSearchResults(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay hiding to allow click on results
                            // Use a longer delay to ensure clicks are registered
                            setTimeout(() => setShowSearchResults(false), 300);
                          }}
                          onKeyDown={(e) => {
                            // Allow Escape to close results
                            if (e.key === 'Escape') {
                              setShowSearchResults(false);
                            }
                            // Allow Enter to select first result
                            if (e.key === 'Enter' && searchResults.length > 0) {
                              e.preventDefault();
                              handleSelectCustomer(searchResults[0]);
                            }
                          }}
                          placeholder="Type customer name to search (min 2 characters)..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-10"
                          required
                        />
                        {searchingCustomers && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        )}
                        
                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                          <div 
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking results
                          >
                            {searchResults.map((customer) => {
                              const customerId = customer.customerId || customer.customer_id || customer.id;
                              return (
                                <div
                                  key={customerId}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectCustomer(customer);
                                  }}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  {customer.email && (
                                    <div className="text-xs text-gray-500">📧 {customer.email}</div>
                                  )}
                                  {customer.phoneNumber && (
                                    <div className="text-xs text-gray-500">📞 {customer.phoneNumber}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* No results found - show create option */}
                        {showSearchResults && !searchingCustomers && customerSearchTerm.trim().length >= 2 && searchResults.length === 0 && (
                          <div 
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking button
                          >
                            <div className="text-sm text-gray-600 mb-3">
                              No customer found with name "{customerSearchTerm}"
                            </div>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setNewCustomerData({
                                  name: customerSearchTerm.trim(),
                                  email: '',
                                  phoneNumber: '',
                                  address: ''
                                });
                                setShowCreateCustomerModal(true);
                                setShowSearchResults(false);
                              }}
                              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Create New Customer "{customerSearchTerm}"</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Selected Customer Info */}
                      {formData.customer && formData.customerId && (
                        <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                          <div className="font-semibold text-blue-900">Selected: {formData.customer}</div>
                          {formData.email && <div className="text-xs mt-1">📧 {formData.email}</div>}
                          {formData.phone && <div className="text-xs">📞 {formData.phone}</div>}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        placeholder="Auto-filled from customer"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        placeholder="Auto-filled from customer"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-green-600">🚗</span>
                    <span>Vehicle Information</span>
                  </h3>
                  
                  {loadingVehicles ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading vehicles...</span>
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No vehicles available. Please check inventory.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicles.map((model) => (
                        <div 
                          key={model.modelId} 
                          className={`border-2 rounded-lg p-4 relative transition-all ${
                            formData.modelId === model.modelId 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ pointerEvents: 'auto', cursor: 'default' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{model.modelName}</h4>
                              <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔘 Button clicked for model:', model);
                                handleVehicleModelSelect(model);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseUp={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative z-10 active:scale-95 ${
                                formData.modelId === model.modelId
                                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
                              }`}
                              style={{ 
                                pointerEvents: 'auto',
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation'
                              }}
                            >
                              {formData.modelId === model.modelId ? '✓ Selected' : 'Select Model'}
                            </button>
                          </div>
                          
                          {formData.modelId === model.modelId && model.lists && model.lists.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Variant <span className="text-red-500">*</span>
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {model.lists.map((variant) => (
                                  <button
                                    type="button"
                                    key={variant.variantId}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('🔘 Variant clicked:', variant);
                                      handleVariantSelect(variant, model);
                                    }}
                                    className={`text-left p-3 border-2 rounded-lg transition-all cursor-pointer ${
                                      formData.variantId === variant.variantId
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                    } ${!variant.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!variant.isActive}
                                    style={{ pointerEvents: variant.isActive ? 'auto' : 'none' }}
                                  >
                                    <div className="font-semibold text-gray-900">{variant.versionName || 'Standard'}</div>
                                    <div className="text-xs text-gray-600 mt-1">Color: {variant.color}</div>
                                    <div className="text-sm font-bold text-green-600 mt-1">
                                      {formatCurrency(variant.price || 0)}
                                    </div>
                                    {!variant.isActive && (
                                      <div className="text-xs text-red-600 mt-1">Inactive</div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {formData.modelId === model.modelId && (!model.lists || model.lists.length === 0) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-yellow-600">
                              ⚠️ No variants available for this model. A variant will be auto-generated when creating the order.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.model && (
                    <div className="mt-4 grid grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Model</label>
                        <div className="text-sm font-semibold text-gray-900">{formData.model}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Variant</label>
                        <div className="text-sm text-gray-900">
                          {selectedVariant ? (selectedVariant.versionName || 'Standard') : 'Auto-Generated'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color</label>
                        <div className="text-sm text-gray-900">{formData.color}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price</label>
                        <div className="text-sm font-semibold text-green-600">{formatCurrency(parseFloat(formData.basePrice) || 0)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Payment Details */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-yellow-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-yellow-600">💰</span>
                    <span>Pricing & Payment Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Base Price (₫) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="1,020,000,000"
                      />
                    </div>

                  </div>

                  {/* Discount Code Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Code
                    </label>
                    <select
                      name="discountCode"
                      value={formData.discountCode}
                      onChange={(e) => {
                        const code = sampleDiscountCodes.find(c => c.id === e.target.value);
                        if (code) handleDiscountCodeSelect(code);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      <option value="">Select Discount Code...</option>
                      {sampleDiscountCodes.map((discountCode) => (
                        <option key={discountCode.id} value={discountCode.id}>
                          {discountCode.code}
                        </option>
                      ))}
                    </select>
                    {formData.discountCode && formData.discountAmount > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Discount Applied: {formatCurrency(formData.discountAmount)}
                      </p>
                    )}
                  </div>

                  {/* Total Price Display */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Price (₫) <span className="text-xs text-gray-500">*Auto-calculated</span>
                    </label>
                    <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg">
                      <span className="text-blue-800 font-bold text-xl">
                        {formatCurrency(parseFloat(formData.totalPrice) || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Section */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="Enter quantity (e.g., 1)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total will be calculated: {formData.quantity || 1} × {formatCurrency(parseFloat(formData.basePrice) || 0)} = {formatCurrency((parseFloat(formData.basePrice) || 0) * parseFloat(formData.quantity || 1))}
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Full Payment', 'Installment'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                          className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                            formData.paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                              : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-2xl">{method === 'Full Payment' ? '💵' : '🏦'}</span>
                            <span>{method}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Installment Payment Details */}
                    {formData.paymentMethod === 'Installment' && (
                      <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-4">
                        <div className="flex items-start space-x-3 mb-4">
                          <span className="text-2xl">💳</span>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Installment Payment Details</h4>
                            <p className="text-sm text-blue-800">
                              Select payment period. The total amount will be divided into monthly payments over the selected period.
                            </p>
                          </div>
                        </div>
                        
                        {/* Installment Period Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Payment Period <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {['6', '12'].map((months) => (
                              <button
                                key={months}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, installmentMonths: months }))}
                                className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                                  formData.installmentMonths === months
                                    ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-md'
                                    : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  <span className="text-xl">📅</span>
                                  <span>{months} Months</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Calculated Results */}
                        {(formData.remainingAmount || formData.monthlyPayment) && (
                          <div className="mt-4 p-4 bg-white border-2 border-blue-300 rounded-lg space-y-2">
                            <h5 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h5>
                            
                            {formData.remainingAmount && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Remaining Amount:</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {formatCurrency(parseFloat(formData.remainingAmount) || 0)}
                                </span>
                              </div>
                            )}
                            
                            {formData.monthlyPayment && formData.installmentMonths && (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-gray-600">
                                  Monthly Payment ({formData.installmentMonths} months):
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                  {formatCurrency(parseFloat(formData.monthlyPayment) || 0)}
                                </span>
                              </div>
                            )}
                            
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-purple-600">🗒️</span>
                    <span>Internal Notes</span>
                  </h3>
                  
                  <textarea
                    name="internalNotes"
                    value={formData.internalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer wants delivery this month, prefers white color..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-100 border-t-2 border-gray-300 p-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">❌</span>
                  <span>Cancel</span>
                </button>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleConfirmAndCreate}
                    disabled={!formData.customerId || !formData.modelId || !formData.basePrice}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                  >
                    <span className="text-xl">✅</span>
                    <span>Create Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Order Form Modal */}
        {isViewModalOpen && selectedOrderForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <FileText className="w-7 h-7" />
                      <span>Order Form Details</span>
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      {selectedOrderForm.id} • Created on {new Date(selectedOrderForm.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-blue-600">👤</span>
                    <span>Customer Information</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer Name</label>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {selectedOrderForm.customer}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer ID</label>
                      <div className="text-base font-mono text-gray-700 mt-1">
                        {selectedOrderForm.customerId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-green-600">🚗</span>
                    <span>Vehicle Details</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Model</label>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {selectedOrderForm.vehicle}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">VIN</label>
                      <div className="text-sm font-mono text-gray-700 mt-1">
                        {selectedOrderForm.vin}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-yellow-600">💰</span>
                    <span>Pricing Details</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedOrderForm.quantity > 1 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Quantity:</span>
                        <span className="text-base font-semibold text-orange-600">
                          {selectedOrderForm.quantity} units
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Unit Base Price:</span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatCurrency(selectedOrderForm.price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600">Discount:</span>
                        {selectedOrderForm.discountCode && selectedOrderForm.discountCode !== 'None' && (
                          <span className="text-xs text-orange-600 font-semibold">
                            Code: {selectedOrderForm.discountCode}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-semibold text-green-600">
                        -{formatCurrency(selectedOrderForm.discount)}
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Price:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency((selectedOrderForm.price - selectedOrderForm.discount) * (selectedOrderForm.quantity || 1))}
                        </span>
                      </div>
                      {selectedOrderForm.quantity > 1 && (
                        <div className="text-xs text-blue-700 mt-1">
                          ({(selectedOrderForm.quantity || 1)} × {formatCurrency(selectedOrderForm.price - selectedOrderForm.discount)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrderForm.notes && (
                  <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2 pb-3 border-b border-gray-200">
                      <span className="text-purple-600">🗒️</span>
                      <span>Internal Notes</span>
                    </h3>
                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedOrderForm.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                  >
                    Close
                  </button>
                  
                  <div className="flex-1">
                    {selectedOrderForm.linked_order_id && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-blue-800">
                          📋 <strong>Order ID:</strong> {selectedOrderForm.linked_order_id}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(selectedOrderForm.id)}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Customer Modal */}
        {showCreateCustomerModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <Plus className="w-6 h-6" />
                      <span>Create New Customer</span>
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      Quickly create a new customer for this order
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateCustomerModal(false);
                      setNewCustomerData({ name: '', email: '', phoneNumber: '', address: '' });
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newCustomerData.phoneNumber}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={newCustomerData.address}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Address (optional)"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Note:</strong> This customer will be created and automatically selected for the order. 
                    The customer will appear in the customer list and will be associated with this order.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateCustomerModal(false);
                    setNewCustomerData({ name: '', email: '', phoneNumber: '', address: '' });
                  }}
                  disabled={creatingCustomer}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={creatingCustomer || !newCustomerData.name.trim() || !newCustomerData.email.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingCustomer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Customer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderForm;

