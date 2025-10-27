import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { CreditCard, Package, Eye, CheckCircle, Plus, FileText } from 'lucide-react';

const PaymentDelivery = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Sample payment & delivery data
  const records = [
    {
      contractId: 'C-2025-001',
      customer: 'Le Minh Tuan',
      vehicle: 'Model 3 Standard RWD',
      amount: 920000000,
      // Payment Info
      paymentMethod: 'Cash',
      amountPaid: 0,
      paymentStatus: 'Pending',
      paymentNotes: 'Awaiting customer payment',
      // Delivery Info
      warehouse: 'Warehouse A',
      driver: 'Tran Van Hung',
      estimatedDelivery: '2025-10-25',
      deliveryStatus: 'Awaiting',
      deliveryNotes: 'Vehicle prepared for delivery',
      overallStatus: 'Pending',
    },
    {
      contractId: 'C-2025-002',
      customer: 'Nguyen Hoa',
      vehicle: 'Model Y Long Range',
      amount: 1200000000,
      // Payment Info
      paymentMethod: 'Finance',
      amountPaid: 1200000000,
      paymentStatus: 'Paid',
      paymentNotes: 'Full payment received via installment plan',
      // Delivery Info
      warehouse: 'Warehouse B',
      driver: 'Le Van Thanh',
      estimatedDelivery: '2025-10-22',
      deliveryStatus: 'Delivered',
      deliveryNotes: 'Successfully delivered on October 22, 2025',
      overallStatus: 'Completed',
    },
    {
      contractId: 'C-2025-003',
      customer: 'Nguyen Van An',
      vehicle: 'Model 3 Performance AWD',
      amount: 1250000000,
      // Payment Info
      paymentMethod: 'Cash',
      amountPaid: 1250000000,
      paymentStatus: 'Paid',
      paymentNotes: 'VIP customer - immediate payment completed',
      // Delivery Info
      warehouse: 'Warehouse A',
      driver: 'Pham Van Minh',
      estimatedDelivery: '2025-10-26',
      deliveryStatus: 'In Transit',
      deliveryNotes: 'En route to customer location',
      overallStatus: 'Paid',
    },
    {
      contractId: 'C-2025-004',
      customer: 'Tran Thi Mai',
      vehicle: 'Model 3 Premium AWD',
      amount: 1020000000,
      // Payment Info
      paymentMethod: 'Cash',
      amountPaid: 500000000,
      paymentStatus: 'Partial',
      paymentNotes: 'Deposit received, awaiting remaining balance',
      // Delivery Info
      warehouse: 'Warehouse C',
      driver: 'Not assigned',
      estimatedDelivery: '2025-10-28',
      deliveryStatus: 'Awaiting',
      deliveryNotes: 'Awaiting full payment before delivery',
      overallStatus: 'Pending',
    },
    {
      contractId: 'C-2025-005',
      customer: 'Pham Van Loc',
      vehicle: 'Model Y Performance',
      amount: 1450000000,
      // Payment Info
      paymentMethod: 'Lease',
      amountPaid: 290000000,
      paymentStatus: 'Partial',
      paymentNotes: 'Lease agreement active - monthly installments in progress',
      // Delivery Info
      warehouse: 'Warehouse A',
      driver: 'Nguyen Van Binh',
      estimatedDelivery: '2025-10-24',
      deliveryStatus: 'Awaiting',
      deliveryNotes: 'Ready for delivery pending payment progress',
      overallStatus: 'Pending',
    },
  ];

  // Filter records
  const filteredRecords = records.filter(r => {
    if (statusFilter === 'all') return true;
    return r.overallStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Paid': { color: 'bg-blue-100 text-blue-800', icon: '💳' },
      'Delivered': { color: 'bg-purple-100 text-purple-800', icon: '📦' },
      'Completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Partial': { color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
      'In Transit': { color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
      'Awaiting': { color: 'bg-gray-100 text-gray-800', icon: '⏸️' },
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

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  // Handle mark as paid
  const handleMarkAsPaid = (record) => {
    const totalAmount = formatCurrency(record.amount);
    if (window.confirm(`Confirm payment received in full (${totalAmount})?`)) {
      console.log('Marking as paid:', record.contractId);
      alert(`✅ Payment confirmed successfully.\n\nContract ${record.contractId} marked as Paid.`);
      setIsDetailsModalOpen(false);
    }
  };

  // Handle mark as delivered
  const handleMarkAsDelivered = (contractId) => {
    console.log('Marking as delivered:', contractId);
    alert(`🚚 Delivery confirmed. Contract ${contractId} marked as Delivered.`);
    setIsDetailsModalOpen(false);
  };

  // Handle complete contract
  const handleCompleteContract = (contractId) => {
    if (window.confirm(`Complete contract ${contractId}? This will finalize the sale.`)) {
      console.log('Completing contract:', contractId);
      alert(`✅ Contract ${contractId} Completed successfully!`);
      setIsDetailsModalOpen(false);
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
                <CreditCard className="w-7 h-7" />
                <span>Payment & Delivery</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor payment and delivery status for all contracts
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
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'delivered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Delivered
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
          </div>
        </div>

        {/* Payment & Delivery Table */}
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.contractId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.contractId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.customer}</div>
                      <div className="text-xs text-gray-500">{record.vehicle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(record.amount)}
                      </div>
                      {record.paymentStatus === 'Partial' && (
                        <div className="text-xs text-orange-600">
                          Paid: {formatCurrency(record.amountPaid)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.deliveryStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {record.paymentStatus !== 'Paid' && record.paymentMethod === 'Cash' && (
                          <button
                            onClick={() => handleMarkAsPaid(record)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                        )}
                        {record.deliveryStatus !== 'Delivered' && record.paymentStatus === 'Paid' && (
                          <button
                            onClick={() => handleMarkAsDelivered(record.contractId)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Mark as Delivered"
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

        {/* Details Modal */}
        {isDetailsModalOpen && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 border-b border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Payment & Delivery Details</h2>
                    <p className="text-green-100 text-sm mt-1">
                      {selectedRecord.contractId}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Customer</label>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {selectedRecord.customer}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle</label>
                      <div className="text-base font-semibold text-gray-900 mt-1">
                        {selectedRecord.vehicle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Payment Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Method:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedRecord.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total:</span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(selectedRecord.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Amount Paid:</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(selectedRecord.amountPaid)}</span>
                    </div>
                    {selectedRecord.paymentStatus === 'Partial' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Remaining:</span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(selectedRecord.amount - selectedRecord.amountPaid)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedRecord.paymentStatus)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-300 flex space-x-2">
                    {selectedRecord.paymentStatus !== 'Paid' && selectedRecord.paymentMethod === 'Cash' && (
                      <button
                        onClick={() => handleMarkAsPaid(selectedRecord)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <span className="text-lg">💵</span>
                        <span>Mark as Paid</span>
                      </button>
                    )}
                    {selectedRecord.paymentStatus !== 'Paid' && (selectedRecord.paymentMethod === 'Finance' || selectedRecord.paymentMethod === 'Lease') && (
                      <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Add Installment</span>
                      </button>
                    )}
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>📜 View Payment Log</span>
                    </button>
                  </div>
                  {selectedRecord.paymentStatus !== 'Paid' && selectedRecord.paymentMethod === 'Cash' && (
                    <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-3 rounded border border-blue-200">
                      🛈 Once marked as paid, the contract will move to "Completed" status.
                    </div>
                  )}
                  {selectedRecord.paymentStatus !== 'Paid' && (selectedRecord.paymentMethod === 'Finance' || selectedRecord.paymentMethod === 'Lease') && (
                    <div className="mt-3 text-xs text-orange-700 bg-orange-100 p-3 rounded border border-orange-200">
                      💡 Add installment payments periodically. Status will automatically change to "Paid" when Amount Paid ≥ Total.
                    </div>
                  )}
                  <div className="mt-3 text-xs text-gray-600 bg-white/50 p-2 rounded">
                    💡 {selectedRecord.paymentNotes}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span>Delivery Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Warehouse:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedRecord.warehouse}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Driver:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedRecord.driver}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Estimated:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(selectedRecord.estimatedDelivery).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedRecord.deliveryStatus)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-300 flex space-x-2">
                    {selectedRecord.deliveryStatus !== 'Delivered' && selectedRecord.paymentStatus === 'Paid' && (
                      <button
                        onClick={() => handleMarkAsDelivered(selectedRecord.contractId)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Delivered</span>
                      </button>
                    )}
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>Add Note</span>
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-white/50 p-2 rounded">
                    📦 {selectedRecord.deliveryNotes}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {selectedRecord.paymentStatus === 'Paid' && selectedRecord.deliveryStatus === 'Delivered' && (
                  <button
                    onClick={() => handleCompleteContract(selectedRecord.contractId)}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Complete Contract</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentDelivery;

