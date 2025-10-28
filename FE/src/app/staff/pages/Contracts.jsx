import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { Eye, CreditCard, Package, Download, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router';

const Contracts = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Sample contracts data
  const contracts = [
    {
      id: 'C-2025-001',
      quoteId: 'Q-2025-001',
      customer: 'Le Minh Tuan',
      customerId: 'C-001',
      vehicle: 'Model 3 Standard RWD',
      vin: '5YJ3E1EA0001',
      finalPrice: 920000000,
      paymentMethod: 'Cash',
      deliveryETA: '2025-10-25',
      status: 'Active',
      date: '2025-10-23',
      notes: 'Customer confirmed delivery date October 25.',
      createdBy: 'Nguyen Van Hung',
    },
    {
      id: 'C-2025-002',
      quoteId: 'Q-2025-002',
      customer: 'Nguyen Hoa',
      customerId: 'C-002',
      vehicle: 'Model Y Long Range',
      vin: '5YJ3E2EA0002',
      finalPrice: 1200000000,
      paymentMethod: 'Installment',
      deliveryETA: '2025-10-22',
      status: 'Completed',
      date: '2025-10-22',
      notes: 'Vehicle delivered successfully. Customer very satisfied.',
      createdBy: 'Le Thi Mai',
    },
    {
      id: 'C-2025-003',
      quoteId: 'Q-2025-003',
      customer: 'Nguyen Van An',
      customerId: 'C-003',
      vehicle: 'Model 3 Performance AWD',
      vin: '5YJ3E3EA0003',
      finalPrice: 1250000000,
      paymentMethod: 'Cash',
      deliveryETA: '2025-10-26',
      status: 'Active',
      date: '2025-10-21',
      notes: 'VIP customer - priority delivery confirmed.',
      createdBy: 'Pham Thi Lan',
    },
    {
      id: 'C-2025-004',
      quoteId: 'Q-2025-004',
      customer: 'Tran Van Binh',
      customerId: 'C-004',
      vehicle: 'Model 3 Premium AWD',
      vin: '5YJ3E4EA0004',
      finalPrice: 1020000000,
      paymentMethod: 'Cash',
      deliveryETA: '2025-10-20',
      status: 'Cancelled',
      date: '2025-10-15',
      notes: 'Customer cancelled due to financial issues.',
      createdBy: 'Tran Van Minh',
    },
  ];

  // Filter contracts
  const filteredContracts = contracts.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { color: 'bg-blue-100 text-blue-800', icon: '🔵' },
      'Completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Cancelled': { color: 'bg-red-100 text-red-800', icon: '❌' },
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
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  // Handle view contract
  const handleView = (contract) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  // Handle go to payment
  const handleGoToPayment = (contract) => {
    navigate('/sales/payment-delivery', { state: { contractId: contract.id } });
  };

  // Handle download PDF
  const handleDownloadPDF = (contractId) => {
    console.log('Downloading PDF for contract:', contractId);
    alert(`Downloading contract ${contractId} as PDF...`);
  };

  // Handle mark completed
  const _handleMarkCompleted = (contractId) => {
    if (window.confirm(`Mark contract ${contractId} as completed?`)) {
      console.log('Marking contract as completed:', contractId);
      alert(`Contract ${contractId} marked as completed!`);
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
                <ScrollText className="w-7 h-7" />
                <span>Contracts</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all vehicle sales contracts
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.id}</div>
                      <div className="text-xs text-gray-500">Quote: {contract.quoteId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.vehicle}</div>
                      <div className="text-xs text-gray-500 font-mono">{contract.vin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(contract.finalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(contract.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleView(contract)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Contract"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {contract.status === 'Active' && (
                          <button
                            onClick={() => handleGoToPayment(contract)}
                            className="text-green-600 hover:text-green-900"
                            title="Go to Payment"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                        )}
                        {contract.status === 'Completed' && (
                          <button
                            className="text-purple-600 hover:text-purple-900"
                            title="View Delivery"
                          >
                            <Package className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Contract Modal */}
        {isViewModalOpen && selectedContract && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 border-b border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Contract Details</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      {selectedContract.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Contract Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Contract ID</label>
                    <div className="text-base font-bold text-gray-900 mt-1">
                      {selectedContract.id}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Quote Reference</label>
                    <div className="text-base font-semibold text-blue-600 mt-1">
                      {selectedContract.quoteId}
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer & Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer</label>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedContract.customer}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle</label>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedContract.vehicle}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">VIN</label>
                      <div className="text-sm font-mono text-gray-700 mt-1">
                        {selectedContract.vin}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Final Price</label>
                      <div className="text-sm font-bold text-blue-600 mt-1">
                        {formatCurrency(selectedContract.finalPrice)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Delivery */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment & Delivery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Payment Method</label>
                      <div className="text-sm text-gray-700 mt-1">
                        {selectedContract.paymentMethod}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Delivery ETA</label>
                      <div className="text-sm text-gray-700 mt-1">
                        {new Date(selectedContract.deliveryETA).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Contract Status</label>
                  <div className="mt-2">
                    {getStatusBadge(selectedContract.status)}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Notes</label>
                  <div className="text-sm text-gray-700 mt-1 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    {selectedContract.notes}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownloadPDF(selectedContract.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  {selectedContract.status === 'Active' && (
                    <>
                      <button
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleGoToPayment(selectedContract);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Go to Payment</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleGoToPayment(selectedContract);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>Go to Delivery</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contracts;

