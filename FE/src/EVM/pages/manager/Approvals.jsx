import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Search, Clock, BadgeCheck } from 'lucide-react';
import { getAllConfirmations, approveCustomOrder } from '../../services/approvalsService';

const Approvals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [onlyPending, setOnlyPending] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: '', // 'approve' | 'reject'
    orderId: null,
    row: null,
  });
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: '',
    type: '', // 'approved' or 'rejected'
  });
  const [rejectConfirmModal, setRejectConfirmModal] = useState({
    open: false,
    orderId: null,
    row: null,
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllConfirmations();
      if (res.success) {
        setItems(res.data || []);
      } else {
        setItems(res.data || []);
        setError(res.message || 'Failed to load approvals');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = Array.isArray(items) ? items : [];
    if (onlyPending) {
      data = data.filter((i) => {
        const isPending = i.isPending !== undefined ? i.isPending : 
          ((i.agreement || i.status || '').toString().toLowerCase() === '' || 
           (i.agreement || i.status || '').toString().toLowerCase() === 'pending' || 
           (i.agreement || i.status || '').toString().toLowerCase() === 'null');
        return isPending;
      });
    }
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((i) =>
        `${i.orderId || i.order_id || ''}`.toLowerCase().includes(q) ||
        `${i.model || ''}`.toLowerCase().includes(q) ||
        `${i.color || ''}`.toLowerCase().includes(q)
      );
    }
    return data;
  }, [items, query, onlyPending]);

  const handleDecision = async (row, decision, extra = {}) => {
    const resolvedOrderId = row?.orderId || row?.order_id || null;
    if (!resolvedOrderId) {
      setError('Unable to determine order ID for this request');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await approveCustomOrder({
        orderId: resolvedOrderId,
        decision,
        ...extra,
      });
      if (!res.success) {
        setError(res.message || 'Action failed');
      } else {
        setError('');
        // Show success modal
        setSuccessModal({
          open: true,
          message: decision === 'Agree' 
            ? `Order #${resolvedOrderId} has been approved successfully!`
            : `Order #${resolvedOrderId} has been rejected.`,
          type: decision === 'Agree' ? 'approved' : 'rejected',
        });
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      await load();
      setLoading(false);
    }
  };

  const openConfirmModal = (row, type) => {
    const resolvedOrderId = row?.orderId || row?.order_id || null;
    if (!resolvedOrderId) {
      setError('Unable to determine order ID for this request');
      return;
    }
    setConfirmModal({
      open: true,
      type,
      orderId: resolvedOrderId,
      row,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, type: '', orderId: null, row: null });
  };

  const confirmDecision = async () => {
    if (!confirmModal.row) return;
    const decision = confirmModal.type === 'approve' ? 'Agree' : 'Disagree';
    const row = confirmModal.row.firstItem || confirmModal.row;
    closeConfirmModal();
    await handleDecision(row, decision);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-blue-600" />
          Approvals
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Order ID, Model, or Color"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
          Show only pending
        </label>
      </div>

      {error && (
        <div className="p-3 border border-red-200 text-red-700 rounded-md bg-red-50 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (Unit)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agreement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((row, idx) => {
                const orderId = row.orderId || row.order_id;
                const model = row.model || 'N/A';
                const color = row.color || 'N/A';
                const quantity = row.quantity || 0;
                const price = row.price;
                const agreement = row.agreement || row.status || '';
                const date = row.date || row.date_time || '';
                const isPending = row.isPending !== undefined ? row.isPending : 
                  (!agreement || agreement.toLowerCase() === 'pending');
                const isAgreed = agreement && agreement.toLowerCase() === 'agree';
                const isRejected = agreement && (agreement.toLowerCase() === 'reject' || agreement.toLowerCase() === 'disagree');

                return (
                  <tr key={`${orderId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{color}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {price != null ? `$${price.toLocaleString('en-US')}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isPending ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : isAgreed ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Agreed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {date ? new Date(date).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={!isPending || loading}
                          onClick={() => openConfirmModal(row.firstItem || row, 'approve')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                            isPending ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          disabled={!isPending || loading}
                          onClick={() => openConfirmModal(row.firstItem || row, 'reject')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
                            isPending ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-500" colSpan={8}>
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval/Rejection Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {confirmModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {confirmModal.type === 'approve'
                  ? `Are you sure you want to approve order #${confirmModal.orderId}?`
                  : `Are you sure you want to reject order #${confirmModal.orderId}? This action cannot be undone.`}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecision}
                disabled={loading}
                className={`px-4 py-2 text-sm rounded-md text-white ${
                  confirmModal.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {confirmModal.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-4">
              {successModal.type === 'approved' ? (
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {successModal.type === 'approved' ? 'Approved Successfully!' : 'Rejected Successfully!'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {successModal.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSuccessModal({ open: false, message: '', type: '' })}
                className={`px-4 py-2 text-sm rounded-md text-white ${
                  successModal.type === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;