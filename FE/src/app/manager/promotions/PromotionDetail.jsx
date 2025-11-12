import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Tag, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { fetchDealerPromotions } from '../services/promotionsService';

const PromotionDetailModal = ({ promotionId, onClose }) => {
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!promotionId) return;

    const load = async () => {
      setLoading(true);
      const res = await fetchDealerPromotions();
      if (!res.success) {
        setError(res.message || 'Failed to load promotion.');
        setPromotion(null);
        setLoading(false);
        return;
      }

      const list = res.data || [];
      const found = list.find(p => String(p.id) === String(promotionId));

      if (!found) {
        setError('Promotion not found or not assigned to this dealer.');
        setPromotion(null);
      } else {
        setPromotion(found);
        setError(null);
      }
      setLoading(false);
    };

    load();
  }, [promotionId]);

  const discountDisplay = useMemo(() => {
    if (!promotion) return 'N/A';
    const rate = promotion.discountRate;
    if (promotion.type && promotion.type.toUpperCase() === 'FIXED') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(rate);
    }
    const percent = rate <= 1 ? rate * 100 : rate;
    return `${percent}%`;
  }, [promotion]);

  const formattedStart = promotion?.startDate
    ? new Date(promotion.startDate).toLocaleDateString('vi-VN')
    : 'N/A';
  const formattedEnd = promotion?.endDate
    ? new Date(promotion.endDate).toLocaleDateString('vi-VN')
    : 'N/A';

  const isActive = useMemo(() => {
    if (!promotion) return false;
    const now = new Date();
    const start = promotion.startDate ? new Date(promotion.startDate) : null;
    const end = promotion.endDate ? new Date(promotion.endDate) : null;
    return (!start || start <= now) && (!end || now <= end);
  }, [promotion]);

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading promotion...
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      );
    }

    if (!promotion) {
      return (
        <div className="text-sm text-gray-600">
          Promotion data is not available.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-5 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-blue-600" />
            Promotion Information
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-500">Description</p>
              <p className="font-medium text-gray-900 mt-1">{promotion.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Discount Type</p>
              <p className="font-medium text-gray-900 mt-1">{promotion.type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Discount Value
              </p>
              <p className="font-semibold text-blue-600 mt-1">{discountDisplay}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Valid From
                </p>
                <p className="font-medium text-gray-900 mt-1">{formattedStart}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valid To</p>
                <p className="font-medium text-gray-900 mt-1">{formattedEnd}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 flex items(center)">
                <TrendingUp className="w-3 h-3 mr-1" />
                Status
              </p>
              <p className={`font-semibold mt-1 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Variants</h2>
          <p className="text-xs text-gray-600">
            Variant-level configuration is not yet available. This promotion applies according to the manufacturer settings.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {promotion?.description || 'Promotion Detail'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Promotion ID: {promotion?.promoId ?? promotion?.id ?? promotionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close promotion detail"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">{renderBody()}</div>
      </div>
    </div>
  );
};

export default PromotionDetailModal;

