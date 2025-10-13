import React, { useState } from 'react';
import { useAuth } from '../LoginPage/AuthContext';
import { Navigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import SummaryCards from '../components/Dashboard/SummaryCards';
import ChartsSection from '../components/Dashboard/ChartsSection';
import DataTablesSection from '../components/Dashboard/DataTablesSection';
import FeedbackCustomersSnapshot from '../components/Dashboard/FeedbackCustomersSnapshot';
import QuickActions from '../components/Dashboard/QuickActions';

export const DashBoard = () => {
  const { currentUser } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Sample data - in real app, this would come from API
  const dashboardData = {
    customers: '24',
    orders: '8',
    deliveries: '3',
    revenue: '2.5 tỷ'
  };

  const salesData = [
    { month: 'T1', sales: 1200000000 },
    { month: 'T2', sales: 1500000000 },
    { month: 'T3', sales: 1800000000 },
    { month: 'T4', sales: 2200000000 },
    { month: 'T5', sales: 1900000000 },
    { month: 'T6', sales: 2500000000 },
  ];

  const modelData = [
    { name: 'Sedan', value: 35, color: '#3B82F6' },
    { name: 'SUV', value: 30, color: '#10B981' },
    { name: 'Pickup', value: 20, color: '#F59E0B' },
    { name: 'Hatchback', value: 15, color: '#EF4444' },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleViewDetails = (type) => {
    console.log(`View details for: ${type}`);
    // Navigate to detailed view
  };

  const handleViewOrderDetail = (order) => {
    console.log('View order detail:', order);
    // Navigate to order detail page
  };

  const handleViewTestDriveDetail = (testDrive) => {
    console.log('View test drive detail:', testDrive);
    // Navigate to test drive detail page
  };

  const handleViewCustomerDetail = (customer) => {
    console.log('View customer detail:', customer);
    // Navigate to customer detail page
  };

  const handleViewFeedbackDetail = (feedback) => {
    console.log('View feedback detail:', feedback);
    // Navigate to feedback detail page
  };

  const handleCreateQuote = () => {
    console.log('Create new quote');
    // Navigate to create quote page
  };

  const handleCreateOrder = () => {
    console.log('Create new order');
    // Navigate to create order page
  };

  const handleViewInventory = () => {
    console.log('View inventory');
    // Navigate to inventory page
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader 
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
        />

        {/* Summary Cards */}
        <SummaryCards 
          data={dashboardData}
          onViewDetails={handleViewDetails}
        />

        {/* Charts Section */}
        <ChartsSection 
          salesData={salesData}
          modelData={modelData}
        />

        {/* Data Tables Section */}
        <DataTablesSection 
          onViewOrderDetail={handleViewOrderDetail}
          onViewTestDriveDetail={handleViewTestDriveDetail}
        />

        {/* Feedback & Customers Snapshot */}
        <FeedbackCustomersSnapshot 
          onViewCustomerDetail={handleViewCustomerDetail}
          onViewFeedbackDetail={handleViewFeedbackDetail}
        />

        {/* Quick Actions */}
        <QuickActions 
          onCreateQuote={handleCreateQuote}
          onCreateOrder={handleCreateOrder}
          viewInventory={handleViewInventory}
        />
      </div>
    </Layout>
  );
};
