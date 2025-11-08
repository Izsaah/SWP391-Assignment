import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { CreditCard, Package, Download, ScrollText, CheckCircle, XCircle } from 'lucide-react';
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
      paymentMethod: 'Full Payment',
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
      paymentMethod: 'Full Payment',
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
      paymentMethod: 'Full Payment',
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

  // Handle confirm contract
  const handleConfirmContract = (contract) => {
    if (window.confirm(`Confirm contract ${contract.id}?\n\nThis will mark the contract as "Confirmed" and move it to the Payment & Delivery module.`)) {
      console.log('Confirming contract:', contract.id);
      alert(`✅ Contract ${contract.id} confirmed successfully!\n\nMoving to Payment & Delivery module...`);
      setIsViewModalOpen(false);
      // In real app: navigate to Payment & Delivery page
      handleGoToPayment(contract);
    }
  };

  // Handle cancel contract
  const handleCancelContract = (contract) => {
    if (window.confirm(`Cancel contract ${contract.id}?\n\nThis will mark the contract as "Cancelled".`)) {
      console.log('Cancelling contract:', contract.id);
      alert(`Contract ${contract.id} cancelled.`);
      setIsViewModalOpen(false);
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} onClick={() => handleView(contract)} className="hover:bg-blue-50 cursor-pointer transition-colors">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Contract Modal */}
        {isViewModalOpen && selectedContract && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 border-b border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Contract Details</h2>
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

              {/* Modal Content - Two Column Layout */}
              <div className="flex flex-col lg:flex-row max-h-[calc(90vh-200px)] overflow-hidden">
                {/* Left Section - Contract Info (50%) */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r border-gray-200">
                  {/* Contract Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span>📄</span>
                      <span>Contract Information</span>
                    </h3>
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
                  </div>

                  {/* Customer & Vehicle */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Customer & Vehicle Information</h3>
                    <div className="grid grid-cols-1 gap-4">
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
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Payment Type</label>
                        <div className="text-base font-bold text-blue-600 mt-1">
                          {selectedContract.paymentMethod}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Final Price</label>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(selectedContract.finalPrice)}
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

                  {/* Next Steps */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <span>📋</span>
                      <span>Next Steps</span>
                    </h4>
                    {selectedContract.status === 'Active' && (
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 font-bold">1.</span>
                          <span>Click "Confirm Contract" to proceed to Payment & Delivery</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Process payment based on <strong>{selectedContract.paymentMethod}</strong> method</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-purple-600 font-bold">3.</span>
                          <span>Schedule and complete vehicle delivery</span>
                        </div>
                      </div>
                    )}
                    {selectedContract.status === 'Completed' && (
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Contract completed successfully</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Vehicle delivered to customer</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>All payments received</span>
                        </div>
                      </div>
                    )}
                    {selectedContract.status === 'Cancelled' && (
                      <div className="text-sm text-gray-700">
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Contract has been cancelled</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedContract.notes && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Notes</label>
                      <div className="text-sm text-gray-700 mt-1 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {selectedContract.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions (50%) */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 border-l border-gray-100">
                  {/* Current Status Display */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Current Status</div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {selectedContract.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedContract.paymentMethod === 'Full Payment' ? 'Full Payment Required' : 'Installment Payment'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedContract.status === 'Active' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConfirmContract(selectedContract)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="font-semibold">Confirm Contract</div>
                            <div className="text-xs text-green-100">Proceed to Payment</div>
                          </div>
                        </div>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                      
                      <button
                        onClick={() => handleCancelContract(selectedContract)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border-2 border-gray-200 hover:border-red-300 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <div className="font-semibold">Cancel Contract</div>
                            <div className="text-xs text-gray-500 group-hover:text-red-600">Mark as Cancelled</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Additional Actions */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleDownloadPDF(selectedContract.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium">Download PDF</span>
                      </div>
                    </button>
                    
                    {selectedContract.status === 'Active' && (
                      <button
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleGoToPayment(selectedContract);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-indigo-50 text-gray-700 border border-gray-300 hover:border-indigo-400 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-sm font-medium">Payment & Delivery</span>
                        </div>
                        <span className="text-lg text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contracts;

