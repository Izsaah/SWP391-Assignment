import React, { useState } from 'react';
import Layout from '../layout/Layout';
import {
  TrendingUp,
  Search,
  ChevronRight,
  Calendar,
  Eye,
  X,
  Users
} from 'lucide-react';

const SalesPerformance = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [topFilter, setTopFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  // Sample sales performance data
  const salesData = [
    {
      staffId: 'S-001',
      staffName: 'Nguyen Van Hung',
      totalOrders: 25,
      totalRevenue: 6300000000,
      orders: [
        { orderId: 'ORD-001', customer: 'Le Thi A', date: '2025-11-15', totalAmount: 980000000 },
        { orderId: 'ORD-002', customer: 'Tran Van B', date: '2025-11-18', totalAmount: 730000000 },
        { orderId: 'ORD-003', customer: 'Pham Thi C', date: '2025-11-20', totalAmount: 620000000 },
        { orderId: 'ORD-004', customer: 'Hoang Van D', date: '2025-11-22', totalAmount: 890000000 },
        { orderId: 'ORD-005', customer: 'Nguyen Thi E', date: '2025-11-25', totalAmount: 450000000 }
      ]
    },
    {
      staffId: 'S-002',
      staffName: 'Tran Thi Hoa',
      totalOrders: 20,
      totalRevenue: 4900000000,
      orders: [
        { orderId: 'ORD-006', customer: 'Vo Van F', date: '2025-11-10', totalAmount: 680000000 },
        { orderId: 'ORD-007', customer: 'Dang Thi G', date: '2025-11-12', totalAmount: 540000000 },
        { orderId: 'ORD-008', customer: 'Bui Van H', date: '2025-11-14', totalAmount: 720000000 },
        { orderId: 'ORD-009', customer: 'Ly Thi I', date: '2025-11-16', totalAmount: 590000000 },
        { orderId: 'ORD-010', customer: 'Do Van J', date: '2025-11-19', totalAmount: 660000000 }
      ]
    },
    {
      staffId: 'S-003',
      staffName: 'Le Van Minh',
      totalOrders: 18,
      totalRevenue: 3800000000,
      orders: [
        { orderId: 'ORD-011', customer: 'Ngo Thi K', date: '2025-11-08', totalAmount: 550000000 },
        { orderId: 'ORD-012', customer: 'Duong Van L', date: '2025-11-11', totalAmount: 680000000 },
        { orderId: 'ORD-013', customer: 'Truong Thi M', date: '2025-11-13', totalAmount: 470000000 },
        { orderId: 'ORD-014', customer: 'Vu Van N', date: '2025-11-17', totalAmount: 590000000 },
        { orderId: 'ORD-015', customer: 'Dao Thi O', date: '2025-11-21', totalAmount: 510000000 }
      ]
    },
    {
      staffId: 'S-004',
      staffName: 'Pham Thu Ha',
      totalOrders: 15,
      totalRevenue: 3200000000,
      orders: [
        { orderId: 'ORD-016', customer: 'Lai Van P', date: '2025-11-09', totalAmount: 620000000 },
        { orderId: 'ORD-017', customer: 'Luong Thi Q', date: '2025-11-12', totalAmount: 480000000 },
        { orderId: 'ORD-018', customer: 'Le Van R', date: '2025-11-15', totalAmount: 560000000 },
        { orderId: 'ORD-019', customer: 'Phan Thi S', date: '2025-11-18', totalAmount: 590000000 },
        { orderId: 'ORD-020', customer: 'Cao Van T', date: '2025-11-23', totalAmount: 510000000 }
      ]
    },
    {
      staffId: 'S-005',
      staffName: 'Hoang Anh Tuan',
      totalOrders: 12,
      totalRevenue: 2800000000,
      orders: [
        { orderId: 'ORD-021', customer: 'Nguyen Van U', date: '2025-11-07', totalAmount: 590000000 },
        { orderId: 'ORD-022', customer: 'Tran Thi V', date: '2025-11-10', totalAmount: 510000000 },
        { orderId: 'ORD-023', customer: 'Le Van W', date: '2025-11-14', totalAmount: 620000000 },
        { orderId: 'ORD-024', customer: 'Pham Thi X', date: '2025-11-19', totalAmount: 540000000 },
        { orderId: 'ORD-025', customer: 'Hoang Van Y', date: '2025-11-24', totalAmount: 480000000 }
      ]
    },
    {
      staffId: 'S-006',
      staffName: 'Nguyen Thi Lan',
      totalOrders: 10,
      totalRevenue: 2200000000,
      orders: [
        { orderId: 'ORD-026', customer: 'Vo Thi Z', date: '2025-11-06', totalAmount: 550000000 },
        { orderId: 'ORD-027', customer: 'Dang Van AA', date: '2025-11-11', totalAmount: 470000000 },
        { orderId: 'ORD-028', customer: 'Bui Thi BB', date: '2025-11-16', totalAmount: 590000000 },
        { orderId: 'ORD-029', customer: 'Ly Van CC', date: '2025-11-20', totalAmount: 510000000 },
        { orderId: 'ORD-030', customer: 'Do Thi DD', date: '2025-11-22', totalAmount: 480000000 }
      ]
    },
    {
      staffId: 'S-007',
      staffName: 'Tran Van Duy',
      totalOrders: 8,
      totalRevenue: 1800000000,
      orders: [
        { orderId: 'ORD-031', customer: 'Ngo Van EE', date: '2025-11-05', totalAmount: 620000000 },
        { orderId: 'ORD-032', customer: 'Duong Thi FF', date: '2025-11-09', totalAmount: 540000000 },
        { orderId: 'ORD-033', customer: 'Truong Van GG', date: '2025-11-13', totalAmount: 480000000 },
        { orderId: 'ORD-034', customer: 'Vu Thi HH', date: '2025-11-17', totalAmount: 560000000 },
        { orderId: 'ORD-035', customer: 'Dao Van II', date: '2025-11-21', totalAmount: 500000000 }
      ]
    },
    {
      staffId: 'S-008',
      staffName: 'Le Thi Mai',
      totalOrders: 6,
      totalRevenue: 1400000000,
      orders: [
        { orderId: 'ORD-036', customer: 'Lai Thi JJ', date: '2025-11-04', totalAmount: 590000000 },
        { orderId: 'ORD-037', customer: 'Luong Van KK', date: '2025-11-08', totalAmount: 510000000 },
        { orderId: 'ORD-038', customer: 'Le Thi LL', date: '2025-11-12', totalAmount: 620000000 },
        { orderId: 'ORD-039', customer: 'Phan Van MM', date: '2025-11-16', totalAmount: 480000000 },
        { orderId: 'ORD-040', customer: 'Cao Thi NN', date: '2025-11-20', totalAmount: 540000000 }
      ]
    }
  ];

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '–';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter sales data
  const filteredSalesData = salesData.filter(staff => {
    // Date range filter would be applied here in real app
    // For now, just filter by top
    return true;
  }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, topFilter === 'all' ? salesData.length : parseInt(topFilter));

  // Handle search
  const handleSearch = () => {
    // In real app, would make API call with filters
    console.log('Searching with filters:', { dateFrom, dateTo, topFilter });
  };

  // Handle view details
  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setIsDetailPanelOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="hover:text-blue-600 cursor-pointer">Reports</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Sales Performance</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Performance Report</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of sales performance by staff member</p>
          </div>
        </div>

        {/* Filter Row */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="From"
                  />
                </div>
                <span className="text-gray-500">–</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Top Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Top:</label>
              <select
                value={topFilter}
                onChange={(e) => setTopFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="ml-auto">
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Sales Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSalesData.map((staff) => (
                  <tr key={staff.staffId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{staff.staffName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{staff.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(staff.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(staff)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Side Panel */}
      {isDetailPanelOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedStaff.staffName} - Sales Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Total Orders: {selectedStaff.totalOrders}</p>
                </div>
                <button
                  onClick={() => setIsDetailPanelOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Total Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedStaff.orders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{order.orderId}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{order.customer}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{formatDate(order.date)}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Total Revenue:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(selectedStaff.totalRevenue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SalesPerformance;
