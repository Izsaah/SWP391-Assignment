import React from 'react';
import Layout from '../components/Layout/Layout';
import { Users, Search, Plus, Phone, Mail, MapPin } from 'lucide-react';

const Customers = () => {
  // Sample customers data
  const customersData = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      status: 'active',
      totalOrders: 2,
      totalSpent: 1700000000,
      lastContact: '2024-01-15'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0901234568',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      status: 'active',
      totalOrders: 1,
      totalSpent: 920000000,
      lastContact: '2024-01-14'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0901234569',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      status: 'inactive',
      totalOrders: 0,
      totalSpent: 0,
      lastContact: '2024-01-10'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Hoạt động' },
      'inactive': { color: 'bg-gray-100 text-gray-800', label: 'Không hoạt động' },
      'potential': { color: 'bg-blue-100 text-blue-800', label: 'Tiềm năng' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý khách hàng
              </h1>
              <p className="text-gray-600">
                Quản lý thông tin và theo dõi khách hàng
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Thêm khách hàng</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="potential">Tiềm năng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customersData.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    {getStatusBadge(customer.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{customer.totalOrders}</p>
                  <p className="text-xs text-gray-600">Đơn hàng</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">
                    {customer.totalSpent > 0 ? formatCurrency(customer.totalSpent) : '0 VNĐ'}
                  </p>
                  <p className="text-xs text-gray-600">Tổng chi tiêu</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Liên hệ cuối: {formatDate(customer.lastContact)}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Xem
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tổng quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{customersData.length}</p>
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {customersData.filter(c => c.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {customersData.reduce((sum, c) => sum + c.totalOrders, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(customersData.reduce((sum, c) => sum + c.totalSpent, 0))}
              </p>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
