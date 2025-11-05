import React, { useMemo, useState } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'

const InventoryReport = () => {
  const [model, setModel] = useState('All')
  const [period, setPeriod] = useState('Last 30 days')

  const [rows, setRows] = useState([])

  const filtered = useMemo(() => rows.filter(r => model === 'All' || r.model === model), [rows, model])

  const totalStock = useMemo(() => filtered.reduce((s, r) => s + r.stock, 0), [filtered])
  const totalSold = useMemo(() => filtered.reduce((s, r) => s + r.sold, 0), [filtered])
  const rate = useMemo(() => totalStock ? Math.round((totalSold / (totalStock + totalSold)) * 100) : 0, [totalStock, totalSold])
  const forecast = useMemo(() => Math.round(totalSold * 1.1), [totalSold])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory & Consumption</h1>
            <p className="text-sm text-gray-600 mt-1">Track stock levels and sell-through rate</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All</option>
              <option>Model 3</option>
              <option>Model S</option>
              <option>E-Urban</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Total Stock</div>
          <div className="text-3xl font-bold text-gray-900">{totalStock}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Total Sold</div>
          <div className="text-3xl font-bold text-gray-900">{totalSold}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Consumption Rate</div>
          <div className="text-3xl font-bold text-gray-900">{rate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">Forecast (next period)</div>
          <div className="text-3xl font-bold text-gray-900">{forecast}</div>
        </div>
      </div>

      {/* Models Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-sm font-semibold text-gray-900 mb-4">Models Breakdown</div>
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.model}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">{r.model}</span>
                <span className="text-sm text-gray-600">Stock {r.stock} • Sold {r.sold}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300" 
                  style={{ width: `${(r.sold / (r.stock + r.sold)) * 100}%` }}
                />
              </div>
              {r.stock <= 5 && (
                <div className="mt-2 flex items-center text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning: Near out-of-stock
                </div>
              )}
              {r.stock > 0 && r.stock >= 50 && (
                <div className="mt-2 flex items-center text-sm text-red-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Warning: Long-term inventory risk
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InventoryReport
