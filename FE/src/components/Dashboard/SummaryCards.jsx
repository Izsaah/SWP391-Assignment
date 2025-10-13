import React from 'react';
import { Users, ShoppingCart, Truck, DollarSign } from 'lucide-react';
import SummaryCard from './SummaryCard';

const SummaryCards = ({ data, onViewDetails }) => {
  const cards = [
    {
      id: 'customers',
      title: 'Khách hàng đang phụ trách',
      value: data?.customers || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up',
      trendValue: '+12%'
    },
    {
      id: 'orders',
      title: 'Đơn hàng đang mở',
      value: data?.orders || '0',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up',
      trendValue: '+8%'
    },
    {
      id: 'deliveries',
      title: 'Xe đang chờ giao',
      value: data?.deliveries || '0',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'down',
      trendValue: '-3%'
    },
    {
      id: 'revenue',
      title: 'Doanh thu tháng này',
      value: data?.revenue || '0 VNĐ',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: 'up',
      trendValue: '+15%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <SummaryCard
          key={card.id}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          trend={card.trend}
          trendValue={card.trendValue}
          onViewDetails={() => onViewDetails(card.id)}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
