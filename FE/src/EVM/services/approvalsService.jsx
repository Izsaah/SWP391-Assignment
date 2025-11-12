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
    const approvedUrl = `${API_URL}/EVM/getAllApprovedOrdersFromDealers`;

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

    let approvedRes = null;
    try {
      approvedRes = await axios.post(approvedUrl, {}, { headers });
    } catch (approvedErr) {
      if (approvedErr?.response?.status === 405) {
        approvedRes = await axios.get(approvedUrl, { headers });
      } else if (approvedErr?.response?.status === 404) {
        approvedRes = null;
      } else if (approvedErr?.response?.data?.status === 'error') {
        approvedRes = approvedErr?.response;
      } else {
        throw approvedErr;
      }
    }

    const confirmationPayload = confirmationRes.data?.data || [];
    const detailPayload = detailRes.data?.data || [];
    const approvedPayload = approvedRes?.data?.data || [];

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

    // Build lookup for approved orders
    const approvedOrdersById = new Map();
    const normalizeKey = (value) => {
      if (value === null || value === undefined) return null;
      return String(value);
    };

    approvedPayload.forEach((raw) => {
      if (!raw) return;
      const orderId = raw.orderId ?? raw.order_id ?? raw.orderID ?? raw.OrderId;
      const confirmation = raw.confirmation || raw.Confirmation || {};
      const agreementRaw = confirmation.agreement ?? raw.agreement ?? raw.status;
      const agreement = agreementRaw ? agreementRaw.toString().toLowerCase() : '';
      if (agreement === 'agree' || agreement === 'approved' || agreement === 'approve') {
        const key = normalizeKey(orderId);
        if (!key) return;
        const confirmationDate =
          confirmation.date ??
          confirmation.date_time ??
          confirmation.dateTime ??
          raw.date ??
          raw.date_time ??
          raw.dateTime ??
          null;
        approvedOrdersById.set(key, {
          confirmationDate,
          raw,
        });
      }
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

    // Group by orderId first, then by model+color+date for same-day requests
    const grouped = new Map();
    const getDateKey = (dateStr) => {
      if (!dateStr) return null;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } catch {
        return null;
      }
    };

    enriched.forEach((item) => {
      const rawOrderId = item.orderId ?? item.order_id ?? item.firstItem?.orderId ?? item.firstItem?.order_id;
      const orderKey = normalizeKey(rawOrderId);
      if (!orderKey) return;

      const quantityValue = parseInt(item.quantity ?? item.detailQuantity ?? 0, 10);
      const quantityDelta = Number.isNaN(quantityValue) ? Number(item.quantity) || 0 : quantityValue;
      const safeQuantity = Number.isFinite(quantityDelta) ? quantityDelta : 0;

      const unitPriceValue = Number(item.unitPrice ?? item.price ?? NaN);
      const safeUnitPrice = Number.isNaN(unitPriceValue) ? null : unitPriceValue;

      // Try to find existing group by orderId first
      let existing = grouped.get(orderKey);
      let mergeTargetKey = orderKey;
      
      // If not found and we have model+color+date, try to find a similar group
      if (!existing) {
        const modelName = (item.modelName || '').trim().toLowerCase();
        const color = (item.color || '').trim().toLowerCase();
        const dateKey = getDateKey(item.date);
        const agreement = (item.agreement || '').toString().toLowerCase();
        
        if (modelName && color && dateKey) {
          // Look for existing group with same model+color+date+status
          for (const [key, group] of grouped.entries()) {
            const groupModel = (group._models.size === 1 ? Array.from(group._models)[0] : '').trim().toLowerCase();
            const groupColor = (group._colors.size === 1 ? Array.from(group._colors)[0] : '').trim().toLowerCase();
            const groupDateKey = getDateKey(group.date);
            const groupAgreement = (group.firstItem?.agreement || '').toString().toLowerCase();
            
            if (
              groupModel === modelName &&
              groupColor === color &&
              groupDateKey === dateKey &&
              groupAgreement === agreement &&
              // Only merge if they're both approved or both pending
              (agreement === 'agree' || agreement === 'approved' || agreement === 'pending' || agreement === '')
            ) {
              existing = group;
              mergeTargetKey = key; // Use the existing key, don't change it
              break;
            }
          }
        }
      }

      if (existing) {
        existing.quantity += safeQuantity;
        if (item.color) existing._colors.add(item.color);
        if (item.modelName) existing._models.add(item.modelName);
        if (safeUnitPrice != null) existing._prices.add(safeUnitPrice);
        // Keep earliest date
        const itemDate = item.date;
        if (itemDate && (!existing.date || itemDate < existing.date)) {
          existing.date = itemDate;
        }
        // Collect all order detail IDs
        if (item.orderDetailId != null) {
          existing.orderDetailIds.add(item.orderDetailId);
        }
        // Collect all order IDs that were merged
        if (rawOrderId && !existing._mergedOrderIds) {
          existing._mergedOrderIds = new Set();
        }
        if (rawOrderId && existing._mergedOrderIds) {
          existing._mergedOrderIds.add(String(rawOrderId));
        }
        // Keep pending status if any detail is pending
        const agreement = (item.agreement || '').toString().toLowerCase();
        if (agreement === '' || agreement === 'pending' || agreement === 'null') {
          existing.isPending = true;
        }
      } else {
        const agreement = (item.agreement || '').toString().toLowerCase();
        const isPending = agreement === '' || agreement === 'pending' || agreement === 'null';
        grouped.set(orderKey, {
          key: orderKey,
          displayOrderId: rawOrderId ?? orderKey,
          quantity: safeQuantity,
          _colors: new Set(item.color ? [item.color] : []),
          _models: new Set(item.modelName ? [item.modelName] : []),
          _prices: new Set(safeUnitPrice != null ? [safeUnitPrice] : []),
          date: item.date,
          isPending,
          orderDetailIds: item.orderDetailId != null ? new Set([item.orderDetailId]) : new Set(),
          _mergedOrderIds: rawOrderId ? new Set([String(rawOrderId)]) : new Set(),
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
      
      // Determine display orderId: show first one, or range if multiple merged
      let displayOrderId = g.displayOrderId ?? g.key;
      if (g._mergedOrderIds && g._mergedOrderIds.size > 1) {
        const sortedIds = Array.from(g._mergedOrderIds).map(id => parseInt(id, 10)).filter(id => !isNaN(id)).sort((a, b) => a - b);
        if (sortedIds.length > 1) {
          displayOrderId = `${sortedIds[0]}-${sortedIds[sortedIds.length - 1]}`;
        } else {
          displayOrderId = g.displayOrderId ?? g.key;
        }
      }

      return {
        orderId: displayOrderId,
        model: displayModel,
        color: displayColor,
        quantity: g.quantity,
        price: displayPrice,
        date: g.date,
        isPending: g.isPending,
        agreement: g.isPending ? 'Pending' : (g.firstItem?.agreement || ''),
        orderDetailIds: Array.from(g.orderDetailIds),
        // Keep first item for actions (use first orderId for API calls)
        firstItem: g.firstItem,
        // Store all merged order IDs for reference
        _allOrderIds: g._mergedOrderIds ? Array.from(g._mergedOrderIds) : [g.displayOrderId ?? g.key],
      };
    });

    const disallowedAgreements = new Set(['disagree', 'rejected', 'reject', 'disagreed', 'disapprove', 'disapproved']);

    const normalizedData = groupedData
      .map((item) => {
        const key = normalizeKey(item.orderId ?? item.firstItem?.orderId ?? item.firstItem?.order_id);
        const approvedInfo = key ? approvedOrdersById.get(key) : null;
        let agreement = item.agreement || item.status || '';
        let isPending = item.isPending;
        let date = item.date;

        if (approvedInfo) {
          agreement = 'Agree';
          isPending = false;
          if (!date && approvedInfo.confirmationDate) {
            date = approvedInfo.confirmationDate;
          }
        }

        const agreementLower = agreement ? agreement.toString().toLowerCase() : '';
        const isRejected = disallowedAgreements.has(agreementLower);

        return {
          ...item,
          date,
          isPending,
          agreement: agreement || (isPending ? 'Pending' : ''),
          isApproved: Boolean(approvedInfo),
          isRejected,
        };
      })
      .filter((item) => !item.isRejected);

    if (confirmationRes.data?.status === 'success') {
      return { success: true, data: normalizedData, message: confirmationRes.data.message };
    }
    return {
      success: false,
      data: normalizedData,
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


