import React from 'react';
import DataTable from './DataTable';

const DataTablesSection = ({ recentOrders, upcomingTestDrives, onViewOrderDetail, onViewTestDriveDetail }) => {
  // Sample data for demonstration
  const defaultRecentOrders = [
    {
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      model: 'Toyota Camry 2024',
      status: 'processing',
      amount: 850000000,
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customer: 'Trần Thị B',
      model: 'Honda CR-V 2024',
      status: 'pending',
      amount: 920000000,
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customer: 'Lê Văn C',
      model: 'Ford Ranger 2024',
      status: 'completed',
      amount: 780000000,
      date: '2024-01-13'
    },
    {
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      model: 'Mazda CX-5 2024',
      status: 'processing',
      amount: 890000000,
      date: '2024-01-12'
    },
    {
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      model: 'Hyundai Tucson 2024',
      status: 'pending',
      amount: 750000000,
      date: '2024-01-11'
    }
  ];

  const defaultUpcomingTestDrives = [
    {
      customer: 'Nguyễn Văn F',
      model: 'Toyota Vios 2024',
      date: '2024-01-20',
      status: 'scheduled'
    },
    {
      customer: 'Trần Thị G',
      model: 'Honda City 2024',
      date: '2024-01-21',
      status: 'confirmed'
    },
    {
      customer: 'Lê Văn H',
      model: 'Ford Everest 2024',
      date: '2024-01-22',
      status: 'scheduled'
    },
    {
      customer: 'Phạm Thị I',
      model: 'Mazda 3 2024',
      date: '2024-01-23',
      status: 'confirmed'
    }
  ];

  const orderColumns = [
    { key: 'id', header: 'Mã đơn hàng' },
    { key: 'customer', header: 'Khách hàng' },
    { key: 'model', header: 'Dòng xe' },
    { key: 'status', header: 'Trạng thái' },
    { key: 'amount', header: 'Giá trị' },
    { key: 'date', header: 'Ngày tạo' }
  ];

  const testDriveColumns = [
    { key: 'customer', header: 'Khách hàng' },
    { key: 'model', header: 'Dòng xe' },
    { key: 'date', header: 'Ngày hẹn' },
    { key: 'status', header: 'Trạng thái' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Recent Orders */}
      <DataTable
        title="Đơn hàng gần đây"
        data={recentOrders || defaultRecentOrders}
        columns={orderColumns}
        onViewDetail={onViewOrderDetail}
        emptyMessage="Chưa có đơn hàng nào"
      />

      {/* Upcoming Test Drives */}
      <DataTable
        title="Lịch lái thử sắp tới (14 ngày)"
        data={upcomingTestDrives || defaultUpcomingTestDrives}
        columns={testDriveColumns}
        onViewDetail={onViewTestDriveDetail}
        emptyMessage="Không có lịch lái thử nào"
      />
    </div>
  );
};

export default DataTablesSection;
