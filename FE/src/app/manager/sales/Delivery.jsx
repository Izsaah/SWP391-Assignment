import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { Truck, CheckCircle, Clock, Package, Users, Search, TrendingUp, BarChart3 } from 'lucide-react';

const Delivery = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delivery data - to be fetched from API
  const [deliveries, setDeliveries] = useState([]);

  const staffList = [...new Set(deliveries.map(d => d.salesperson))];

  const filteredDeliveries = deliveries.filter(d => {
    if (statusFilter !== 'all' && d.status.toLowerCase().replace(/\s+/g, '') !== statusFilter.toLowerCase().replace(/\s+/g, '')) return false;
    if (staffFilter !== 'all' && d.salesperson !== staffFilter) return false;
    if (searchQuery && !d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !d.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Delivered': { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Delivered' },
      'Not Delivered': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Not Delivered' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: status };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailsModalOpen(true);
  };

  // Statistics
  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
    notDelivered: deliveries.filter(d => d.status === 'Not Delivered').length,
    deliveryRate: deliveries.length > 0 ? Math.round((deliveries.filter(d => d.status === 'Delivered').length / deliveries.length) * 100) : 0
  };

  // Staff delivery stats
  const staffStats = staffList.map(staff => {
    const staffDeliveries = deliveries.filter(d => d.salesperson === staff);
    return {
      staff,
      total: staffDeliveries.length,
      delivered: staffDeliveries.filter(d => d.status === 'Delivered').length,
      notDelivered: staffDeliveries.filter(d => d.status === 'Not Delivered').length
    };
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <Truck className="w-7 h-7" />
                <span>Delivery Overview</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor all deliveries from all staff members
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Deliveries</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.notDelivered}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
                <p className="text-sm text-gray-600">Delivery Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Staff Delivery Performance</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.staff}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stat.total}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">{stat.delivered}</td>
                    <td className="px-4 py-3 text-sm text-yellow-600 font-semibold">{stat.notDelivered}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                      {stat.total > 0 ? Math.round((stat.delivered / stat.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="notdelivered">Not Delivered</option>
            </select>

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

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setStaffFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr 
                    key={delivery.orderId}
                    onClick={() => handleViewDetails(delivery)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                      <div className="text-xs text-gray-500">{delivery.orderFormId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{delivery.salesperson}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{delivery.vehicle}</div>
                      <div className="text-xs text-gray-500">VIN: {delivery.vin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(delivery.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(delivery.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(delivery.estimatedDelivery)}
                      </div>
                      {delivery.actualDeliveryDate && (
                        <div className="text-xs text-green-600">
                          Actual: {formatDate(delivery.actualDeliveryDate)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {isDetailsModalOpen && selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Delivery Details</h2>
                    <p className="text-green-100 text-sm mt-1">
                      Order {selectedDelivery.orderId} • {selectedDelivery.orderFormId}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Staff Member</label>
                    <p className="text-gray-900 mt-1">{selectedDelivery.salesperson}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Customer</label>
                    <p className="text-gray-900 mt-1">{selectedDelivery.customer}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Vehicle</label>
                    <p className="text-gray-900 mt-1">{selectedDelivery.vehicle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Amount</label>
                    <p className="text-gray-900 mt-1 font-semibold">{formatCurrency(selectedDelivery.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedDelivery.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Warehouse</label>
                    <p className="text-gray-900 mt-1">{selectedDelivery.warehouse}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Driver</label>
                    <p className="text-gray-900 mt-1">{selectedDelivery.driver}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Estimated Delivery</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedDelivery.estimatedDelivery)}</p>
                  </div>
                  {selectedDelivery.actualDeliveryDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Actual Delivery</label>
                      <p className="text-green-600 mt-1 font-semibold">{formatDate(selectedDelivery.actualDeliveryDate)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Notes</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedDelivery.deliveryNotes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Delivery;
