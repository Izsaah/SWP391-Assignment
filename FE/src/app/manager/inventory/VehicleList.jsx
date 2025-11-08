import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { useNavigate } from 'react-router';
import { 
  Search, Car as CarIcon, Building2, ChevronDown, ArrowUpDown, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, BarChart3
} from 'lucide-react';
import { getVehicles, getStockOverview, getDealers } from '../services/inventoryService';
import VehicleDetailModal from './components/VehicleDetailModal';

const ManagerVehicleList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dealer, setDealer] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortKey, setSortKey] = useState('importDate');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [vehicles, setVehicles] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [overview, setOverview] = useState({ totals: { total: 0, available: 0, reserved: 0, sold: 0, turnover: 0 }, byModel: [] });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  useEffect(() => {
    setDealers(getDealers());
  }, []);

  useEffect(() => {
    const data = getVehicles({ search, status, dealer });
    setVehicles(data.map(v => ({
      img: v.image,
      model: v.model,
      color: v.color,
      price: v.price,
      dealer: v.dealerName,
      importDate: v.importDate,
      status: v.status,
      days: v.daysInStock,
      vin: v.vin,
    })));
  }, [search, status, dealer]);

  useEffect(() => {
    setOverview(getStockOverview());
  }, [vehicles]);

  const filtered = useMemo(() => {
    const base = vehicles;
    const sorted = [...base].sort((a,b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (sortKey === 'importDate') {
        return sortDir === 'asc' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
      }
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [vehicles, sortKey, sortDir]);

  const summary = overview.totals;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const Trend = ({ up=true, value='+5%' }) => (
    <span className={`inline-flex items-center text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>}
      {value} MoM
    </span>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicle List</h1>
            <p className="text-sm text-gray-600 mt-1">VIN-level inventory management</p>
          </div>
          <button
            onClick={() => navigate('/manager/inventory/stock')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Stock Overview</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search VIN or Model" className="w-full pl-9 pr-3 py-2 border border-[#DEE2E6] rounded-lg focus:ring-2 focus:ring-[#0D6EFD]" />
            </div>
            <select value={dealer} onChange={(e)=>setDealer(e.target.value)} className="px-3 py-2 border border-[#DEE2E6] rounded-lg">
              <option value="all">All Dealers</option>
              {dealers.map(d => (
                <option key={d.dealerId} value={d.dealerName}>{d.dealerName}</option>
              ))}
            </select>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="px-3 py-2 border border-[#DEE2E6] rounded-lg">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <div className="flex items-center justify-between">
              <button className="px-3 py-2 border border-[#DEE2E6] rounded-lg bg-[#F8F9FA] text-sm">Advanced Filters</button>
              <div className="hidden md:flex items-center space-x-2">
                <button onClick={()=>setViewMode('grid')} className={`px-2 py-1 rounded ${viewMode==='grid'?'bg-blue-50 text-blue-600':'text-gray-600'}`}>Cards</button>
                <button onClick={()=>setViewMode('list')} className={`px-2 py-1 rounded ${viewMode==='list'?'bg-blue-50 text-blue-600':'text-gray-600'}`}>List</button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary with icons + MoM trends */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] p-4 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              <Trend up value="+2%" />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg"><CarIcon className="w-6 h-6 text-blue-600"/></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] p-4 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{summary.available}</p>
              <Trend up value="+4%" />
            </div>
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600"/></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] p-4 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.reserved}</p>
              <Trend up={false} value="-3%" />
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg"><Clock className="w-6 h-6 text-yellow-600"/></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] p-4 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Sold (Turnover)</p>
              <p className="text-2xl font-bold"><span className="text-blue-600">{summary.sold}</span> <span className="text-sm text-gray-500">({summary.turnover}%)</span></p>
              <Trend up value="+6%" />
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg"><Building2 className="w-6 h-6 text-indigo-600"/></div>
          </div>
        </div>

        {/* Turnover by Model (compact chips) */}
        <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Turnover by Model</h3>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {overview.byModel.map((m, idx) => {
              const val = m.total ? Math.round((m.sold / m.total) * 100) : 0;
              const colors = ['#2563eb','#16a34a','#f59e0b','#7c3aed','#0ea5e9'];
              const color = colors[idx % colors.length];
              return (
                <div key={m.modelId} className="flex items-center gap-2 px-2 py-1 rounded-full border border-[#DEE2E6] text-xs whitespace-nowrap">
                  <span className="text-gray-700">{m.modelName}</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-1.5" style={{width:`${val}%`, background:color}} />
                  </div>
                  <span className="font-semibold" style={{color}}>{val}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table or Cards */}
        {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#DEE2E6]">
          <div className="px-6 py-4 border-b border-[#EEE]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle List ({filtered.length})</h3>
              {/* Summary bar */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <span className="text-gray-600">Available: <span className="font-semibold text-green-600">{summary.available}</span></span>
                <span className="text-gray-600">Reserved: <span className="font-semibold text-yellow-600">{summary.reserved}</span></span>
                <span className="text-gray-600">Sold: <span className="font-semibold text-blue-600">{summary.sold}</span></span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th onClick={()=>toggleSort('model')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Model <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('vin')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">VIN <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('color')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Color <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Status <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('price')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Price <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((v) => (
                  <tr 
                    key={v.vin} 
                    onClick={() => handleVehicleClick(v)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <img src={v.img} alt={v.model} className="w-24 h-14 object-cover rounded-md border"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{v.vin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {v.color}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        v.status === 'Available' ? 'bg-green-100 text-green-800' :
                        v.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatPrice(v.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(v => (
              <div 
                key={v.vin} 
                onClick={() => handleVehicleClick(v)}
                className="bg-white border border-[#DEE2E6] rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <img src={v.img} alt={v.model} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{v.model}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      v.status === 'Available' ? 'bg-green-100 text-green-800' :
                      v.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-mono">VIN: {v.vin}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Color: <span className="font-medium text-gray-900">{v.color}</span></span>
                    <span className="font-semibold text-gray-900">{formatPrice(v.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Dealer: {v.dealer}</span>
                    <span>{v.days} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Turnover is placed above the list (compact card) */}

        {/* Vehicle Detail Modal */}
        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </Layout>
  );
};

export default ManagerVehicleList;


