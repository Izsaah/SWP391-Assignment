import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { FileText, Search, CheckCircle, X } from 'lucide-react';

const Quotations = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [salespersonFilter, setSalespersonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Quotations data - to be fetched from API
  const [quotations, setQuotations] = useState([]);

  const uniqueSalespersons = [...new Set(quotations.map(q => q.salesperson))];

  // Filter quotations
  const filteredQuotations = quotations.filter(q => {
    const matchesStatus = statusFilter === 'all' || q.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSalesperson = salespersonFilter === 'all' || q.salesperson === salespersonFilter;
    const matchesSearch = searchQuery === '' || q.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSalesperson && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Approved': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <span>{config.icon}</span>
        <span>{status}</span>
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle row click
  const handleRowClick = (quotation) => {
    setSelectedQuotation(quotation);
    setIsPanelOpen(true);
  };

  // Handle approve
  const handleApprove = (quotation) => {
    if (window.confirm(`Approve quotation ${quotation.id}?`)) {
      console.log('Approving quotation:', quotation.id);
      alert(`✅ Quotation ${quotation.id} approved successfully!`);
      setIsPanelOpen(false);
      // In real app: update quotation status
    }
  };

  // Handle reject
  const handleReject = (quotation) => {
    const reason = window.prompt(`Enter rejection reason for ${quotation.id}:`);
    if (reason) {
      console.log('Rejecting quotation:', quotation.id, 'Reason:', reason);
      alert(`❌ Quotation ${quotation.id} rejected.`);
      setIsPanelOpen(false);
      // In real app: update quotation status
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="w-7 h-7" />
                <span>Quotations Management</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve quotations from sales staff
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Quotation ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Salesperson Filter */}
            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Salespersons</option>
              {uniqueSalespersons.map(salesperson => (
                <option key={salesperson} value={salesperson}>{salesperson}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {/* Quotations Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salesperson
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr 
                      key={quotation.id} 
                      onClick={() => handleRowClick(quotation)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quotation.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quotation.salesperson}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quotation.customer}</div>
                        <div className="text-xs text-gray-500">{quotation.customerId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quotation.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(quotation.totalPrice)}
                        </div>
                        {quotation.discount > 0 && (
                          <div className="text-xs text-green-600">
                            Discount: {formatCurrency(quotation.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(quotation.createdDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quotation.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {/* Details Modal */}
        {isPanelOpen && selectedQuotation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 border-b border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Quotation Details</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedQuotation.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex justify-start">
                  {getStatusBadge(selectedQuotation.status)}
                </div>

                {/* Customer Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedQuotation.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer ID:</span>
                      <span className="text-sm font-mono text-gray-700">{selectedQuotation.customerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm text-gray-900">{selectedQuotation.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{selectedQuotation.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Vehicle Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedQuotation.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">VIN:</span>
                      <span className="text-sm font-mono text-gray-700">{selectedQuotation.vin}</span>
                    </div>
                  </div>
                </div>

                {/* Salesperson Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Sales Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Salesperson:</span>
                      <span className="text-sm font-semibold text-blue-900">{selectedQuotation.salesperson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contact:</span>
                      <span className="text-sm text-gray-900">{selectedQuotation.salespersonContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedQuotation.createdDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items and Pricing */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Items & Pricing</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {selectedQuotation.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-3">
                          <span className="text-sm text-gray-700">{item.name}</span>
                          <span className={`text-sm font-semibold ${item.amount < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-4 py-4 bg-blue-50 border-t-2 border-blue-200">
                        <span className="text-base font-bold text-gray-900">Total Price</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(selectedQuotation.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">Payment Method</h3>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-green-900 mb-2">{selectedQuotation.paymentMethod}</div>
                    {selectedQuotation.paymentMethod === 'Installment' && selectedQuotation.monthlyPayment && (
                      <div className="space-y-1 text-xs text-gray-700">
                        <div>Bank: {selectedQuotation.bankName}</div>
                        <div>Term: {selectedQuotation.loanTerm} months</div>
                        <div>Interest Rate: {selectedQuotation.interestRate}% p.a.</div>
                        <div className="font-semibold text-green-700">
                          Monthly Payment: {formatCurrency(selectedQuotation.monthlyPayment)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedQuotation.notes && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Notes</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedQuotation.notes}</p>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedQuotation.rejectionReason && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-red-700 uppercase">Rejection Reason</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-900">{selectedQuotation.rejectionReason}</p>
                    </div>
                  </div>
                )}

                </div>
              </div>

              {/* Modal Footer - Action Buttons */}
              {selectedQuotation.status === 'Pending' && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selectedQuotation)}
                      className="px-6 py-2 text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <X className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedQuotation)}
                      className="px-6 py-2 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Quotations;

