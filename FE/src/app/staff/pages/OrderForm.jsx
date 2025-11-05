import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layout/Layout';
import { Plus, Eye, Edit2, Trash2, FileText, CheckCircle, Star, AlertTriangle, Send } from 'lucide-react';
import { useLocation } from 'react-router';

const OrderForm = () => {
  const location = useLocation();
  const vehicleData = location.state?.vehicleData;
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderForm, setSelectedOrderForm] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form state for creating order form
  const [formData, setFormData] = useState({
    // Customer Information
    customer: '',
    customerId: '',
    phone: '',
    email: '',
    customerType: 'Returning',
    contactMethod: 'Email',
    salesperson: 'Nguyen Van Hung',
    
    // Vehicle Information
    model: '',
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
    vat: '10',
    totalPrice: '',
    paymentMethod: 'Full Payment',
    bankName: '',
    loanTerm: '',
    interestRate: '',
    
    // Special Order
    isSpecialOrder: false,
    quantity: '1',
    
    // Notes
    internalNotes: '',
    attachments: [],
  });

  // Sample order forms data
  const orderForms = [
    {
      id: 'OF-2025-001',
      customer: 'Le Minh Tuan',
      customerId: 'C-001',
      vehicle: 'Model 3 Standard RWD',
      vin: '5YJ3E1EA0001',
      price: 970000000,
      discount: 50000000,
      discountCode: 'SPRING2025',
      paymentMethod: 'Full Payment',
      status: 'Confirmed',
      date: '2025-10-22',
      linked_order_id: 'ORD-2025-001',
      notes: 'Customer wants white color - Order confirmed',
      createdBy: 'Nguyen Van Hung',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
    },
    {
      id: 'OF-2025-002',
      customer: 'Tran Hoa',
      customerId: 'C-002',
      vehicle: 'Model Y Long Range',
      vin: 'Pending',
      price: 1120000000,
      discount: 80000000,
      discountCode: 'FIRST-CUSTOMER',
      paymentMethod: 'Installment',
      status: 'Pending',
      date: '2025-10-23',
      notes: 'Need to confirm financing options',
      createdBy: 'Le Thi Mai',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
    },
    {
      id: 'OF-2025-003',
      customer: 'Nguyen Van An',
      customerId: 'C-003',
      vehicle: 'Model 3 Performance AWD',
      vin: 'Pending',
      price: 1350000000,
      discount: 100000000,
      discountCode: 'FIRST-CUSTOMER',
      paymentMethod: 'Full Payment',
      status: 'Confirmed',
      date: '2025-10-21',
      linked_order_id: 'ORD-2025-003',
      notes: 'VIP customer - priority delivery',
      createdBy: 'Pham Thi Lan',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
    },
    {
      id: 'OF-2025-004',
      customer: 'Pham Thu Ha',
      customerId: 'C-004',
      vehicle: 'Model 3 Premium AWD',
      vin: 'Pending',
      price: 1080000000,
      discount: 60000000,
      discountCode: 'SPRING2025',
      paymentMethod: 'Full Payment',
      status: 'Pending',
      date: '2025-10-20',
      notes: 'Awaiting customer confirmation',
      createdBy: 'Tran Van Minh',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
    },
    {
      id: 'OF-2025-005',
      customer: 'Corporation ABC Ltd.',
      customerId: 'C-010',
      vehicle: 'Model 3 Standard RWD',
      vin: 'Multiple',
      price: 970000000,
      discount: 50000000,
      discountCode: 'SPRING2025',
      paymentMethod: 'Full Payment',
      status: 'Pending',
      date: '2025-10-26',
      notes: 'Bulk order - Special request',
      createdBy: 'Nguyen Van Hung',
      isSpecialOrder: true,
      quantity: 20,
      flaggedForCompany: false,
    },
    {
      id: 'OF-2025-006',
      customer: 'Individual Buyer',
      customerId: 'C-011',
      vehicle: 'Model Y Long Range',
      vin: 'Multiple',
      price: 1200000000,
      discount: 0,
      discountCode: 'None',
      paymentMethod: 'Full Payment',
      status: 'Pending',
      date: '2025-10-27',
      notes: 'Suspicious order - No guarantee shown',
      createdBy: 'Le Thi Mai',
      isSpecialOrder: true,
      quantity: 15,
      flaggedForCompany: true,
    },
  ];

  // Filter order forms
  const filteredOrderForms = orderForms.filter(q => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'special') return q.isSpecialOrder === true;
    return q.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Confirmed': { color: 'bg-green-100 text-green-800', icon: '✅' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle view order form
  const handleView = (orderForm) => {
    setSelectedOrderForm(orderForm);
    setIsViewModalOpen(true);
  };

  // Handle confirm order
  const handleConfirmOrder = (orderForm) => {
    if (!window.confirm(`Confirm order form ${orderForm.id}?\n\nThis will:\n• Create a new Order\n• Move to order confirmation stage`)) {
      return;
    }
    
    console.log('Confirming order:', orderForm.id);
    
    // Simulate API call
    const newOrderId = `ORD-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    alert(
      `✅ Order Created Successfully!\n\n` +
      `Order ID: ${newOrderId}\n` +
      `Order form ${orderForm.id} confirmed.\n` +
      `Redirecting to Orders page...`
    );
    
    setIsViewModalOpen(false);
  };

  // Handle delete
  const handleDelete = (orderFormId) => {
    if (window.confirm(`Are you sure you want to delete ${orderFormId}?`)) {
      console.log('Deleting order form:', orderFormId);
      alert(`Order form ${orderFormId} deleted.`);
    }
  };

  // Handle flag for company (toggle suspicious orders)
  const handleFlagForCompany = (orderForm, e) => {
    e.stopPropagation(); // Prevent row click
    const action = orderForm.flaggedForCompany ? 'un-flag' : 'flag';
    if (window.confirm(`${action === 'flag' ? 'Flag' : 'Un-flag'} order form ${orderForm.id} to send to company?\n\nThis will mark it for company review.`)) {
      console.log(`Flagging order for company:`, orderForm.id, !orderForm.flaggedForCompany);
      alert(`✅ Order form ${orderForm.id} ${action === 'flag' ? 'flagged' : 'un-flagged'} successfully!`);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Recalculate total if pricing fields change
    if (name === 'basePrice' || name === 'discountAmount' || name === 'vat' || name === 'quantity') {
      const base = name === 'basePrice' ? value : formData.basePrice;
      const discount = name === 'discountAmount' ? value : formData.discountAmount;
      const vat = name === 'vat' ? value : formData.vat;
      const quantity = name === 'quantity' ? value : formData.quantity;
      calculateTotalPrice(base, discount, vat, quantity);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer: customer.name,
      customerId: customer.id,
      phone: customer.phone,
      email: customer.email,
    }));
  };

  // Handle vehicle selection
  const handleVehicleSelect = useCallback((vehicle) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        model: vehicle.title,
        vehicleId: vehicle.id,
        vin: vehicle.vin || '',
        color: vehicle.color || 'White',
        config: vehicle.config || '',
        dealerStock: vehicle.stock || '',
        basePrice: vehicle.dealerPrice || '',
      };
      
      // Calculate total price within the callback
      const baseNum = parseFloat(vehicle.dealerPrice) || 0;
      const discountNum = parseFloat(prev.discountAmount) || 0;
      const vatNum = parseFloat(prev.vat) || 0;
      const qty = parseFloat(prev.quantity) || 1;
      
      const afterDiscount = (baseNum - discountNum) * qty;
      const total = afterDiscount + (afterDiscount * vatNum / 100);
      
      return {
        ...newFormData,
        totalPrice: total.toString(),
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
      
      // Calculate total price
      const baseNum = parseFloat(prev.basePrice) || 0;
      const discountNum = code.amount || 0;
      const vatNum = parseFloat(prev.vat) || 0;
      const qty = parseFloat(prev.quantity) || 1;
      
      const afterDiscount = (baseNum - discountNum) * qty;
      const total = afterDiscount + (afterDiscount * vatNum / 100);
      
      return {
        ...newFormData,
        totalPrice: total.toString(),
      };
    });
  };

  // Calculate total price
  const calculateTotalPrice = (base, discount, vat, quantity = 1) => {
    const baseNum = parseFloat(base) || 0;
    const discountNum = parseFloat(discount) || 0;
    const vatNum = parseFloat(vat) || 0;
    const qty = parseFloat(quantity) || 1;
    
    const afterDiscount = (baseNum - discountNum) * qty;
    const total = afterDiscount + (afterDiscount * vatNum / 100);
    
    setFormData(prev => ({
      ...prev,
      totalPrice: total.toString(),
    }));
  };

  // Handle confirm and create order
  const handleConfirmAndCreate = () => {
    if (!formData.customerId || !formData.vehicleId || !formData.basePrice) {
      alert('Please fill in all required fields.');
      return;
    }
    console.log('Confirming and creating order:', formData);
    const newOrderId = `ORD-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    alert(`✅ Order created successfully!\n\nOrder ID: ${newOrderId}`);
    setIsCreateModalOpen(false);
    resetForm();
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
      salesperson: 'Nguyen Van Hung',
      model: '',
      vehicleId: '',
      vin: '',
      color: 'White',
      config: '',
      dealerStock: '',
      source: 'From Inventory',
      basePrice: '',
      discountCode: '',
      discountAmount: '0',
      vat: '10',
      totalPrice: '',
      paymentMethod: 'Full Payment',
      bankName: '',
      loanTerm: '',
      interestRate: '',
      isSpecialOrder: false,
      quantity: '1',
      internalNotes: '',
      attachments: [],
    });
  };

  // Sample customers for selection
  const sampleCustomers = [
    { id: 'C-001', name: 'Le Minh Tuan', phone: '0901234567', email: 'tuan@example.com' },
    { id: 'C-002', name: 'Tran Hoa', phone: '0912345678', email: 'hoa@example.com' },
    { id: 'C-003', name: 'Nguyen Van An', phone: '0923456789', email: 'an@example.com' },
    { id: 'C-004', name: 'Pham Thu Ha', phone: '0934567890', email: 'ha@example.com' },
  ];

  // Sample vehicles for selection
  const sampleVehicles = [
    { 
      id: 'M3-001', 
      title: 'Model 3 Standard RWD', 
      dealerPrice: 1020000000,
      vin: '5YJ3E1EA0001',
      color: 'White',
      config: 'RWD • 70kWh • Fast Charge',
      stock: '3 units left',
      status: 'Available'
    },
    { 
      id: 'M3-002', 
      title: 'Model 3 Premium AWD', 
      dealerPrice: 1080000000,
      vin: '5YJ3E2EA0002',
      color: 'Red',
      config: 'AWD • 82kWh • Fast Charge',
      stock: '1 unit left',
      status: 'Available'
    },
    { 
      id: 'MY-001', 
      title: 'Model Y Long Range', 
      dealerPrice: 1350000000,
      vin: '',
      color: 'Blue',
      config: 'AWD • 82kWh • Premium Audio',
      stock: 'Out of stock',
      status: 'Out of stock'
    },
    { 
      id: 'M3-003', 
      title: 'Model 3 Performance AWD', 
      dealerPrice: 1450000000,
      vin: '5YJ3E4EA0004',
      color: 'White',
      config: 'AWD • 82kWh • Track Mode',
      stock: '2 units left',
      status: 'Available'
    },
  ];

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
      const vehicleConfig = `${vehicleData.driveType || 'RWD'} • ${vehicleData.batteryCapacity || 70}kWh • Fast Charge`;
      const stockStatus = vehicleData.status === 'available' ? 'Available' : 'Out of stock';
      
      const newVehicle = {
        id: vehicleData.id,
        title: vehicleData.title,
        dealerPrice: vehicleData.dealerPrice,
        vin: vehicleData.vin || 'Pending',
        color: 'White',
        config: vehicleConfig,
        stock: stockStatus,
        status: stockStatus
      };

      handleVehicleSelect(newVehicle);
      setIsCreateModalOpen(true);
    }
  }, [vehicleData, handleVehicleSelect]);

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
                Create order forms after discussing with customers
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Order Form</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('special')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'special'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Special Orders
            </button>
          </div>
        </div>

        {/* Order Forms Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Form ID
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
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${orderForm.isSpecialOrder ? 'bg-yellow-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{orderForm.id}</div>
                      {orderForm.isSpecialOrder && (
                        <div className="text-xs text-yellow-700 font-semibold flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Special Order</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orderForm.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orderForm.vehicle}</div>
                      {orderForm.isSpecialOrder && orderForm.quantity > 1 && (
                        <div className="text-xs text-orange-700 font-semibold">
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
                      <div className="text-xs text-gray-500">
                        Discount: {formatCurrency(orderForm.discount)}
                        {orderForm.discountCode && orderForm.discountCode !== 'None' && (
                          <span className="text-orange-600 font-semibold ml-1">
                            ({orderForm.discountCode})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(orderForm.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(orderForm.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        {orderForm.isSpecialOrder && (
                          <button
                            onClick={(e) => handleFlagForCompany(orderForm, e)}
                            className={`p-2 rounded-lg transition-colors ${
                              orderForm.flaggedForCompany
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={orderForm.flaggedForCompany ? 'Un-flag from company' : 'Flag to send to company'}
                          >
                            {orderForm.flaggedForCompany ? (
                              <Send className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {/* Customer Information */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-blue-600">👤</span>
                    <span>Customer Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={(e) => {
                          const customer = sampleCustomers.find(c => c.id === e.target.value);
                          if (customer) handleCustomerSelect(customer);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Customer...</option>
                        {sampleCustomers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="Auto-filled"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        placeholder="Auto-filled"
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
                  
                  <div className="grid grid-cols-2 gap-3">
                    {sampleVehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className={`text-left p-3 border-2 rounded-lg transition-all ${
                          formData.vehicleId === vehicle.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        } ${vehicle.status === 'Out of stock' ? 'opacity-50' : ''}`}
                        disabled={vehicle.status === 'Out of stock'}
                      >
                        <div className="font-semibold text-gray-900">{vehicle.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatCurrency(vehicle.dealerPrice)}</div>
                        <div className={`text-xs mt-1 font-semibold ${
                          vehicle.stock === 'Out of stock' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {vehicle.stock}
                        </div>
                      </button>
                    ))}
                  </div>

                  {formData.model && (
                    <div className="mt-4 grid grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Model</label>
                        <div className="text-sm font-semibold text-gray-900">{formData.model}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color</label>
                        <div className="text-sm text-gray-900">{formData.color}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Config</label>
                        <div className="text-sm text-gray-900">{formData.config}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stock</label>
                        <div className="text-sm font-semibold text-green-600">{formData.dealerStock}</div>
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">VAT (%)</label>
                      <input
                        type="number"
                        name="vat"
                        value={formData.vat}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="10"
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

                  {/* Special Order Section */}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          <label className="block text-sm font-bold text-gray-900">
                            Special Order
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isSpecialOrder: !prev.isSpecialOrder }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.isSpecialOrder ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.isSpecialOrder ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {formData.isSpecialOrder && (
                        <div className="mt-3 space-y-3">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                            ⚠️ Special orders are for bulk purchases or custom requests. These will need company approval if not in stock.
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                              placeholder="1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Total will be calculated: {formData.quantity} × Price
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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
                    disabled={!formData.customerId || !formData.vehicleId || !formData.basePrice}
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
              <div className={`${selectedOrderForm.isSpecialOrder ? 'bg-gradient-to-r from-purple-600 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white p-6 border-b`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <FileText className="w-7 h-7" />
                      <span>Order Form Details</span>
                      {selectedOrderForm.isSpecialOrder && (
                        <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Special</span>
                        </span>
                      )}
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
                  <div className="grid grid-cols-3 gap-4">
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
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Salesperson</label>
                      <div className="text-base font-semibold text-blue-700 mt-1">
                        {selectedOrderForm.createdBy}
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

                {/* Special Order Badge */}
                {selectedOrderForm.isSpecialOrder && (
                  <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span className="text-lg font-bold text-purple-900">Special Order</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {selectedOrderForm.quantity} units
                      </span>
                    </div>
                    {selectedOrderForm.flaggedForCompany && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-red-700 font-semibold">
                        <Send className="w-4 h-4" />
                        <span>Flagged for Company Review</span>
                      </div>
                    )}
                  </div>
                )}

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
                          {formatCurrency((selectedOrderForm.price - selectedOrderForm.discount) * (selectedOrderForm.quantity || 1) * 1.1)}
                        </span>
                      </div>
                      {selectedOrderForm.quantity > 1 && (
                        <div className="text-xs text-blue-700 mt-1">
                          ({(selectedOrderForm.quantity || 1)} × {formatCurrency((selectedOrderForm.price - selectedOrderForm.discount) * 1.1)})
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
                    {selectedOrderForm.status === 'Pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-yellow-800">
                          ⏳ <strong>Pending confirmation</strong> • Ready to create order
                        </p>
                      </div>
                    )}
                    {selectedOrderForm.status === 'Confirmed' && selectedOrderForm.linked_order_id && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-green-800">
                          ✅ <strong>Order Created:</strong> {selectedOrderForm.linked_order_id}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedOrderForm.status === 'Pending' && (
                      <>
                        {selectedOrderForm.isSpecialOrder && !selectedOrderForm.flaggedForCompany && (
                          <button
                            onClick={(e) => {
                              setIsViewModalOpen(false);
                              handleFlagForCompany(selectedOrderForm, e);
                            }}
                            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap flex items-center space-x-1"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Flag for Company</span>
                          </button>
                        )}
                        {selectedOrderForm.isSpecialOrder && selectedOrderForm.flaggedForCompany && (
                          <div className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium text-xs whitespace-nowrap flex items-center space-x-1">
                            <Send className="w-4 h-4" />
                            <span>Flagged</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(selectedOrderForm.id)}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => handleConfirmOrder(selectedOrderForm)}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          ✅ Create Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderForm;

