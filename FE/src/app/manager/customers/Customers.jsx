import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../layout/Layout';
import { 
  Users, 
  Search, 
  ChevronRight,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Filter
} from 'lucide-react';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  // Customers data - to be fetched from API
  const [customersData, setCustomersData] = useState([]);

  // Get unique staff list
  const staffList = [...new Set(customersData.map(c => c.assignedStaff))];

  // Calculate statistics
  const stats = {
    totalCustomers: customersData.length,
    totalRevenue: customersData.reduce((sum, c) => sum + c.lifetimeValue, 0),
    outstandingAmount: customersData.reduce((sum, c) => sum + c.outstandingBalance, 0),
    totalOrders: customersData.reduce((sum, c) => sum + c.totalOrders, 0)
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter customers
  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    const matchesStaff = staffFilter === 'all' || customer.assignedStaff === staffFilter;

    return matchesSearch && matchesType && matchesStaff;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Customers</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-sm text-gray-600 mt-1">Business-level customer overview and KPIs</p>
          </div>
        </div>

                 {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <div className="flex items-center">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <Users className="w-6 h-6 text-blue-600" />
               </div>
               <div className="ml-4">
                 <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                 <p className="text-sm text-gray-600">Total Customers</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.outstandingAmount)}</p>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">All Customers</h3>
              <span className="text-xs text-gray-500">({filteredCustomers.length} results)</span>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>View Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name / ID / phone / email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Type: All</option>
                <option value="VIP">VIP</option>
                <option value="Returning">Returning</option>
                <option value="New">New</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Staff: All</option>
                {staffList.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Assigned Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Lifetime Value
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                     Total Orders
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                     Outstanding Balance
                   </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                                 {filteredCustomers.map((customer, index) => (
                   <tr 
                     key={index} 
                     onClick={() => navigate(`/manager/customers/${customer.customerId}`)}
                     className="hover:bg-blue-50 transition-colors cursor-pointer"
                   >
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                           <Users className="w-4 h-4 text-gray-600" />
                         </div>
                         <span className="text-sm font-medium text-gray-900">{customer.customerId}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div>
                         <span className="text-sm font-medium text-blue-600">{customer.name}</span>
                         <div className="text-xs text-gray-500">{customer.email}</div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm text-gray-900">{customer.assignedStaff}</span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-semibold text-green-600">
                         {formatCurrency(customer.lifetimeValue)}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className="text-sm font-medium text-gray-900">{customer.totalOrders}</span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       {customer.outstandingBalance > 0 ? (
                         <span className="text-sm font-semibold text-orange-600">
                           {formatCurrency(customer.outstandingBalance)}
                         </span>
                       ) : (
                         <span className="text-sm text-gray-500">-</span>        
                       )}
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredCustomers.length}</span> of <span className="font-medium">{customersData.length}</span> customers
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
