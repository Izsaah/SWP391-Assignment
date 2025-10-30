// STATIC MOCK DATA ONLY for Dealer Manager inventory UI

// Dealers
const MOCK_DEALERS = [
  { dealerId: 1, dealerName: 'Dealer A' },
  { dealerId: 2, dealerName: 'Dealer B' },
  { dealerId: 3, dealerName: 'Dealer C' },
];

// Models and variants
const MOCK_MODELS = [
  {
    modelId: 101,
    modelName: 'Model 3',
    description: 'Compact EV sedan with long range',
    variants: [
      { variantId: 1001, versionName: 'RWD', color: 'White', price: 39990, image: 'https://via.placeholder.com/120x70?text=Model+3', isActive: true },
      { variantId: 1002, versionName: 'Long Range', color: 'Blue', price: 46990, image: 'https://via.placeholder.com/120x70?text=Model+3+LR', isActive: true },
    ],
  },
  {
    modelId: 102,
    modelName: 'Model Y',
    description: 'Compact SUV with AWD option',
    variants: [
      { variantId: 2001, versionName: 'AWD', color: 'Black', price: 49990, image: 'https://via.placeholder.com/120x70?text=Model+Y+AWD', isActive: true },
    ],
  },
  {
    modelId: 103,
    modelName: 'VF e34',
    description: 'Vietnamese compact EV SUV',
    variants: [
      { variantId: 3001, versionName: 'Plus', color: 'Green', price: 28990, image: 'https://via.placeholder.com/120x70?text=VF+e34', isActive: true },
    ],
  },
];

// Vehicle units in stock (VIN-level)
const MOCK_VEHICLES = [
  { vin: '5YJ3E1ABCD1234567', modelId: 101, variantId: 1001, model: 'Model 3 RWD', dealerName: 'Dealer A', status: 'Available', importDate: '2025-09-10', daysInStock: 12, image: 'https://via.placeholder.com/120x70?text=Model+3' },
  { vin: '5YJYGDEEFG9876543', modelId: 102, variantId: 2001, model: 'Model Y AWD', dealerName: 'Dealer B', status: 'Reserved', importDate: '2025-09-01', daysInStock: 35, image: 'https://via.placeholder.com/120x70?text=Model+Y' },
  { vin: 'VF3E34PLS12345678', modelId: 103, variantId: 3001, model: 'VF e34 Plus', dealerName: 'Dealer A', status: 'Sold', importDate: '2025-08-12', daysInStock: 9, image: 'https://via.placeholder.com/120x70?text=VF+e34' },
  { vin: '5YJ3E1ZZZ99999999', modelId: 101, variantId: 1002, model: 'Model 3 Long Range', dealerName: 'Dealer C', status: 'Available', importDate: '2025-09-18', daysInStock: 5, image: 'https://via.placeholder.com/120x70?text=Model+3+LR' },
];

// Get all dealers
export const getDealers = () => [...MOCK_DEALERS];

// Get all vehicles (optionally filtered on client)
export const getVehicles = (filters = {}) => {
  const { search = '', status = 'all', dealer = 'all' } = filters;
  return MOCK_VEHICLES.filter((v) => {
    const statusOk = status === 'all' || v.status.toLowerCase() === String(status).toLowerCase();
    const dealerOk = dealer === 'all' || v.dealerName === dealer;
    const term = String(search || '').toLowerCase();
    const searchOk = !term || v.model.toLowerCase().includes(term) || v.vin.toLowerCase().includes(term);
    return statusOk && dealerOk && searchOk;
  });
};

// Stock overview: totals and per-model breakdown
export const getStockOverview = () => {
  const total = MOCK_VEHICLES.length;
  const available = MOCK_VEHICLES.filter(v => v.status === 'Available').length;
  const reserved = MOCK_VEHICLES.filter(v => v.status === 'Reserved').length;
  const sold = MOCK_VEHICLES.filter(v => v.status === 'Sold').length;
  const turnover = total ? Math.round((sold / total) * 100) : 0;

  // by model
  const byModelMap = new Map();
  MOCK_VEHICLES.forEach((v) => {
    const key = v.modelId;
    const entry = byModelMap.get(key) || { modelId: v.modelId, modelName: v.model.split(' ')[0] + ' ' + (v.model.includes('VF') ? 'e34' : v.model.split(' ')[1] || ''), total: 0, available: 0, reserved: 0, sold: 0 };
    entry.total += 1;
    if (v.status === 'Available') entry.available += 1;
    if (v.status === 'Reserved') entry.reserved += 1;
    if (v.status === 'Sold') entry.sold += 1;
    byModelMap.set(key, entry);
  });
  const byModel = Array.from(byModelMap.values());

  return {
    totals: { total, available, reserved, sold, turnover },
    byModel,
  };
};

