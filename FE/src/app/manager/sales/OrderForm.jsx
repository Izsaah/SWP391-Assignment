import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { FileText, Eye, Search, CheckCircle, Star, AlertTriangle, Send, Filter, TrendingUp, Users } from 'lucide-react';

const OrderForm = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [specialOrderFilter, setSpecialOrderFilter] = useState('all');
  const [selectedOrderForm, setSelectedOrderForm] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample order forms data from all staff
  const [orderForms, setOrderForms] = useState([
    {
      id: 'OF-2025-001',
      customer: 'Le Minh Tuan',
      customerId: 'C-001',
      vehicle: 'Model 3 Standard RWD',
      vin: '5YJ3E1EA0001',
      amount: 920000000,
      paymentMethod: 'Full Payment',
      status: 'Pending',
      createdDate: '2025-10-22',
      salesperson: 'Nguyen Van Hung',
      salespersonId: 'S-001',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
      discountCode: 'SPRING2025',
      discountAmount: 50000000
    },
    {
      id: 'OF-2025-002',
      customer: 'Tran Hoa',
      customerId: 'C-002',
      vehicle: 'Model Y Long Range',
      vin: 'Pending',
      amount: 1040000000,
      paymentMethod: 'Installment',
      status: 'Pending',
      createdDate: '2025-10-23',
      salesperson: 'Le Thi Mai',
      salespersonId: 'S-002',
      isSpecialOrder: true,
      quantity: 20,
      flaggedForCompany: true,
      discountCode: 'BULK-50',
      discountAmount: 300000000
    },
    {
      id: 'OF-2025-003',
      customer: 'Nguyen Van An',
      customerId: 'C-003',
      vehicle: 'Model 3 Performance AWD',
      vin: '5YJ3E3EA0003',
      amount: 1250000000,
      paymentMethod: 'Full Payment',
      status: 'Completed',
      createdDate: '2025-10-21',
      salesperson: 'Pham Thi Lan',
      salespersonId: 'S-003',
      isSpecialOrder: false,
      quantity: 1,
      flaggedForCompany: false,
      discountCode: 'VIP-DISCOUNT',
      discountAmount: 150000000
    },
    {
      id: 'OF-2025-004',
      customer: 'Hoang Thi Lan',
      customerId: 'C-004',
      vehicle: 'Model 3 Premium AWD',
      vin: 'Pending',
      amount: 1080000000,
      paymentMethod: 'Installment',
      status: 'Pending',
      createdDate: '2025-10-24',
      salesperson: 'Tran Van Minh',
      salespersonId: 'S-004',
      isSpecialOrder: true,
      quantity: 5,
      flaggedForCompany: false,
      discountCode: 'FIRST-CUSTOMER',
      discountAmount: 100000000
    },
  ]);

  // Get unique staff list
  const staffList = [...new Set(orderForms.map(of => of.salesperson))];

  // Filter order forms
  const filteredOrderForms = orderForms.filter(of => {
    if (statusFilter !== 'all' && of.status !== statusFilter) return false;
    if (staffFilter !== 'all' && of.salesperson !== staffFilter) return false;
    if (specialOrderFilter === 'special' && !of.isSpecialOrder) return false;
    if (specialOrderFilter === 'flagged' && !of.flaggedForCompany) return false;
    if (specialOrderFilter === 'normal' && of.isSpecialOrder) return false;
    if (searchQuery && !of.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !of.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Cancelled': { color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  const handleView = (orderForm) => {
    setSelectedOrderForm(orderForm);
    setIsViewModalOpen(true);
  };

  const handleApproveSpecialOrder = (orderFormId) => {
    if (window.confirm(`Approve special order ${orderFormId}? This will send the request to the company.`)) {
      console.log('Approving special order:', orderFormId);
      alert(`✅ Special order ${orderFormId} approved and sent to company for processing.`);
    }
  };

  // Statistics
  const stats = {
    total: orderForms.length,
    pending: orderForms.filter(of => of.status === 'Pending').length,
    completed: orderForms.filter(of => of.status === 'Completed').length,
    specialOrders: orderForms.filter(of => of.isSpecialOrder).length,
    flagged: orderForms.filter(of => of.flaggedForCompany).length,
    totalRevenue: orderForms.reduce((sum, of) => sum + of.amount, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="w-7 h-7" />
                <span>Order Forms Overview</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor all order forms from staff members
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.specialOrders}</p>
                <p className="text-sm text-gray-600">Special Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Staff Filter */}
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Staff</option>
              {staffList.map(staff => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
            </select>

            {/* Special Order Filter */}
            <select
              value={specialOrderFilter}
              onChange={(e) => setSpecialOrderFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="normal">Normal Orders</option>
              <option value="special">Special Orders</option>
              <option value="flagged">Flagged for Company</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Form ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredOrderForms.map((orderForm) => (
                  <tr key={orderForm.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{orderForm.id}</div>
                      <div className="text-xs text-gray-500">{formatDate(orderForm.createdDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{orderForm.salesperson}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orderForm.customer}</div>
                      <div className="text-xs text-gray-500">{orderForm.customerId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{orderForm.vehicle}</div>
                      {orderForm.isSpecialOrder && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-purple-600">Qty: {orderForm.quantity}</span>
                        </div>
                      )}
                      {orderForm.flaggedForCompany && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(orderForm.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(orderForm.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(orderForm)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {orderForm.isSpecialOrder && orderForm.flaggedForCompany && (
                          <button
                            onClick={() => handleApproveSpecialOrder(orderForm.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
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

        {/* View Modal */}
        {isViewModalOpen && selectedOrderForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Order Form Details</h2>
                    <p className="text-blue-100 text-sm mt-1">{selectedOrderForm.id}</p>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Created By (Staff)</label>
                    <p className="text-gray-900 mt-1">{selectedOrderForm.salesperson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Customer</label>
                    <p className="text-gray-900 mt-1">{selectedOrderForm.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Vehicle</label>
                    <p className="text-gray-900 mt-1">{selectedOrderForm.vehicle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Amount</label>
                    <p className="text-gray-900 mt-1 font-semibold">{formatCurrency(selectedOrderForm.amount)}</p>
                  </div>
                  {selectedOrderForm.isSpecialOrder && (
                    <div className="col-span-2 bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">Special Order</span>
                      </div>
                      <p className="text-sm text-gray-700">Quantity: {selectedOrderForm.quantity} units</p>
                      {selectedOrderForm.flaggedForCompany && (
                        <p className="text-sm text-red-600 mt-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Flagged for company review
                        </p>
                      )}
                    </div>
                  )}
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
