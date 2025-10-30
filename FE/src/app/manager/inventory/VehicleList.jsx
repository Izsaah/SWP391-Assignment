import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { 
  Search, Car as CarIcon, Building2, ChevronDown, ArrowUpDown, ArrowUpRight, ArrowDownRight, MoreVertical, CheckCircle, Clock
} from 'lucide-react';
import { getVehicles, getStockOverview, getDealers } from '../services/inventoryService';

const ManagerVehicleList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dealer, setDealer] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortKey, setSortKey] = useState('importDate');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [vehicles, setVehicles] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [overview, setOverview] = useState({ totals: { total: 0, available: 0, reserved: 0, sold: 0, turnover: 0 }, byModel: [] });

  useEffect(() => {
    setDealers(getDealers());
  }, []);

  useEffect(() => {
    const data = getVehicles({ search, status, dealer });
    setVehicles(data.map(v => ({
      img: v.image,
      model: v.model,
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
                  <th onClick={()=>toggleSort('dealer')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Dealer <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('importDate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Import Date <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Status <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th onClick={()=>toggleSort('days')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Days in Stock <ArrowUpDown className="inline w-3 h-3 ml-1"/></th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((v) => (
                  <tr key={v.vin} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <img src={v.img} alt={v.model} className="w-24 h-14 object-cover rounded-md border"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.vin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.dealer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.importDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.days} days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <div className="relative inline-block text-left group">
                        <button className="p-2 rounded hover:bg-gray-100"><MoreVertical className="w-4 h-4"/></button>
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">View</button>
                          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Update</button>
                          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Transfer</button>
                          <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600">Lock</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(v => (
              <div key={v.vin} className="bg-white border border-[#DEE2E6] rounded-lg shadow-sm overflow-hidden">
                <img src={v.img} alt={v.model} className="w-full h-40 object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{v.model}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{v.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">VIN: {v.vin}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Dealer: {v.dealer}</span>
                    <span>{v.days} days</span>
                  </div>
                  <div className="pt-2 flex items-center justify-end space-x-2 text-sm">
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                    <button className="text-indigo-600 hover:text-indigo-800">Update</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Turnover is placed above the list (compact card) */}
      </div>
    </Layout>
  );
};

export default ManagerVehicleList;


