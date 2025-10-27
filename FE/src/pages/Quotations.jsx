import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout/Layout';
import { Plus, Eye, Edit2, Trash2, FileText, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router';
import tesla1 from '../assets/tesla1.png';

const Quotations = () => {
  const location = useLocation();
  const vehicleData = location.state?.vehicleData;
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendConfirmModalOpen, setIsSendConfirmModalOpen] = useState(false);
  const [isSendSuccessModalOpen, setIsSendSuccessModalOpen] = useState(false);
  
  // Quotation status state
  const [quotationStatus, setQuotationStatus] = useState('Draft'); // Draft, Pending, Approved
  const [sentDate, setSentDate] = useState('');
  
  // Form state for creating quotation
  const [formData, setFormData] = useState({
    // Customer Information
    customer: '',
    customerId: '',
    phone: '',
    email: '',
    customerType: 'Returning',
    contactMethod: 'Email',
    salesperson: 'Nguyen Van Hung', // Auto-filled from logged-in user
    
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
    discount: '0',
    vat: '10',
    totalPrice: '',
    paymentMethod: 'Cash',
    bankName: '',
    loanTerm: '',
    interestRate: '',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    
    // Notes & Actions
    internalNotes: '',
    attachments: [],
  });

  // Sample quotations data
  const quotations = [
    {
      id: 'Q-2025-001',
      customer: 'Le Minh Tuan',
      customerId: 'C-001',
      vehicle: 'Model 3 Standard RWD',
      vin: '5YJ3E1EA0001',
      price: 970000000,
      discount: 50000000,
      paymentMethod: 'Cash',
      status: 'Approved',
      date: '2025-10-22',
      sentDate: '2025-10-15',
      linked_order_id: 'O-2025-001',
      notes: 'Customer wants white color - Order already created',
      createdBy: 'Nguyen Van Hung',
    },
    {
      id: 'Q-2025-002',
      customer: 'Tran Hoa',
      customerId: 'C-002',
      vehicle: 'Model Y Long Range',
      vin: 'Pending',
      price: 1120000000,
      discount: 80000000,
      paymentMethod: 'Installment',
      status: 'Draft',
      date: '2025-10-23',
      notes: 'Need to discuss financing options',
      createdBy: 'Le Thi Mai',
    },
    {
      id: 'Q-2025-003',
      customer: 'Nguyen Van An',
      customerId: 'C-003',
      vehicle: 'Model 3 Performance AWD',
      vin: 'Pending',
      price: 1350000000,
      discount: 100000000,
      paymentMethod: 'Cash',
      status: 'Approved',
      date: '2025-10-21',
      sentDate: '2025-10-14',
      notes: 'VIP customer - priority delivery',
      createdBy: 'Pham Thi Lan',
    },
    {
      id: 'Q-2025-004',
      customer: 'Pham Thu Ha',
      customerId: 'C-004',
      vehicle: 'Model 3 Premium AWD',
      vin: 'Pending',
      price: 1080000000,
      discount: 60000000,
      paymentMethod: 'Cash',
      status: 'Expired',
      date: '2025-10-10',
      sentDate: '2025-10-03',
      notes: 'Customer did not respond',
      createdBy: 'Tran Van Minh',
    },
    {
      id: 'Q-2025-005',
      customer: 'Hoang Thi Lan',
      customerId: 'C-005',
      vehicle: 'Model 3 Standard RWD',
      vin: 'Pending',
      price: 970000000,
      discount: 30000000,
      paymentMethod: 'Cash',
      status: 'Pending',
      date: '2025-10-20',
      sentDate: '2025-10-20',
      notes: 'Online order - waiting for customer confirmation',
      createdBy: 'Nguyen Van Hung',
    },
  ];

  // Filter quotations
  const filteredQuotations = quotations.filter(q => {
    if (statusFilter === 'all') return true;
    return q.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: '📝' },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Approved': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Expired': { color: 'bg-red-100 text-red-800', icon: '⏱️' },
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

  // Handle view quotation
  const handleView = (quotation) => {
    setSelectedQuotation(quotation);
    setIsViewModalOpen(true);
  };

  // Handle convert to order
  const handleConvertToOrder = (quotation) => {
    if (!window.confirm(`Convert quotation ${quotation.id} to order?\n\nThis will:\n• Create a new Order\n• Create Contract\n• Reserve vehicle\n• Lock this quotation`)) {
      return;
    }
    
    console.log('Converting quotation to order:', quotation.id);
    
    // Simulate API call
    const newOrderId = `O-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // TODO: Call backend API
    // await createOrderFromQuote(quotation.id)
    
    alert(
      `✅ Order Created Successfully!\n\n` +
      `Order ID: ${newOrderId}\n` +
      `Contract ID: C-2025-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}\n` +
      `Vehicle Reserved: ${quotation.vehicle}\n\n` +
      `Quotation ${quotation.id} is now locked.\n` +
      `Redirecting to Order page...`
    );
    
    setIsViewModalOpen(false);
    
    // Simulate redirect
    console.log(`Would redirect to: /orders/${newOrderId}`);
    // In real app: navigate(`/orders/${newOrderId}`);
  };

  // Handle delete
  const handleDelete = (quotationId) => {
    if (window.confirm(`Are you sure you want to delete ${quotationId}?`)) {
      console.log('Deleting quotation:', quotationId);
      // Implement delete logic
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
    if (name === 'basePrice' || name === 'discount' || name === 'vat') {
      const base = name === 'basePrice' ? value : formData.basePrice;
      const discount = name === 'discount' ? value : formData.discount;
      const vat = name === 'vat' ? value : formData.vat;
      calculateTotalPrice(base, discount, vat);
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
      const discountNum = parseFloat(prev.discount) || 0;
      const vatNum = parseFloat(prev.vat) || 0;
      
      const afterDiscount = baseNum - discountNum;
      const total = afterDiscount + (afterDiscount * vatNum / 100);
      
      return {
        ...newFormData,
        totalPrice: total.toString(),
      };
    });
  }, []);

  // Calculate total price
  const calculateTotalPrice = (base, discount, vat) => {
    const baseNum = parseFloat(base) || 0;
    const discountNum = parseFloat(discount) || 0;
    const vatNum = parseFloat(vat) || 0;
    
    const afterDiscount = baseNum - discountNum;
    const total = afterDiscount + (afterDiscount * vatNum / 100);
    
    setFormData(prev => ({
      ...prev,
      totalPrice: total.toString(),
    }));
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    console.log('Saving quotation as draft:', formData);
    alert('✅ Quotation saved as draft!');
    setIsCreateModalOpen(false);
    resetForm();
  };

  // Handle approve and create order
  const handleApproveAndCreate = () => {
    console.log('Approving and creating order:', formData);
    alert('✅ Quotation approved and order created successfully!');
    setIsCreateModalOpen(false);
    resetForm();
    setQuotationStatus('Draft');
  };

  // Handle send to customer
  const handleSendToCustomer = () => {
    setIsSendConfirmModalOpen(true);
  };

  // Confirm send to customer
  const confirmSendToCustomer = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setSentDate(currentDate);
    setQuotationStatus('Pending');
    setIsSendConfirmModalOpen(false);
    setIsSendSuccessModalOpen(true);
  };

  // Handle cancel quotation
  const handleCancelQuotation = () => {
    if (window.confirm('Are you sure you want to cancel this quotation?')) {
      console.log('Cancelling quotation');
      setIsCreateModalOpen(false);
      resetForm();
      setQuotationStatus('Draft');
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
      salesperson: 'Nguyen Van Hung',
      model: '',
      vehicleId: '',
      vin: '',
      color: 'White',
      config: '',
      dealerStock: '',
      source: 'From Inventory',
      basePrice: '',
      discount: '0',
      vat: '10',
      totalPrice: '',
      paymentMethod: 'Cash',
      bankName: '',
      loanTerm: '',
      interestRate: '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  // Auto-open create modal and pre-fill vehicle data when coming from Inventory
  useEffect(() => {
    if (vehicleData) {
      // Convert vehicle data from inventory to match the form structure
      const vehicleConfig = `${vehicleData.driveType || 'RWD'} • ${vehicleData.batteryCapacity || 70}kWh • Fast Charge`;
      const stockStatus = vehicleData.status === 'available' ? 'Available' : 'Out of stock';
      
      // Create a new vehicle entry that matches sampleVehicles structure
      const newVehicle = {
        id: vehicleData.id,
        title: vehicleData.title,
        dealerPrice: vehicleData.dealerPrice,
        vin: vehicleData.vin || 'Pending',
        color: 'White', // Default color
        config: vehicleConfig,
        stock: stockStatus,
        status: stockStatus
      };

      // Select this vehicle automatically
      handleVehicleSelect(newVehicle);
      
      // Open the create modal
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
                <span>Quotations</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage customer quotations
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Quotation</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
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
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Draft
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
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'expired'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired
            </button>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote ID
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr 
                    key={quotation.id} 
                    onClick={() => handleView(quotation)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.vehicle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(quotation.price - quotation.discount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Discount: {formatCurrency(quotation.discount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quotation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(quotation.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Quotation Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold flex items-center space-x-2">
                        <FileText className="w-7 h-7" />
                        <span>Create Quotation</span>
                      </h2>
                      {quotationStatus === 'Pending' && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center space-x-1">
                          <span>🕒</span>
                          <span>Pending Confirmation</span>
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                      {quotationStatus === 'Draft' 
                        ? 'Complete all sections to create a new quotation'
                        : `Status: ${quotationStatus} • Sent: ${sentDate}`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                      setQuotationStatus('Draft');
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Read-Only Notice for Pending Status */}
              {quotationStatus === 'Pending' && (
                <div className="bg-yellow-50 border-y-2 border-yellow-300 p-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-800">
                    <span className="text-xl">🔒</span>
                    <p className="font-semibold">
                      This quotation is in <span className="underline">Pending Customer Confirmation</span> status. All fields are read-only.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                
                {/* 1️⃣ Customer Information */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-blue-600">👤</span>
                    <span>1️⃣ Customer Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Customer Dropdown */}
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
                        disabled={quotationStatus === 'Pending'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          quotationStatus === 'Pending' ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select Customer...</option>
                        {sampleCustomers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone (Auto-fill) */}
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

                    {/* Email (Auto-fill) */}
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

                    {/* Customer Type */}
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleInputChange}
                        disabled={quotationStatus === 'Pending'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          quotationStatus === 'Pending' ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Returning">Returning</option>
                      </select>
                    </div>

                    {/* Contact Method */}
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Method</label>
                      <select
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleInputChange}
                        disabled={quotationStatus === 'Pending'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          quotationStatus === 'Pending' ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="In-person">In-person</option>
                      </select>
                    </div>

                    {/* Salesperson (Auto) */}
                    <div className="col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Salesperson</label>
                      <input
                        type="text"
                        value={formData.salesperson}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2️⃣ Vehicle Information */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-green-600">🚗</span>
                    <span>2️⃣ Vehicle Information</span>
                  </h3>
                  
                  {/* Vehicle Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Vehicle <span className="text-red-500">*</span>
                    </label>
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
                  </div>

                  {formData.model && (
                    <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Model</label>
                        <div className="text-sm font-semibold text-gray-900">{formData.model}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">VIN</label>
                        <div className="text-sm font-mono text-gray-900">{formData.vin || '—'}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Color</label>
                        <div className="text-sm text-gray-900">{formData.color}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Config</label>
                        <div className="text-sm text-gray-900">{formData.config}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stock Status</label>
                        <div className="text-sm font-semibold text-green-600">{formData.dealerStock}</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Source</label>
                        <div className="text-sm text-gray-900">{formData.source}</div>
                      </div>
                    </div>
                  )}

                  {formData.dealerStock === 'Out of stock' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      ⚠️ This model is out of stock. You can place an order from the manufacturer.
                    </div>
                  )}
                </div>

                {/* 3️⃣ Pricing & Payment Details */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-yellow-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-yellow-600">💰</span>
                    <span>3️⃣ Pricing & Payment Details</span>
                  </h3>
                  
                  {/* A. Pricing Information */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-300 pb-2">
                      💸 A. Pricing Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Base Price */}
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

                      {/* Discount */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (₫)</label>
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                          placeholder="50,000,000"
                        />
                      </div>

                      {/* VAT */}
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

                      {/* Total Price (Auto-calc) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Total Price (₫) <span className="text-xs text-gray-500">*Auto-calculated</span>
                        </label>
                        <div className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg">
                          <span className="text-blue-800 font-bold text-lg">
                            {formatCurrency(parseFloat(formData.totalPrice) || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* B. Payment Method Selection */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-300 pb-2">
                      🏦 B. Payment Method Selection
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Cash', 'Finance'].map((method) => (
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
                                <span className="text-2xl">{method === 'Cash' ? '💵' : '🏦'}</span>
                                <span>{method}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Valid Until */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until</label>
                        <input
                          type="date"
                          name="validUntil"
                          value={formData.validUntil}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">📅 Default: 7 days from creation date</p>
                      </div>
                    </div>
                  </div>

                  {/* C. Additional Details (Dynamic Section) */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide border-b border-gray-300 pb-2">
                      📄 C. Additional Details
                    </h4>
                    
                    {/* Cash Payment Message */}
                    {formData.paymentMethod === 'Cash' && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <span className="text-3xl">💵</span>
                          <div>
                            <h5 className="font-semibold text-green-900 mb-1">Cash Payment</h5>
                            <p className="text-sm text-green-800">Full payment due before delivery.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Finance Details */}
                    {formData.paymentMethod === 'Finance' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-2xl">🏦</span>
                          <h5 className="font-semibold text-blue-900">Finance Details</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                            <select
                              name="bankName"
                              value={formData.bankName}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base"
                            >
                              <option value="">Select Bank...</option>
                              <option value="Vietcombank">Vietcombank</option>
                              <option value="VietinBank">VietinBank</option>
                              <option value="BIDV">BIDV</option>
                              <option value="Techcombank">Techcombank</option>
                              <option value="MB Bank">MB Bank</option>
                              <option value="ACB">ACB</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Term (months)</label>
                            <select
                              name="loanTerm"
                              value={formData.loanTerm}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base"
                            >
                              <option value="">Select Term...</option>
                              <option value="12">12 months</option>
                              <option value="24">24 months</option>
                              <option value="36">36 months</option>
                              <option value="48">48 months</option>
                              <option value="60">60 months</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (% per year)</label>
                            <input
                              type="number"
                              step="0.1"
                              name="interestRate"
                              value={formData.interestRate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                              placeholder="7.5"
                            />
                          </div>
                        </div>
                        {formData.loanTerm && formData.interestRate && formData.totalPrice && (
                          <div className="mt-4 pt-4 border-t border-blue-300">
                            <div className="bg-white/70 rounded-lg p-3">
                              <p className="text-xs text-blue-700 mb-1">💡 Estimated Monthly Installment:</p>
                              <p className="text-xl font-bold text-blue-900">
                                ≈ {formatCurrency(
                                  Math.round(
                                    (parseFloat(formData.totalPrice) * 
                                    (parseFloat(formData.interestRate) / 100 / 12)) / 
                                    (1 - Math.pow(1 + (parseFloat(formData.interestRate) / 100 / 12), 
                                    -parseFloat(formData.loanTerm)))
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4️⃣ Notes & Actions */}
                <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-purple-600">🗒️</span>
                    <span>4️⃣ Notes & Actions</span>
                  </h3>
                  
                  {/* Internal Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
                    <textarea
                      name="internalNotes"
                      value={formData.internalNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Customer wants delivery this month, prefers white color..."
                    />
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <input type="file" className="hidden" id="file-upload" multiple />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-gray-500">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">Click to upload vehicle images or documents</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-100 border-t-2 border-gray-300 p-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                    setQuotationStatus('Draft');
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">❌</span>
                  <span>Cancel</span>
                </button>
                <div className="flex items-center space-x-4">
                  {/* Show these buttons only when status is Draft */}
                  {quotationStatus === 'Draft' && (
                    <>
                      <button
                        onClick={handleSaveDraft}
                        disabled={!formData.customerId || !formData.vehicleId || !formData.basePrice}
                        className="flex items-center space-x-2 px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                      >
                        <span className="text-xl">💾</span>
                        <span>Save Draft</span>
                      </button>
                      <button
                        onClick={handleSendToCustomer}
                        disabled={!formData.customerId || !formData.vehicleId || !formData.basePrice}
                        className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                      >
                        <span className="text-xl">📤</span>
                        <span>Send to Customer</span>
                      </button>
                    </>
                  )}
                  
                  {/* Always show Approve & Create Order button */}
                  <button
                    onClick={handleApproveAndCreate}
                    disabled={!formData.customerId || !formData.vehicleId || !formData.basePrice}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                  >
                    <span className="text-xl">🧾</span>
                    <span>Approve & Order</span>
                  </button>

                  {/* Show Cancel Quote button when status is Pending */}
                  {quotationStatus === 'Pending' && (
                    <button
                      onClick={handleCancelQuotation}
                      className="flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
                    >
                      <span className="text-xl">❌</span>
                      <span>Cancel Quote</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Quotation Modal */}
        {isViewModalOpen && selectedQuotation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center space-x-2">
                      <FileText className="w-7 h-7" />
                      <span>Quotation Details</span>
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedQuotation.id} • Created on {new Date(selectedQuotation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                
                {/* 1. Customer Information */}
                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-blue-600">👤</span>
                    <span>Customer Information</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer Name</label>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {selectedQuotation.customer}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer ID</label>
                      <div className="text-base font-mono text-gray-700 mt-1">
                        {selectedQuotation.customerId}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Contact Method</label>
                      <div className="text-base text-gray-700 mt-1">
                        {selectedQuotation.paymentMethod === 'Cash' ? 'In-person' : 'Email'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Payment Method</label>
                      <div className="text-base text-gray-700 mt-1">
                        {selectedQuotation.paymentMethod}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Salesperson</label>
                      <div className="text-base font-semibold text-blue-700 mt-1">
                        {selectedQuotation.createdBy}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedQuotation.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Vehicle Details with Image */}
                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-green-600">🚗</span>
                    <span>Vehicle Details</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Vehicle Image */}
                    <div className="col-span-1">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-32">
                        <img 
                          src={tesla1}
                          alt={selectedQuotation.vehicle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Vehicle Info */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Model</label>
                        <div className="text-base font-semibold text-gray-900 mt-1">
                          {selectedQuotation.vehicle}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">VIN</label>
                        <div className="text-sm font-mono text-gray-700 mt-1">
                          {selectedQuotation.vin}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Configuration</label>
                        <div className="text-sm text-gray-700 mt-1">
                          RWD • 70kWh • Fast Charge
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Color</label>
                        <div className="text-sm text-gray-700 mt-1">
                          White Pearl
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Pricing Details */}
                <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 pb-3 border-b border-gray-200">
                    <span className="text-yellow-600">💰</span>
                    <span>Pricing Details</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Base Price:</span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatCurrency(selectedQuotation.price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Discount:</span>
                      <span className="text-base font-semibold text-green-600">
                        -{formatCurrency(selectedQuotation.discount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatCurrency(selectedQuotation.price - selectedQuotation.discount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">VAT (10%):</span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatCurrency((selectedQuotation.price - selectedQuotation.discount) * 0.1)}
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Price:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency((selectedQuotation.price - selectedQuotation.discount) * 1.1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedQuotation.notes && (
                  <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2 pb-3 border-b border-gray-200">
                      <span className="text-purple-600">🗒️</span>
                      <span>Internal Notes</span>
                    </h3>
                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedQuotation.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions based on Status */}
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Close Button */}
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                  >
                    Close
                  </button>
                  
                  {/* Center: Status Banner */}
                  <div className="flex-1">
                    {selectedQuotation.status === 'Pending' && selectedQuotation.sentDate && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-yellow-800">
                          ⏳ <strong>Waiting for customer confirmation</strong> • Sent on {new Date(selectedQuotation.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Expires in 7 days
                        </p>
                      </div>
                    )}
                    {selectedQuotation.status === 'Expired' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-red-800">
                          ⚠️ <strong>Quotation expired.</strong> Customer did not respond within 7 days.
                        </p>
                      </div>
                    )}
                    {selectedQuotation.status === 'Approved' && selectedQuotation.linked_order_id && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-green-800">
                          ✅ <strong>Order Created:</strong>{' '}
                          <a 
                            href={`/orders/${selectedQuotation.linked_order_id}`}
                            className="text-green-700 hover:underline font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              alert(`Navigate to Order: ${selectedQuotation.linked_order_id}`);
                            }}
                          >
                            {selectedQuotation.linked_order_id}
                          </a>
                          {' '}• Quotation approved
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* DRAFT Status Actions */}
                    {selectedQuotation.status === 'Draft' && (
                      <>
                        <button
                          onClick={() => handleDelete(selectedQuotation.id)}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => {
                            setIsViewModalOpen(false);
                            alert('Send quotation to customer - implement this feature');
                          }}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          📤 Send to Customer
                        </button>
                        <button
                          onClick={() => handleConvertToOrder(selectedQuotation)}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          ✅ Create Order
                        </button>
                      </>
                    )}
                    
                    {/* PENDING Status Actions */}
                    {selectedQuotation.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => {
                            if (window.confirm(`Mark quotation ${selectedQuotation.id} as Expired?`)) {
                              alert('Quotation marked as Expired');
                              setIsViewModalOpen(false);
                            }
                          }}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          ⏱️ Expire
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Customer confirmed quotation ${selectedQuotation.id}?`)) {
                              alert('Quotation approved! You can now create order.');
                              setIsViewModalOpen(false);
                            }
                          }}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          ✅ Confirmed
                        </button>
                      </>
                    )}
                    
                    {/* APPROVED Status Actions */}
                    {selectedQuotation.status === 'Approved' && selectedQuotation.linked_order_id && (
                      <>
                        <button
                          onClick={() => {
                            alert(`Navigate to Order: ${selectedQuotation.linked_order_id}`);
                            // In real app: navigate(`/orders/${selectedQuotation.linked_order_id}`);
                          }}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          📦 View Order
                        </button>
                        <button
                          onClick={() => {
                            alert(`Download PDF for quotation ${selectedQuotation.id}`);
                          }}
                          className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                        >
                          📄 Download PDF
                        </button>
                      </>
                    )}
                    
                    {/* EXPIRED Status Actions */}
                    {selectedQuotation.status === 'Expired' && (
                      <button
                        onClick={() => {
                          alert('Renew quotation - create new quotation based on this one');
                          setIsViewModalOpen(false);
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap"
                      >
                        🔄 Renew
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Confirmation Modal */}
        {isSendConfirmModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <span className="text-2xl">⚠️</span>
                  <span>Confirm Send to Customer</span>
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-700 text-base mb-4">
                  Are you sure you want to send this quotation to the customer?
                </p>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⚠️ After sending, you won't be able to edit it.
                  </p>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Customer: <span className="font-semibold">{formData.customer || 'Not selected'}</span></p>
                  <p>✓ Vehicle: <span className="font-semibold">{formData.model || 'Not selected'}</span></p>
                  <p>✓ Total: <span className="font-semibold">{formatCurrency(parseFloat(formData.totalPrice) || 0)}</span></p>
                  <p>✓ Valid Until: <span className="font-semibold">{formData.validUntil}</span></p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                <button
                  onClick={() => setIsSendConfirmModalOpen(false)}
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendToCustomer}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  📤 Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Success Modal */}
        {isSendSuccessModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-2xl font-bold">Quotation Successfully Sent!</h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-5 mb-4">
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="text-2xl">🕒</span>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Status: Pending Customer Confirmation</p>
                      <p className="text-sm text-gray-600 mt-1">Sent at: {sentDate}</p>
                      <p className="text-sm text-gray-600">Valid Until: {formData.validUntil}</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-yellow-300 pt-3 mt-3">
                    <p className="text-sm text-yellow-800 font-semibold">
                      ⚠️ You can no longer edit this quotation.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold text-gray-900">{formData.customer}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{formData.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-900">{formData.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">{formatCurrency(parseFloat(formData.totalPrice) || 0)}</span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Next Actions:</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>• Wait for customer confirmation</li>
                    <li>• You can approve and create order when ready</li>
                    <li>• Or cancel the quote if needed</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-center rounded-b-2xl">
                <button
                  onClick={() => setIsSendSuccessModalOpen(false)}
                  className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Quotations;

