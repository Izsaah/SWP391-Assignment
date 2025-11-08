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
  { vin: '5YJ3E1ABCD1234567', modelId: 101, variantId: 1001, model: 'Model 3 RWD', color: 'White', price: 39990, dealerName: 'Dealer A', status: 'Available', importDate: '2025-09-10', daysInStock: 12, image: 'https://via.placeholder.com/120x70?text=Model+3' },
  { vin: '5YJYGDEEFG9876543', modelId: 102, variantId: 2001, model: 'Model Y AWD', color: 'Black', price: 49990, dealerName: 'Dealer B', status: 'Reserved', importDate: '2025-09-01', daysInStock: 35, image: 'https://via.placeholder.com/120x70?text=Model+Y' },
  { vin: 'VF3E34PLS12345678', modelId: 103, variantId: 3001, model: 'VF e34 Plus', color: 'Green', price: 28990, dealerName: 'Dealer A', status: 'Sold', importDate: '2025-08-12', daysInStock: 9, image: 'https://via.placeholder.com/120x70?text=VF+e34' },
  { vin: '5YJ3E1ZZZ99999999', modelId: 101, variantId: 1002, model: 'Model 3 Long Range', color: 'Blue', price: 46990, dealerName: 'Dealer C', status: 'Available', importDate: '2025-09-18', daysInStock: 5, image: 'https://via.placeholder.com/120x70?text=Model+3+LR' },
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
    const modelName = v.model.split(' ').slice(0, -1).join(' ') || v.model;
    const entry = byModelMap.get(key) || { modelId: v.modelId, modelName, total: 0, available: 0, reserved: 0, sold: 0 };
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

// Get model detail data for a specific model
export const getModelDetail = (modelId) => {
  const modelVehicles = MOCK_VEHICLES.filter(v => v.modelId === modelId);
  const model = MOCK_MODELS.find(m => m.modelId === modelId);
  
  if (!model) return null;
  
  const modelName = model.modelName;
  const total = modelVehicles.length;
  const available = modelVehicles.filter(v => v.status === 'Available').length;
  const reserved = modelVehicles.filter(v => v.status === 'Reserved').length;
  const sold = modelVehicles.filter(v => v.status === 'Sold').length;
  
  // Determine stock status
  let stockStatus = 'High';
  if (available < 3) stockStatus = 'Low';
  else if (available < 5) stockStatus = 'Medium';
  
  // Generate demand trend data (last 6 months)
  const demandTrend = [
    { month: 'Jul', reserved: 2, sold: 3 },
    { month: 'Aug', reserved: 3, sold: 4 },
    { month: 'Sep', reserved: 4, sold: 5 },
    { month: 'Oct', reserved: 3, sold: 6 },
    { month: 'Nov', reserved: 5, sold: 7 },
    { month: 'Dec', reserved: reserved, sold: sold },
  ];
  
  // History data
  const history = modelVehicles.map(v => ({
    vin: v.vin,
    color: v.color,
    status: v.status,
    date: v.status === 'Sold' ? v.importDate : null,
    price: v.price
  }));
  
  // Forecast (next 3 months based on trend)
  const avgSold = sold > 0 ? Math.round(sold / 6) : 0;
  const forecast = [
    { month: 'Jan', predicted: Math.max(0, available - avgSold * 1) },
    { month: 'Feb', predicted: Math.max(0, available - avgSold * 2) },
    { month: 'Mar', predicted: Math.max(0, available - avgSold * 3) },
  ];
  
  return {
    modelId,
    modelName,
    description: model.description,
    total,
    available,
    reserved,
    sold,
    stockStatus,
    demandTrend,
    history,
    forecast
  };
};

// Create stock request (reorder from manufacturer)
export const createStockRequest = (modelId, quantity, notes = '') => {
  // In real implementation, this would make an API call
  const request = {
    requestId: `REQ-${Date.now()}`,
    modelId,
    modelName: MOCK_MODELS.find(m => m.modelId === modelId)?.modelName || 'Unknown',
    quantity,
    notes,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  
  console.log('Stock Request Created:', request);
  return { success: true, data: request };
};

// Manufacturer Request Data
const MOCK_BRANDS = [
  { brandId: 1, brandName: 'Tesla' },
  { brandId: 2, brandName: 'VinFast' },
  { brandId: 3, brandName: 'BYD' },
  { brandId: 4, brandName: 'Porsche' },
];

const MOCK_MODEL_COLORS = {
  'Tesla': {
    'Model 3': ['White', 'Black', 'Blue', 'Red', 'Silver', 'Gray'],
    'Model Y': ['White', 'Black', 'Blue', 'Red', 'Silver'],
    'Model S': ['White', 'Black', 'Blue', 'Red'],
    'Model X': ['White', 'Black', 'Silver'],
  },
  'VinFast': {
    'VF e34': ['White', 'Green', 'Blue', 'Black', 'Silver'],
    'VF 8': ['White', 'Black', 'Blue', 'Silver'],
    'VF 9': ['White', 'Black', 'Blue'],
  },
  'BYD': {
    'Atto 3': ['White', 'Black', 'Blue', 'Red'],
    'Seal': ['White', 'Black', 'Blue'],
  },
  'Porsche': {
    'Taycan': ['White', 'Black', 'Blue', 'Silver', 'Red'],
    'Taycan Cross Turismo': ['White', 'Black', 'Silver'],
  },
};

// Get all brands
export const getBrands = () => [...MOCK_BRANDS];

// Get models by brand
export const getModelsByBrand = (brandName) => {
  if (!brandName || brandName === '') return [];
  const brandColors = MOCK_MODEL_COLORS[brandName];
  if (!brandColors) return [];
  return Object.keys(brandColors).map(modelName => ({
    modelName,
    brandName
  }));
};

// Get colors by brand and model
export const getColorsByBrandAndModel = (brandName, modelName) => {
  if (!brandName || !modelName) return [];
  const brandColors = MOCK_MODEL_COLORS[brandName];
  if (!brandColors || !brandColors[modelName]) return [];
  return brandColors[modelName];
};

// Get price by brand, model, and color (from stock/variant data)
export const getPriceByModelAndColor = (brandName, modelName, color) => {
  if (!brandName || !modelName || !color) return null;
  
  // Match with MOCK_MODELS data structure
  const model = MOCK_MODELS.find(m => m.modelName === modelName);
  if (!model) return null;
  
  // Find variant with matching color
  const variant = model.variants?.find(v => v.color === color);
  if (variant && variant.price) {
    return variant.price;
  }
  
  return null;
};

// Create manufacturer request (enhanced version)
export const createManufacturerRequest = (requestData) => {
  // In real implementation, this would make an API call
  const request = {
    requestId: `REQ-${Date.now()}`,
    brand: requestData.brand,
    model: requestData.model,
    color: requestData.color,
    quantity: requestData.quantity,
    price: requestData.price || null,
    notes: requestData.notes || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  
  console.log('Manufacturer Request Created:', request);
  return { success: true, data: request };
};

