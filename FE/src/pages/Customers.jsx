import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout/Layout';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  FileText, 
  Calendar,
  TrendingUp,
  UserPlus,
  RefreshCw,
  DollarSign,
  Car,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

const Customers = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'New',
    status: 'Active',
    testDrive: ''
  });

  // Sample customers data with new structure
  const customersData = [
    {
      customerId: 'C-2025-001',
      name: 'Le Minh Tuan',
      email: 'leminhtuan@email.com',
      phone: '0987654323',
      type: 'Returning',
      totalQuotes: 3,
      testDrive: '2025-03-15',
      status: 'Active'
    },
    {
      customerId: 'C-2025-002',
      name: 'Tran Hoa',
      email: 'tranhoa@email.com',
      phone: '0912345648',
      type: 'New',
      totalQuotes: 1,
      testDrive: '2025-03-14',
      status: 'Inactive'
    },
    {
      customerId: 'C-2025-003',
      name: 'Nguyen Van Minh',
      email: 'nguyenvanminh@email.com',
      phone: '0909876543',
      type: 'Returning',
      totalQuotes: 5,
      testDrive: '2025-03-20',
      status: 'Active'
    },
    {
      customerId: 'C-2025-004',
      name: 'Pham Thu Ha',
      email: 'phamthuha@email.com',
      phone: '0938765432',
      type: 'New',
      totalQuotes: 2,
      testDrive: '2025-03-18',
      status: 'Active'
    },
    {
      customerId: 'C-2025-005',
      name: 'Hoang Anh Tuan',
      email: 'hoanganhtuan@email.com',
      phone: '0976543210',
      type: 'New',
      totalQuotes: 1,
      testDrive: '2025-03-10',
      status: 'Inactive'
    }
  ];

  // KPI Data
  const kpiData = {
    totalCustomers: 1849,
    newLeads: 203,
    returningCustomers: 450,
    avgQuotationValue: 13950.02,
    testDrivesThisMonth: 87
  };

  // Helper functions
  const maskPhone = (phone) => {
    if (!phone || phone.length < 4) return phone;
    return phone.substring(0, phone.length - 2).replace(/\d/g, (d, i) => i > 3 ? '*' : d) + phone.substring(phone.length - 2);
  };

  const getTypeBadge = (type) => {
    const config = type === 'New' 
      ? { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'New' }
      : { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Returning' };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = status === 'Active'
      ? { dotColor: 'bg-green-500', label: 'Active' }
      : { dotColor: 'bg-red-500', label: 'Inactive' };
    
    return (
      <span className="inline-flex items-center">
        <span className={`w-2 h-2 rounded-full ${config.dotColor} mr-2`}></span>
        <span className="text-sm text-gray-700">{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend API
    console.log('Creating new customer:', newCustomer);
    // Reset form and close modal
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      type: 'New',
      status: 'Active',
      testDrive: ''
    });
    setShowCreateModal(false);
    // Show success message (you can add a toast notification here)
    alert('Customer created successfully!');
  };

  // Filter customers based on search and filters
  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
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
            <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track customer information</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Total Customers */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-600" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.totalCustomers.toLocaleString()}</div>
            <div className="text-xs text-gray-600 mt-1">Total Customers</div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12.5%</span>
            </div>
          </div>

          {/* New Leads This Month */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.newLeads.toLocaleString()}</div>
            <div className="text-xs text-gray-600 mt-1">New Leads This Month</div>
            <div className="text-xs text-blue-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+8.2%</span>
            </div>
          </div>

          {/* Returning Customers */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <div className="text-sm font-semibold text-gray-700">3.45%</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.returningCustomers.toLocaleString()}</div>
            <div className="text-xs text-gray-600 mt-1">Returning Customers</div>
            <div className="text-xs text-gray-500 mt-1">Within 3 months</div>
          </div>

          {/* Avg Quotation Value */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${kpiData.avgQuotationValue.toLocaleString()}</div>
            <div className="text-xs text-gray-600 mt-1">Avg. Quotation Value</div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5.1%</span>
            </div>
          </div>

          {/* Test Drives This Month */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Car className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-600">This Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpiData.testDrivesThisMonth}</div>
            <div className="text-xs text-gray-600 mt-1">Test Drives</div>
            <div className="text-xs text-blue-600 mt-1">32 scheduled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
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
                  placeholder="Search by name / phone / email"
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
                <option value="New">New</option>
                <option value="Returning">Returning</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Status: All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Quotes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Test Drive
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <tr 
                    key={index} 
                    onClick={() => navigate(`/customers/${customer.customerId}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{customer.customerId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{customer.name}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{maskPhone(customer.phone)}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{customer.email}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getTypeBadge(customer.type)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">{customer.totalQuotes}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{formatDate(customer.testDrive)}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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
                2
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                3
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Create Customer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                    <p className="text-sm text-gray-600">Fill in the customer information below</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newCustomer.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter customer full name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newCustomer.email}
                        onChange={handleInputChange}
                        required
                        placeholder="customer@email.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newCustomer.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="0987654321"
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">10 digits required</p>
                    </div>
                  </div>

                  {/* Customer Type and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={newCustomer.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="New">New</option>
                        <option value="Returning">Returning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={newCustomer.status}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Test Drive Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Drive Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="testDrive"
                        value={newCustomer.testDrive}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Schedule a test drive appointment</p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Customer Information</h4>
                        <p className="text-xs text-blue-700">
                          All required fields must be filled. Customer ID will be automatically generated upon creation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Customer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Customers;
