import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChartsSection = ({ salesData, modelData }) => {
  // Sample data for demonstration
  const defaultSalesData = [
    { month: 'T1', sales: 12000000 },
    { month: 'T2', sales: 15000000 },
    { month: 'T3', sales: 18000000 },
    { month: 'T4', sales: 22000000 },
    { month: 'T5', sales: 19000000 },
    { month: 'T6', sales: 25000000 },
  ];

  const defaultModelData = [
    { name: 'Sedan', value: 35, color: '#3B82F6' },
    { name: 'SUV', value: 30, color: '#10B981' },
    { name: 'Pickup', value: 20, color: '#F59E0B' },
    { name: 'Hatchback', value: 15, color: '#EF4444' },
  ];

  const chartData = salesData || defaultSalesData;
  const pieData = modelData || defaultModelData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart - Sales by Month */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Doanh số theo tháng
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Doanh số']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Sales by Model */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Doanh số theo dòng xe
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
