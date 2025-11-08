import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '../layout/Layout';
import { viewOrdersByCustomerId } from '../services/orderService';
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

  // Mock customer data - in real app, fetch from API using customerId from URL
  // Example: useEffect(() => { fetchCustomer(customerId); }, [customerId]);
  console.log('Customer ID from URL:', customerId);
  
  const customer = {
    customerId: 'C-2025-001',
    name: 'Le Minh Tuan',
    email: 'leminhtuan@email.com',
    phone: '0987654323',
    maskedPhone: '0987****23',
    gender: 'Male',
    dateOfBirth: '1990-05-15',
    type: 'Returning',
    status: 'Active',
    salesperson: 'Nguyen Van Hung',
    createdBy: 'Nguyen Van Hung',
    joinedDate: 'September 10, 2025',
    loyaltyTier: 'Silver Tier',
    lastContact: 'October 25, 2025',
    lastTestDrive: 'October 20, 2025',
    lastQuote: 'October 25, 2025',
    address: {
      city: 'Ho Chi Minh City',
      district: 'District 1',
      fullAddress: '123 Nguyen Hue Street, District 1, Ho Chi Minh City'
    }
  };

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
            
            // Build vehicle name
            if (modelId) {
              vehicleName = `Model ID: ${modelId}`;
            }
            
            if (order.detail) {
              price = order.detail.unitPrice || order.detail.unit_price || 0;
              // Add serial ID info if available
              if (serialId) {
                vehicleName = modelId ? `${vehicleName} (Serial: ${serialId})` : `Serial: ${serialId}`;
              }
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
    
    fetchOrders();
  }, [customerId]);

  // Mock test drives data
  const testDrives = [
    {
      id: 'TD-2025-004',
      vehicle: 'Model 3 RWD',
      date: 'October 20, 2025',
      status: 'Completed',
      salesperson: 'Nguyen Hung'
    },
    {
      id: 'TD-2025-006',
      vehicle: 'VF e34',
      date: 'October 28, 2025',
      status: 'Scheduled',
      salesperson: 'Tran Hoa'
    }
  ];

  // Mock feedback data
  const feedbacks = [
    {
      date: '10/21/2025',
      type: 'Feedback',
      content: 'Car runs smoothly, enthusiastic staff',
      rating: 5,
      category: 'Service Quality',
      createdBy: 'Nguyen Hung'
    },
    {
      date: '10/24/2025',
      type: 'Complaint',
      content: 'Car delivery 3 days late',
      rating: 2,
      category: 'Delivery',
      createdBy: 'Nguyen Hung'
    }
  ];

  // Mock notes data
  const [notes, setNotes] = useState([
    {
      id: 1,
      date: '10/25/2025',
      note: 'Call back customer on 10/30',
      createdBy: 'Nguyen Hung'
    },
    {
      id: 2,
      date: '10/20/2025',
      note: 'Considering Model Y',
      createdBy: 'Nguyen Hung'
    }
  ]);

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
        createdBy: 'Current User'
      };
      setNotes([newNoteObj, ...notes]);
      setNewNote('');
      setShowNoteForm(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-3">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-600">
          <button onClick={() => navigate('/customers/list')} className="hover:text-blue-600">
            Dashboard
          </button>
          <ChevronRight className="w-3 h-3 mx-1" />
          <button onClick={() => navigate('/customers/list')} className="hover:text-blue-600">
            Customers
          </button>
          <ChevronRight className="w-3 h-3 mx-1" />
          <span className="text-gray-900 font-medium">Customer Detail</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/customers/list')}
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
                <p className="text-xs text-gray-600 mt-1">Salesperson: {customer.salesperson}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center text-xs">
                  <Phone className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-gray-700">{customer.maskedPhone}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Mail className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-gray-700 truncate">{customer.email}</span>
                </div>
                <div className="flex items-start text-xs">
                  <MapPin className="w-3 h-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-2">{customer.address.fullAddress}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{customer.type}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(customer.status)}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium text-gray-900 text-right">{customer.joinedDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Loyalty:</span>
                  <span className="font-medium text-yellow-600">{customer.loyaltyTier}</span>
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
                    onClick={() => setActiveTab('quotations')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'quotations'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Quotations
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
                          <label className="text-xs text-gray-600">Gender</label>
                          <p className="text-xs font-medium text-gray-900">{customer.gender}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Date of Birth</label>
                          <p className="text-xs font-medium text-gray-900">{customer.dateOfBirth}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Customer ID</label>
                          <p className="text-xs font-medium text-gray-900">{customer.customerId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Activity Summary</h4>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Last Contact</label>
                          <p className="text-xs font-medium text-gray-900">{customer.lastContact}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Last Test Drive</label>
                          <p className="text-xs font-medium text-gray-900">{customer.lastTestDrive}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Last Quote</label>
                          <p className="text-xs font-medium text-gray-900">{customer.lastQuote}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Address</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <label className="text-xs text-gray-600">City</label>
                          <p className="text-xs font-medium text-gray-900">{customer.address.city}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">District</label>
                          <p className="text-xs font-medium text-gray-900">{customer.address.district}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">Full Address</label>
                          <p className="text-xs font-medium text-gray-900">{customer.address.fullAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quotations Tab */}
                {activeTab === 'quotations' && (
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
                          {testDrives.map((drive) => (
                            <tr key={drive.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{drive.id}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{drive.vehicle}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{drive.date}</td>
                              <td className="px-4 py-4">{getTestDriveStatusBadge(drive.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Feedback & Complaints</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Feedback</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Created By</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {feedbacks.map((feedback, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-700">{feedback.date}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                  feedback.type === 'Feedback' 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                  {feedback.type}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">{feedback.content}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">({feedback.rating})</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">{feedback.category}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{feedback.createdBy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

