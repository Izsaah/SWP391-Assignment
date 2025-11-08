import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { CreditCard, DollarSign, Edit2, TrendingDown, Users, TrendingUp, BarChart3, Search } from 'lucide-react';

const Payment = () => {
  const [activeTab, setActiveTab] = useState('installments');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [staffFilter, setStaffFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthsToDeduct, setMonthsToDeduct] = useState(1);

  const [installmentPayments, setInstallmentPayments] = useState([
    {
      orderId: 'ORD-2025-001',
      orderFormId: 'OF-2025-001',
      customer: 'Le Minh Tuan',
      vehicle: 'Model 3 Standard RWD',
      vin: '5YJ3E1EA0001',
      totalAmount: 970000000,
      downPayment: 194000000,
      monthlyPayment: 20000000,
      totalMonths: 36,
      monthsPaid: 0,
      monthsRemaining: 36,
      totalRemaining: 776000000,
      paidAmount: 194000000,
      bank: 'Vietcombank',
      status: 'Active',
      salesperson: 'Nguyen Van Hung',
      salespersonId: 'S-001'
    },
    {
      orderId: 'ORD-2025-002',
      orderFormId: 'OF-2025-002',
      customer: 'Tran Hoa',
      vehicle: 'Model Y Long Range',
      vin: '5YJ3E2EA0002',
      totalAmount: 1200000000,
      downPayment: 300000000,
      monthlyPayment: 25000000,
      totalMonths: 36,
      monthsPaid: 5,
      monthsRemaining: 31,
      totalRemaining: 775000000,
      paidAmount: 425000000,
      bank: 'BIDV',
      status: 'Active',
      salesperson: 'Le Thi Mai',
      salespersonId: 'S-002'
    },
    {
      orderId: 'ORD-2025-005',
      orderFormId: 'OF-2025-005',
      customer: 'Hoang Thi Lan',
      vehicle: 'Model 3 Premium AWD',
      vin: '5YJ3E5EA0005',
      totalAmount: 1080000000,
      downPayment: 216000000,
      monthlyPayment: 22000000,
      totalMonths: 36,
      monthsPaid: 0,
      monthsRemaining: 36,
      totalRemaining: 792000000,
      paidAmount: 216000000,
      bank: 'VietinBank',
      status: 'Active',
      salesperson: 'Pham Thi Lan',
      salespersonId: 'S-003'
    },
  ]);

  const [completedPayments, setCompletedPayments] = useState([
    {
      orderId: 'ORD-2025-003',
      orderFormId: 'OF-2025-003',
      customer: 'Nguyen Van An',
      vehicle: 'Model 3 Performance AWD',
      vin: '5YJ3E3EA0003',
      totalAmount: 1250000000,
      paidAmount: 1250000000,
      paymentMethod: 'Full Payment',
      paymentDate: '2025-10-21',
      bank: 'Vietcombank',
      status: 'Completed',
      receiptNumber: 'REC-2025-003',
      salesperson: 'Pham Thi Lan',
      salespersonId: 'S-003'
    },
    {
      orderId: 'ORD-2025-004',
      orderFormId: 'OF-2025-004',
      customer: 'Pham Thu Ha',
      vehicle: 'Model 3 Premium AWD',
      vin: '5YJ3E4EA0004',
      totalAmount: 1020000000,
      paidAmount: 1020000000,
      paymentMethod: 'Full Payment',
      paymentDate: '2025-10-25',
      bank: 'Techcombank',
      status: 'Completed',
      receiptNumber: 'REC-2025-004',
      salesperson: 'Tran Van Minh',
      salespersonId: 'S-004'
    },
  ]);

  const staffList = [...new Set([
    ...installmentPayments.map(p => p.salesperson),
    ...completedPayments.map(p => p.salesperson)
  ])];

  const filteredInstallments = installmentPayments.filter(p => {
    if (staffFilter !== 'all' && p.salesperson !== staffFilter) return false;
    if (searchQuery && !p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !p.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredCompleted = completedPayments.filter(p => {
    if (staffFilter !== 'all' && p.salesperson !== staffFilter) return false;
    if (searchQuery && !p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !p.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setMonthsToDeduct(1);
    setIsEditPaymentModalOpen(true);
  };

  const handleSavePaymentDeduction = () => {
    if (!selectedPayment) return;
    
    const months = parseInt(monthsToDeduct);
    if (months <= 0 || months > selectedPayment.monthsRemaining) {
      alert(`Please enter a valid number of months (1-${selectedPayment.monthsRemaining}).`);
      return;
    }
    
    const paymentAmount = months * selectedPayment.monthlyPayment;
    
    if (window.confirm(`Record payment of ${months} month(s) (${formatCurrency(paymentAmount)}) for order ${selectedPayment.orderId}?`)) {
      const updatedPayments = [...installmentPayments];
      const index = updatedPayments.findIndex(p => p.orderId === selectedPayment.orderId);
      
      if (index !== -1) {
        const updatedPayment = { ...updatedPayments[index] };
        updatedPayment.monthsPaid += months;
        updatedPayment.monthsRemaining -= months;
        updatedPayment.paidAmount += paymentAmount;
        updatedPayment.totalRemaining -= paymentAmount;
        
        if (updatedPayment.monthsRemaining === 0) {
          updatedPayments.splice(index, 1);
          setInstallmentPayments(updatedPayments);
          
          const completedPayment = {
            orderId: updatedPayment.orderId,
            orderFormId: updatedPayment.orderFormId,
            customer: updatedPayment.customer,
            vehicle: updatedPayment.vehicle,
            vin: updatedPayment.vin,
            totalAmount: updatedPayment.totalAmount,
            paidAmount: updatedPayment.totalAmount,
            paymentMethod: 'Installment',
            paymentDate: new Date().toISOString().split('T')[0],
            bank: updatedPayment.bank,
            status: 'Completed',
            receiptNumber: `REC-${updatedPayment.orderId}`,
            salesperson: updatedPayment.salesperson,
            salespersonId: updatedPayment.salespersonId
          };
          setCompletedPayments([...completedPayments, completedPayment]);
          
          alert(`✅ Payment completed successfully!\n\nAll ${updatedPayment.totalMonths} months have been paid.\nTotal: ${formatCurrency(updatedPayment.totalAmount)}`);
          setActiveTab('completed');
        } else {
          updatedPayments[index] = updatedPayment;
          setInstallmentPayments(updatedPayments);
          
          alert(`✅ Payment recorded successfully!\n\nPaid: ${months} month(s) (${formatCurrency(paymentAmount)})\nRemaining: ${updatedPayment.monthsRemaining} months`);
        }
      }
      
      setIsEditPaymentModalOpen(false);
      setMonthsToDeduct(1);
      setSelectedPayment(null);
    }
  };

  // Calculate statistics by staff
  const staffStats = staffList.map(staff => {
    const installments = installmentPayments.filter(p => p.salesperson === staff);
    const completed = completedPayments.filter(p => p.salesperson === staff);
    return {
      staff,
      totalInstallments: installments.length,
      totalCompleted: completed.length,
      totalRevenue: completed.reduce((sum, p) => sum + p.totalAmount, 0),
      pendingAmount: installments.reduce((sum, p) => sum + p.totalRemaining, 0)
    };
  });

  const totalStats = {
    activeInstallments: installmentPayments.length,
    totalCompleted: completedPayments.length,
    totalRevenue: completedPayments.reduce((sum, p) => sum + p.totalAmount, 0),
    pendingAmount: installmentPayments.reduce((sum, p) => sum + p.totalRemaining, 0)
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
                <span>Payment Management Overview</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor all customer payments from all staff members
              </p>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalStats.activeInstallments}</p>
                <p className="text-sm text-gray-600">Active Installments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalStats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalStats.pendingAmount)}</p>
                <p className="text-sm text-gray-600">Pending Amount</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalCompleted}</p>
                <p className="text-sm text-gray-600">Completed Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Staff Performance</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Installments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.staff}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stat.totalInstallments}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stat.totalCompleted}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(stat.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-600">{formatCurrency(stat.pendingAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Staff</option>
              {staffList.map(staff => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('installments')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'installments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Installment Payments</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'installments' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {filteredInstallments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Completed Payments</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {filteredCompleted.length}
              </span>
            </button>
          </div>
        </div>

        {/* Installment Payments Tab */}
        {activeTab === 'installments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Months Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstallments.map((payment) => (
                    <tr key={payment.orderId} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.orderId}</div>
                        <div className="text-xs text-gray-500">{payment.orderFormId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.salesperson}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-purple-600">
                          {payment.monthsPaid} / {payment.totalMonths} months
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.monthsRemaining} remaining
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Completed Payments Tab */}
        {activeTab === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompleted.map((payment) => (
                    <tr key={payment.orderId} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.orderId}</div>
                        <div className="text-xs text-gray-500">{payment.orderFormId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.salesperson}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(payment.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Payment Modal - Same as staff version */}
        {isEditPaymentModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Record Month Payment</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Order {selectedPayment.orderId} • {selectedPayment.customer}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditPaymentModalOpen(false);
                      setMonthsToDeduct(1);
                      setSelectedPayment(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Months Paid:</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedPayment.monthsPaid} / {selectedPayment.totalMonths}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Months Remaining:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {selectedPayment.monthsRemaining} months
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    How many months to deduct?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedPayment.monthsRemaining}
                    value={monthsToDeduct}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= selectedPayment.monthsRemaining) {
                        setMonthsToDeduct(val);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-center"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Payment Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(monthsToDeduct * selectedPayment.monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-gray-700">After Payment:</span>
                    <span className="text-xl font-bold text-green-600">
                      {selectedPayment.monthsPaid + monthsToDeduct} / {selectedPayment.totalMonths} months
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditPaymentModalOpen(false);
                    setMonthsToDeduct(1);
                    setSelectedPayment(null);
                  }}
                  className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaymentDeduction}
                  className="px-6 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg font-medium"
                >
                  Save Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Payment;
