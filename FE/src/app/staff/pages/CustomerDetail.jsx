import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '../layout/Layout';
import { viewOrdersByCustomerId } from '../services/orderService';
import { getCustomerById, getFeedbackByCustomerId, getTestDrivesByCustomerId } from '../services/customerDetailService';
import { fetchInventory } from '../services/inventoryService';
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Car,
  MessageSquare,
  StickyNote,
  Edit,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  ArrowLeft
} from 'lucide-react';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [testDrives, setTestDrives] = useState([]);
  const [loadingTestDrives, setLoadingTestDrives] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [vehicleMap, setVehicleMap] = useState(new Map()); // modelId -> modelName

  // Fetch vehicle models for name mapping
  useEffect(() => {
    const loadVehicleMap = async () => {
      try {
        const inventoryResult = await fetchInventory();
        const vehicleNameMap = new Map();
        if (inventoryResult.success && inventoryResult.data) {
          for (const model of inventoryResult.data) {
            const modelId = model.modelId || model.model_id;
            const modelName = model.modelName || model.name || `Model ${modelId}`;
            if (modelId) {
              const id = parseInt(modelId);
              if (!isNaN(id)) {
                vehicleNameMap.set(id, modelName);
              }
            }
          }
        }
        setVehicleMap(vehicleNameMap);
      } catch (err) {
        console.error('Error loading vehicle map:', err);
      }
    };
    loadVehicleMap();
  }, []);

  // Fetch customer data when component mounts or customerId changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) return;
      
      setLoadingCustomer(true);
      try {
        const result = await getCustomerById(parseInt(customerId));
        if (result.success && result.data) {
          const customerData = result.data;
          // Transform backend data to frontend format
          setCustomer({
            customerId: customerData.customerId || customerData.customer_id || customerData.id || `C-${customerId}`,
            name: customerData.name || 'N/A',
            email: customerData.email || 'N/A',
            phoneNumber: customerData.phoneNumber || customerData.phone_number || 'N/A',
            address: customerData.address || 'N/A'
          });
        } else {
          setCustomer(null);
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setCustomer(null);
      } finally {
        setLoadingCustomer(false);
      }
    };
    
    fetchCustomerData();
  }, [customerId]);

  // Fetch orders when component mounts or customerId changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) return;
      
      setLoadingOrders(true);
      try {
        const result = await viewOrdersByCustomerId(parseInt(customerId));
        if (result.success && result.data) {
          // Transform order data for display
          const transformedOrders = result.data.map(order => {
            // Get price from order detail or confirmation
            let price = 0;
            let vehicleName = 'Unknown Vehicle';
            
            // Try to get vehicle name from various sources
            const modelId = order.modelId || order.model_id;
            const serialId = order.detail?.serialId || order.detail?.serial_id;
            
            // Get vehicle name from vehicleMap
            if (modelId && vehicleMap.has(modelId)) {
              vehicleName = vehicleMap.get(modelId);
              if (serialId) {
                vehicleName = `${vehicleName} (Serial: ${serialId})`;
              }
            } else if (modelId) {
              vehicleName = `Model ID: ${modelId}`;
              if (serialId) {
                vehicleName = `${vehicleName} (Serial: ${serialId})`;
              }
            } else if (serialId) {
              vehicleName = `Serial: ${serialId}`;
            }
            
            if (order.detail) {
              price = order.detail.unitPrice || order.detail.unit_price || 0;
            }
            
            if (order.confirmation) {
              const confirmationPrice = order.confirmation.totalPrice || order.confirmation.total_price;
              if (confirmationPrice) {
                price = confirmationPrice;
              }
            }
            
            // Format date
            const orderDate = order.orderDate || order.order_date || '';
            const formattedDate = orderDate ? new Date(orderDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '';
            
            // Format price
            const formattedPrice = price ? new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0
            }).format(price) : 'N/A';
            
            return {
              id: `ORD-${order.orderId || order.order_id}`,
              orderId: order.orderId || order.order_id,
              vehicle: vehicleName,
              price: formattedPrice,
              status: order.status || 'Pending',
              createdDate: formattedDate,
              rawDate: orderDate
            };
          });
          
          setOrders(transformedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    if (vehicleMap.size > 0) {
      fetchOrders();
    }
  }, [customerId, vehicleMap]);

  // Fetch test drives
  useEffect(() => {
    const fetchTestDrives = async () => {
      if (!customerId) return;
      
      setLoadingTestDrives(true);
      try {
        const result = await getTestDrivesByCustomerId(parseInt(customerId));
        if (result.success && result.data) {
          setTestDrives(result.data || []);
        } else {
          setTestDrives([]);
        }
      } catch (error) {
        console.error('Error fetching test drives:', error);
        setTestDrives([]);
      } finally {
        setLoadingTestDrives(false);
      }
    };
    
    fetchTestDrives();
  }, [customerId]);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!customerId) return;
      
      setLoadingFeedbacks(true);
      try {
        const result = await getFeedbackByCustomerId(parseInt(customerId));
        if (result.success && result.data) {
          setFeedbacks(result.data || []);
        } else {
          setFeedbacks([]);
        }
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setFeedbacks([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    
    fetchFeedbacks();
  }, [customerId]);

  // Notes data (local state only, no backend API)
  const [notes, setNotes] = useState([]);

  const getStatusBadge = (status) => {
    const configs = {
      'Active': { dotColor: 'bg-green-500', label: 'Active' },
      'Pending': { dotColor: 'bg-blue-500', label: 'Pending' },
      'Prospect': { dotColor: 'bg-yellow-500', label: 'Prospect' },
      'Inactive': { dotColor: 'bg-red-500', label: 'Inactive' }
    };
    const config = configs[status] || configs['Active'];
    
    return (
      <span className="inline-flex items-center">
        <span className={`w-2 h-2 rounded-full ${config.dotColor} mr-2`}></span>
        <span className="text-sm text-gray-700">{config.label}</span>
      </span>
    );
  };

  const getQuoteStatusBadge = (status) => {
    const configs = {
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${configs[status] || configs['Draft']}`}>
        {status}
      </span>
    );
  };

  const getTestDriveStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Completed
        </span>
      );
    } else if (status === 'Scheduled') {
      return (
        <span className="inline-flex items-center text-blue-600 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          Scheduled
        </span>
      );
    }
    return status;
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: notes.length + 1,
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        note: newNote,
        createdBy: 'Current User' // TODO: Get from JWT token
      };
      setNotes([newNoteObj, ...notes]);
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  // Helper function to mask phone number
  const maskPhone = (phone) => {
    if (!phone || phone.length < 4) return phone || 'N/A';
    return phone.substring(0, phone.length - 2).replace(/\d/g, (d, i) => i > 3 ? '*' : d) + phone.substring(phone.length - 2);
  };

  // Show loading state
  if (loadingCustomer) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state if customer not found
  if (!customer) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600">Customer not found</p>
            <button
              onClick={() => navigate('/staff/customers')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Customer List
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-600">
          <button onClick={() => navigate('/staff')} className="hover:text-blue-600">
            Dashboard
          </button>
          <ChevronRight className="w-3 h-3 mx-1" />
          <button onClick={() => navigate('/staff/customers')} className="hover:text-blue-600">
            Customers
          </button>
          <ChevronRight className="w-3 h-3 mx-1" />
          <span className="text-gray-900 font-medium">Customer Detail</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/staff/customers')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Back to Customer List
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Customer Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
                <p className="text-xs text-gray-600">{customer.customerId}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center text-xs">
                  <Phone className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-gray-700">{maskPhone(customer.phoneNumber)}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Mail className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-gray-700 truncate">{customer.email}</span>
                </div>
                <div className="flex items-start text-xs">
                  <MapPin className="w-3 h-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-2">{customer.address}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge('Active')}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Test Drive</span>
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                  <Send className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm">
                  <StickyNote className="w-4 h-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Tabbed Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'info'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Customer Info
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'orders'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Order Form
                  </button>
                  <button
                    onClick={() => setActiveTab('testdrives')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'testdrives'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Car className="w-4 h-4 inline mr-2" />
                    Test Drives
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'feedback'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Feedback
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'notes'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <StickyNote className="w-4 h-4 inline mr-2" />
                    Internal Notes
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {/* Customer Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                        <Edit className="w-3 h-3" />
                        <span className="text-xs font-medium">Edit Info</span>
                      </button>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Full Name</label>
                          <p className="text-xs font-medium text-gray-900">{customer.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Customer ID</label>
                          <p className="text-xs font-medium text-gray-900">{customer.customerId}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Email</label>
                          <p className="text-xs font-medium text-gray-900">{customer.email}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Phone</label>
                          <p className="text-xs font-medium text-gray-900">{customer.phoneNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Address</h4>
                      <div className="grid grid-cols-1 gap-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Full Address</label>
                          <p className="text-xs font-medium text-gray-900">{customer.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Form Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                      <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Create New Order</span>
                      </button>
                    </div>

                    {loadingOrders ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No orders found for this customer.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Price</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{order.vehicle}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{order.price}</td>
                                <td className="px-4 py-4">{getQuoteStatusBadge(order.status)}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{order.createdDate}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center space-x-2">
                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                      <Eye className="w-4 h-4 text-blue-600" />
                                    </button>
                                    {(order.status === 'Pending' || order.status === 'pending') && (
                                      <button className="p-1.5 hover:bg-green-50 rounded-lg transition-colors">
                                        <Edit className="w-4 h-4 text-green-600" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Test Drives Tab */}
                {activeTab === 'testdrives' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Test Drive Schedule</h3>
                      <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Schedule Test Drive</span>
                      </button>
                    </div>

                    {loadingTestDrives ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading test drives...</p>
                      </div>
                    ) : testDrives.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No test drives scheduled for this customer.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">TestDrive ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {testDrives.map((drive, index) => (
                              <tr key={drive.id || index} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{drive.id || drive.testDriveId || 'N/A'}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{drive.vehicle || drive.vehicleName || 'N/A'}</td>
                                <td className="px-4 py-4 text-sm text-gray-700">{drive.date || drive.scheduleDate || 'N/A'}</td>
                                <td className="px-4 py-4">{getTestDriveStatusBadge(drive.status || 'Scheduled')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Feedback & Complaints</h3>
                    </div>

                    {loadingFeedbacks ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading feedback...</p>
                      </div>
                    ) : feedbacks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No feedback found for this customer.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Feedback</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {feedbacks.map((feedback, index) => {
                              const feedbackDate = feedback.date || feedback.feedbackDate || 'N/A';
                              const feedbackType = feedback.type || 'Feedback';
                              const feedbackContent = feedback.content || feedback.feedbackContent || 'N/A';
                              const feedbackRating = feedback.rating || 0;
                              const feedbackCategory = feedback.category || 'N/A';
                              
                              return (
                                <tr key={feedback.id || index} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 text-sm text-gray-700">{feedbackDate}</td>
                                  <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                      feedbackType === 'Feedback' 
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                      {feedbackType}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">{feedbackContent}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">({feedbackRating})</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">{feedbackCategory}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Internal Notes</h3>
                      <button
                        onClick={() => setShowNoteForm(!showNoteForm)}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add New Note</span>
                      </button>
                    </div>

                    {showNoteForm && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Enter your note here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={handleAddNote}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => {
                              setShowNoteForm(false);
                              setNewNote('');
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Note</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {notes.map((note) => (
                            <tr key={note.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-700">{note.date}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{note.note}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{note.createdBy}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                    <XCircle className="w-4 h-4 text-red-600" />
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDetail;

