import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  const isNgrok = API_URL?.includes('ngrok');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  if (isNgrok) headers['ngrok-skip-browser-warning'] = 'true';
  return headers;
};

/**
 * Fetch vehicle models and variants for lookup
 */
const fetchVehicleModels = async () => {
  try {
    const headers = authHeaders();
    const response = await axios.post(`${API_URL}/EVM/viewVehicleForEVM`, { _empty: true }, { headers });
    
    if (response.data?.status === 'success' && response.data.data) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    return [];
  }
};

export const getAllConfirmations = async () => {
  try {
    const confirmationUrl = `${API_URL}/EVM/viewAllConfirmations`;
    const detailUrl = `${API_URL}/EVM/viewConfirmedOrderDetails`;

    const headers = authHeaders();

    let confirmationRes;
    try {
      confirmationRes = await axios.post(confirmationUrl, {}, { headers });
    } catch (postErr) {
      const code = postErr.response?.status;
      if (code === 405) {
        // Some servers expose this as GET
        confirmationRes = await axios.get(confirmationUrl, { headers });
      } else {
        throw postErr;
      }
    }

    const detailRes = await axios
      .post(detailUrl, {}, { headers })
      .catch(async (err) => {
        if (err.response?.status === 405) {
          return axios.get(detailUrl, { headers });
        }
        throw err;
      });

    const confirmationPayload = confirmationRes.data?.data || [];
    const detailPayload = detailRes.data?.data || [];

    // Build lookup by order_detail_id
    const detailMap = new Map();
    detailPayload.forEach((raw) => {
      if (!raw) return;
      const orderDetailId = raw.order_detail_id ?? raw.orderDetailId;
      if (orderDetailId == null) return;
      const detail = {
        orderId: raw.order_id ?? raw.orderId ?? null,
        orderDetailId,
        serialId: raw.serial_id ?? raw.serialId ?? null,
        quantity: raw.quantity ?? 0,
        unitPrice: raw.unit_price ?? raw.unitPrice ?? null,
        orderDate: raw.order_date ?? raw.orderDate ?? null,
        status: raw.status ?? null,
        dealerStaffId: raw.dealer_staff_id ?? raw.dealerStaffId ?? null,
        customerId: raw.customer_id ?? raw.customerId ?? null,
        modelId: raw.model_id ?? raw.modelId ?? null,
      };
      detailMap.set(orderDetailId, detail);
    });

    const combined = confirmationPayload.map((raw) => {
      const orderDetailId = raw.order_detail_id ?? raw.orderDetailId ?? null;
      const detail = orderDetailId != null ? detailMap.get(orderDetailId) : null;
      const agreement = raw.agreement ?? raw.status ?? '';
      return {
        confirmationId: raw.confirmation_id ?? raw.confirmationId ?? null,
        staffAdminId: raw.staff_admin_id ?? raw.staffAdminId ?? null,
        orderDetailId,
        orderId: detail?.orderId ?? raw.order_id ?? raw.orderId ?? null,
        agreement,
        date: raw.date_time ?? raw.date ?? detail?.orderDate ?? null,
        quantity: detail?.quantity ?? raw.quantity ?? null,
        unitPrice: detail?.unitPrice ?? raw.unit_price ?? raw.unitPrice ?? null,
        serialId: detail?.serialId ?? raw.serial_id ?? raw.serialId ?? null,
        status: detail?.status ?? agreement ?? null,
        dealerStaffId: detail?.dealerStaffId ?? null,
        customerId: detail?.customerId ?? null,
        modelId: detail?.modelId ?? null,
      };
    });

    // Fetch vehicle models/variants for enrichment
    const modelsForLookup = await fetchVehicleModels();
    const normalizeId = (id) => {
      if (id === null || id === undefined) return null;
      return String(id);
    };
    
    // Build lookup maps
    const variantIdToColor = new Map();
    const variantIdToModelName = new Map();
    const modelIdToModelName = new Map();
    const serialIdToVariantId = new Map();
    
    if (Array.isArray(modelsForLookup)) {
      modelsForLookup.forEach((m) => {
        const lists = m?.lists || [];
        const mid = normalizeId(m?.modelId ?? m?.model_id);
        if (mid) modelIdToModelName.set(mid, m?.modelName || '');
        lists.forEach((v) => {
          const rawVid = v?.variantId ?? v?.variant_id;
          const vid = normalizeId(rawVid);
          if (vid != null) {
            if (v?.color) variantIdToColor.set(vid, v.color);
            const modelName = m?.modelName || '';
            const version = v?.versionName || v?.version_name || '';
            const composite = [modelName, version].filter(Boolean).join(' ').trim();
            if (composite) variantIdToModelName.set(vid, composite);
          }
        });
      });
    }

    // Build serialId -> variantId map from order data
    combined.forEach((item) => {
      const serialId = item.serialId;
      const modelId = normalizeId(item.modelId);
      if (serialId && modelId && !serialIdToVariantId.has(serialId)) {
        const model = modelsForLookup.find(m => 
          normalizeId(m?.modelId ?? m?.model_id) === modelId
        );
        if (model) {
          const variants = model?.lists || [];
          if (variants.length === 1) {
            const vid = normalizeId(variants[0]?.variantId ?? variants[0]?.variant_id);
            if (vid) serialIdToVariantId.set(serialId, vid);
          } else if (variants.length > 1) {
            // Use first variant as fallback
            const vid = normalizeId(variants[0]?.variantId ?? variants[0]?.variant_id);
            if (vid) serialIdToVariantId.set(serialId, vid);
          }
        }
      }
    });

    // Enrich combined data with variant info
    const enriched = combined.map((item) => {
      let variantId = null;
      if (item.serialId && serialIdToVariantId.has(item.serialId)) {
        variantId = serialIdToVariantId.get(item.serialId);
      }
      
      const modelId = normalizeId(item.modelId);
      const color = variantId ? (variantIdToColor.get(variantId) || '') : '';
      const modelName = variantId 
        ? (variantIdToModelName.get(variantId) || '')
        : (modelId ? (modelIdToModelName.get(modelId) || '') : '');
      
      return {
        ...item,
        variantId,
        color,
        modelName,
      };
    });

    // Group by orderId and aggregate
    const grouped = new Map();
    enriched.forEach((item) => {
      const orderId = item.orderId;
      if (!orderId) return;
      
      const existing = grouped.get(orderId);
      if (existing) {
        existing.quantity += parseInt(item.quantity || 0);
        if (item.color) existing._colors.add(item.color);
        if (item.modelName) existing._models.add(item.modelName);
        if (item.unitPrice != null) existing._prices.add(item.unitPrice);
        // Keep earliest date
        const itemDate = item.date;
        if (itemDate && (!existing.date || itemDate < existing.date)) {
          existing.date = itemDate;
        }
        // Collect all order detail IDs
        existing.orderDetailIds.add(item.orderDetailId);
        // Keep pending status if any detail is pending
        const agreement = (item.agreement || '').toString().toLowerCase();
        if (agreement === '' || agreement === 'pending' || agreement === 'null') {
          existing.isPending = true;
        }
      } else {
        const agreement = (item.agreement || '').toString().toLowerCase();
        const isPending = agreement === '' || agreement === 'pending' || agreement === 'null';
        grouped.set(orderId, {
          orderId,
          quantity: parseInt(item.quantity || 0),
          _colors: new Set(item.color ? [item.color] : []),
          _models: new Set(item.modelName ? [item.modelName] : []),
          _prices: new Set(item.unitPrice != null ? [item.unitPrice] : []),
          date: item.date,
          isPending,
          orderDetailIds: new Set([item.orderDetailId]),
          // Keep first item's metadata for reference
          firstItem: item,
        });
      }
    });

    // Convert grouped data to array format
    const groupedData = Array.from(grouped.values()).map((g) => {
      const colorCount = g._colors.size;
      const modelCount = g._models.size;
      const priceCount = g._prices.size;
      
      // Determine display values
      let displayColor = '';
      if (colorCount === 1) {
        displayColor = Array.from(g._colors)[0];
      } else if (colorCount > 1) {
        displayColor = `${colorCount} colors`;
      }
      
      let displayModel = '';
      if (modelCount === 1) {
        displayModel = Array.from(g._models)[0];
      } else if (modelCount > 1) {
        displayModel = `${modelCount} models`;
      }
      
      let displayPrice = null;
      if (priceCount === 1) {
        displayPrice = Array.from(g._prices)[0];
      }
      
      return {
        orderId: g.orderId,
        model: displayModel,
        color: displayColor,
        quantity: g.quantity,
        price: displayPrice,
        date: g.date,
        isPending: g.isPending,
        agreement: g.isPending ? 'Pending' : (g.firstItem?.agreement || ''),
        orderDetailIds: Array.from(g.orderDetailIds),
        // Keep first item for actions
        firstItem: g.firstItem,
      };
    });

    if (confirmationRes.data?.status === 'success') {
      return { success: true, data: groupedData, message: confirmationRes.data.message };
    }
    return {
      success: false,
      data: groupedData,
      message: confirmationRes.data?.message || 'Failed to load confirmations',
    };
  } catch (e) {
    return { success: false, data: [], message: e.response?.data?.message || e.message || 'Failed to load confirmations' };
  }
};

export const approveCustomOrder = async ({ orderId, decision, versionName, color, unitPrice }) => {
  try {
    const url = `${API_URL}/EVM/approveCustomOrder`;
    const payload = {
      orderId,
      decision,
    };

    if (decision === 'Agree') {
      payload.versionName = versionName;
      payload.color = color;
      payload.unitPrice = unitPrice;
    }

    const res = await axios.post(url, payload, { headers: authHeaders() });
    if (res.data?.status === 'success') {
      return { success: true, data: res.data.data, message: res.data.message };
    }
    return { success: false, message: res.data?.message || 'Failed to process decision' };
  } catch (e) {
    return { success: false, message: e.response?.data?.message || e.message || 'Failed to process decision' };
  }
};


