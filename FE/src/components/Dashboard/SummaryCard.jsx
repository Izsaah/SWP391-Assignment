import React from 'react';
import { Eye } from 'lucide-react';

const SummaryCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  onViewDetails,
  trend,
  trendValue 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <button
          onClick={onViewDetails}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      {trend && (
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </span>
          <span className="text-xs text-gray-500">so với tháng trước</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
