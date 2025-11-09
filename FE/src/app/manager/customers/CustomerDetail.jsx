import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '../layout/Layout';
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Edit,
  BarChart3,
  CheckCircle,
  Clock
} from 'lucide-react';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReassignModal, setShowReassignModal] = useState(false);

  // Customer data - to be fetched from API
  const [customer, setCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      'Completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Partial': { color: 'bg-blue-100 text-blue-800', icon: '💰' },
      'Active': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Inactive': { color: 'bg-gray-100 text-gray-800', icon: '❌' }
    };
    const config = configs[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <button onClick={() => navigate('/manager/dashboard')} className="hover:text-blue-600">
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <button onClick={() => navigate('/manager/customers/list')} className="hover:text-blue-600">
            Customers
          </button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Customer Detail</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/manager/customers/list')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Customer List
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Customer Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                                <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>                                                                            
                <p className="text-xs text-gray-600">{customer.customerId}</p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Lifetime Value</div>
                  <div className="text-lg font-bold text-green-700">{formatCurrency(customer.lifetimeValue)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600">Total Orders</div>
                    <div className="text-sm font-bold text-blue-700">{customer.totalOrders}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600">Outstanding</div>
                    <div className="text-sm font-bold text-orange-700">
                      {customer.outstandingBalance > 0 ? formatCurrency(customer.outstandingBalance) : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center text-xs">
                  <Phone className="w-3 h-3 text-gray-400 mr-2" />
                  <span className="text-gray-700">{customer.phone}</span>
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

              {/* Assigned Staff */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Assigned Staff</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{customer.assignedStaff}</span>
                  </div>
                  <button
                    onClick={() => setShowReassignModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Reassign</span>
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(customer.status)}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium text-gray-900">{customer.joinedDate}</span>
                </div>
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
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Overview
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
                    Order History
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'payments'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Payments
                  </button>
                  <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === 'staff'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Assigned Staff
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Overview</h3>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-3">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Full Name</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Gender</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.gender}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Date of Birth</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.dateOfBirth}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Customer ID</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.customerId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-3">Address</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">City</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.address.city}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">District</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.address.district}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">Full Address</label>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customer.address.fullAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order History Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order History</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehicle</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Delivery Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderHistory.map((order) => (
                            <tr key={order.orderId} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm font-medium text-blue-600">{order.orderId}</td>
                              <td className="px-4 py-4 text-sm text-gray-900">{order.vehicle}</td>
                              <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</td>
                              <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{formatDate(order.orderDate)}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{formatDate(order.deliveryDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paymentHistory.map((payment) => (
                            <tr key={payment.paymentId} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{payment.paymentId}</td>
                              <td className="px-4 py-4 text-sm text-blue-600">{payment.orderId}</td>
                              <td className="px-4 py-4 text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{payment.paymentMethod}</td>
                              <td className="px-4 py-4">{getStatusBadge(payment.status)}</td>
                              <td className="px-4 py-4 text-sm text-gray-700">{formatDate(payment.paymentDate)}</td>
                              <td className="px-4 py-4 text-sm">
                                {payment.remainingBalance ? (
                                  <span className="font-semibold text-orange-600">{formatCurrency(payment.remainingBalance)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Assigned Staff Tab */}
                {activeTab === 'staff' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Assigned Staff Performance</h3>
                      <button
                        onClick={() => setShowReassignModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Reassign Customer</span>
                      </button>
                    </div>

                    {/* Staff Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{staffPerformance.name}</h4>
                          <p className="text-sm text-gray-600">Staff ID: {staffPerformance.staffId}</p>
                          <p className="text-xs text-gray-500">Joined: {staffPerformance.joinDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-xs text-gray-600 mb-1">Total Customers</div>
                        <div className="text-2xl font-bold text-gray-900">{staffPerformance.totalCustomers}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-xs text-gray-600 mb-1">Total Revenue</div>
                        <div className="text-lg font-bold text-green-600">{formatCurrency(staffPerformance.totalRevenue)}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-xs text-gray-600 mb-1">Total Orders</div>
                        <div className="text-2xl font-bold text-gray-900">{staffPerformance.totalOrders}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-xs text-gray-600 mb-1">Avg Order Value</div>
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(staffPerformance.avgOrderValue)}</div>
                      </div>
                    </div>

                    {/* Recent Performance */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-3">Recent Performance (Last 30 Days)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Recent Orders</div>
                          <div className="text-lg font-bold text-gray-900">{staffPerformance.recentOrders}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Recent Revenue</div>
                          <div className="text-lg font-bold text-green-600">{formatCurrency(staffPerformance.recentRevenue)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Reassign Customer</h2>
                  <p className="text-blue-100 text-sm mt-1">Assign {customer.name} to a different staff member</p>
                </div>
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Staff
                </label>
                <p className="text-gray-900">{customer.assignedStaff}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign to Staff
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="S-001">Nguyen Van Hung</option>
                  <option value="S-002">Le Thi Mai</option>
                  <option value="S-003">Pham Thi Lan</option>
                  <option value="S-004">Tran Van Minh</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Customer reassigned successfully!');
                  setShowReassignModal(false);
                }}
                className="px-6 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg font-medium"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomerDetail;
