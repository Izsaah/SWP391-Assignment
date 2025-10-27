import React from 'react';
import Layout from '../layout/Layout';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';

const Reports = () => {
  // Sample report data
  const salesReportData = [
    { month: 'T1', sales: 1200000000, orders: 15 },
    { month: 'T2', sales: 1500000000, orders: 18 },
    { month: 'T3', sales: 1800000000, orders: 22 },
    { month: 'T4', sales: 2200000000, orders: 28 },
    { month: 'T5', sales: 1900000000, orders: 24 },
    { month: 'T6', sales: 2500000000, orders: 32 },
  ];

  const topModelsData = [
    { model: 'Toyota Camry', sales: 35, revenue: 29750000000 },
    { model: 'Honda CR-V', sales: 28, revenue: 25760000000 },
    { model: 'Ford Ranger', sales: 22, revenue: 17160000000 },
    { model: 'Mazda CX-5', sales: 18, revenue: 16020000000 },
    { model: 'Hyundai Tucson', sales: 15, revenue: 11250000000 },
  ];

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
                Báo cáo & Thống kê
              </h1>
              <p className="text-gray-600">
                Phân tích hiệu suất kinh doanh và xu hướng bán hàng
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Khoảng thời gian:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="6months">6 tháng gần đây</option>
              <option value="3months">3 tháng gần đây</option>
              <option value="1month">1 tháng gần đây</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue="2024-01-01"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue="2024-06-30"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">2.5 tỷ</p>
                <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                <p className="text-xs text-green-600">+15% so với tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">32</p>
                <p className="text-sm text-gray-600">Đơn hàng tháng này</p>
                <p className="text-xs text-green-600">+8% so với tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">78.1M</p>
                <p className="text-sm text-gray-600">Giá trị đơn hàng TB</p>
                <p className="text-xs text-red-600">-3% so với tháng trước</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-600">Khách hàng mới</p>
                <p className="text-xs text-green-600">+12% so với tháng trước</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Xu hướng doanh số theo tháng
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                Doanh thu
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
                Số đơn hàng
              </button>
            </div>
          </div>
          
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Biểu đồ doanh số sẽ được hiển thị ở đây</p>
              <p className="text-sm text-gray-400 mt-2">
                Sử dụng thư viện chart để hiển thị dữ liệu: {JSON.stringify(salesReportData)}
              </p>
            </div>
          </div>
        </div>

        {/* Top Models Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top 5 dòng xe bán chạy
          </h3>
          
          <div className="space-y-4">
            {topModelsData.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{model.model}</h4>
                    <p className="text-sm text-gray-600">{model.sales} xe đã bán</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(model.revenue)}</p>
                  <p className="text-sm text-gray-600">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance by Salesperson */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Hiệu suất theo nhân viên
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'Nguyễn Thị X', sales: 8, revenue: 6800000000 },
                { name: 'Lê Văn Y', sales: 6, revenue: 5200000000 },
                { name: 'Phạm Thị Z', sales: 5, revenue: 4500000000 },
                { name: 'Hoàng Văn W', sales: 4, revenue: 3600000000 },
              ].map((person, index) => (
                <div key={person.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{person.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-600">{person.sales} đơn hàng</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(person.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Tỷ lệ chuyển đổi
            </h3>
            
            <div className="space-y-4">
              {[
                { stage: 'Lead', count: 150, percentage: 100 },
                { stage: 'Quan tâm', count: 120, percentage: 80 },
                { stage: 'Thử xe', count: 60, percentage: 40 },
                { stage: 'Báo giá', count: 45, percentage: 30 },
                { stage: 'Mua xe', count: 32, percentage: 21 },
              ].map((stage, index) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{stage.count}</span>
                    <span className="text-sm font-bold text-blue-600">{stage.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
