import React from 'react';
import Layout from '../components/Layout/Layout';
import { Package, Search, Filter, Plus } from 'lucide-react';

const Inventory = () => {
  // Sample inventory data
  const inventoryData = [
    {
      id: 'VH001',
      model: 'Toyota Camry 2024',
      variant: '2.5L Hybrid',
      color: 'Trắng',
      price: 850000000,
      status: 'available',
      location: 'Kho A'
    },
    {
      id: 'VH002',
      model: 'Honda CR-V 2024',
      variant: '1.5L Turbo',
      color: 'Đen',
      price: 920000000,
      status: 'available',
      location: 'Kho B'
    },
    {
      id: 'VH003',
      model: 'Ford Ranger 2024',
      variant: '2.0L Bi-Turbo',
      color: 'Xám',
      price: 780000000,
      status: 'reserved',
      location: 'Kho A'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800', label: 'Có sẵn' },
      'reserved': { color: 'bg-yellow-100 text-yellow-800', label: 'Đã đặt' },
      'sold': { color: 'bg-red-100 text-red-800', label: 'Đã bán' },
      'maintenance': { color: 'bg-blue-100 text-blue-800', label: 'Bảo dưỡng' }
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý kho xe
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi tình trạng xe trong kho
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Thêm xe mới</span>
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
                  placeholder="Tìm kiếm theo model, mã xe..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tất cả trạng thái</option>
                <option value="available">Có sẵn</option>
                <option value="reserved">Đã đặt</option>
                <option value="sold">Đã bán</option>
                <option value="maintenance">Bảo dưỡng</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách xe trong kho ({inventoryData.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phiên bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.variant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.color}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(vehicle.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehicle.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Xem
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Sửa
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;
