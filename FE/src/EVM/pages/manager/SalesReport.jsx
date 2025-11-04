import React, { useMemo, useState } from 'react'
import { Download } from 'lucide-react'

const Bar = ({ label, value, max }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <span className="text-sm text-gray-600">{value}</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 transition-all duration-300" 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
)

const SalesReport = () => {
  const [region, setRegion] = useState('All')
  const [period, setPeriod] = useState('Q4')

  const rows = useMemo(() => ([
    { dealer: 'Dealer A', region: 'North', sales: 38 },
    { dealer: 'Dealer B', region: 'South', sales: 27 },
    { dealer: 'Dealer C', region: 'North', sales: 18 }
  ]), [])

  const filtered = useMemo(() => rows.filter(r => region === 'All' || r.region === region), [rows, region])
  const max = useMemo(() => Math.max(...filtered.map(r => r.sales), 1), [filtered])
  const total = useMemo(() => filtered.reduce((s, r) => s + r.sales, 0), [filtered])

  const exportCsv = () => {
    const header = 'Dealer,Region,Sales\n'
    const body = filtered.map(r => `${r.dealer},${r.region},${r.sales}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-600 mt-1">Sales by region and dealer</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Q1</option>
              <option>Q2</option>
              <option>Q3</option>
              <option>Q4</option>
            </select>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All</option>
              <option>North</option>
              <option>South</option>
            </select>
            <button 
              onClick={exportCsv}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Dealers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Top Dealers</div>
          {filtered.map(r => (
            <Bar key={r.dealer} label={r.dealer} value={r.sales} max={max} />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total sales</span>
              <span className="text-lg font-bold text-gray-900">{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dealers</span>
              <span className="text-lg font-bold text-gray-900">{filtered.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Period</span>
              <span className="text-lg font-bold text-gray-900">{period}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Notes</div>
          <div className="text-sm text-gray-600">
            Use filters to analyze performance by region and quarter.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
