import axios from 'axios';
import { handleAuthError } from './inventoryService';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  const isNgrok = API_URL?.includes('ngrok');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (isNgrok) headers['ngrok-skip-browser-warning'] = 'true';
  return headers;
};

/**
 * Fetch promotions assigned to the current dealer (derived from JWT)
 * BE endpoint: /api/staff/viewPromotionDealerId
 * Returns a normalized list for UI consumption.
 */
export async function fetchDealerPromotions() {
  try {
    const res = await axios.post(`${API_URL}/staff/viewPromotionDealerId`, {}, { headers: authHeaders() });
    const payload = res?.data;
    const dealer = payload?.data || {};
    const list = dealer?.promotion || [];

    // Normalize
    const rows = list
      .map((p) => {
        const promoId = p?.promoId ?? p?.promo_id ?? p?.id;
        if (promoId === undefined || promoId === null) return null;

        const rawRate = p?.discountRate ?? p?.discount_rate ?? 0;
        const numericRate = Number(rawRate);

        return {
          id: String(promoId),
          promoId: Number(promoId),
          description: p?.description || '',
          startDate: p?.startDate || p?.start_date || null,
          endDate: p?.endDate || p?.end_date || null,
          discountRate: Number.isFinite(numericRate) ? numericRate : 0,
          type: p?.type || '',
          raw: p,
        };
      })
      .filter(Boolean);

    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching dealer promotions:', error);
    handleAuthError(error);
    return { success: false, message: error?.response?.data?.message || error.message, data: [] };
  }
}


