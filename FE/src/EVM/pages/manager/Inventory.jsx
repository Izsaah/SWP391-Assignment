import React, { useMemo, useState, useCallback } from 'react'
import { RefreshCw, Download, TrendingUp, Package, Building2, BarChart3, AlertTriangle, Clock } from 'lucide-react'
import Modal from '../../components/Modal'

// Inline API base and helpers for EVM
const API_BASE = (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_EVM_API || import.meta.env?.VITE_API_URL) : undefined)
  || (typeof process !== 'undefined' ? (process.env?.REACT_APP_EVM_API || process.env?.REACT_APP_API_URL) : undefined)
  || ''
const apiGet = async (path) => {
  const url = `${API_BASE}${path}`
  if (!API_BASE) {
    console.error(`[EVM] API_BASE is not set! Please set VITE_EVM_API or VITE_API_URL in .env file. Attempted to fetch: ${path}`)
    return []
  }
  try {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) {
      console.error(`[EVM] API Error: ${res.status} ${res.statusText} for ${url}`)
      return []
    }
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await res.json()
    } else {
      console.error(`[EVM] Expected JSON but got ${contentType} for ${url}`)
      return []
    }
  } catch (error) {
    console.error(`[EVM] Failed to fetch ${url}:`, error)
    return []
  }
}
const apiSend = async (path, method, body) => {
  const url = `${API_BASE}${path}`
  if (!API_BASE) {
    console.error(`[EVM] API_BASE is not set! Please set VITE_EVM_API or VITE_API_URL in .env file. Attempted to send ${method} to: ${path}`)
    throw new Error('API_BASE is not configured')
  }
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body != null ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      console.error(`[EVM] API Error: ${res.status} ${res.statusText} for ${url}`)
      const text = await res.text()
      throw new Error(`API call failed: ${res.status} - ${text.substring(0, 100)}`)
    }
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await res.json()
    } else {
      // For some endpoints, empty response is OK
      return {}
    }
  } catch (error) {
    console.error(`[EVM] Failed to send ${method} ${url}:`, error)
    throw error
  }
}

const Metric = ({ label, value, icon: Icon, iconColor }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-5 h-5 ${iconColor || 'text-gray-600'}`} />
      <TrendingUp className="w-4 h-4 text-green-500" />
    </div>
    <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
)

const Inventory = () => {
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('dealer')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [rows, setRows] = useState([])

  const [allocOpen, setAllocOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [allocForm, setAllocForm] = useState({ dealer: 'Dealer B', qty: 1 })
  const [adjustForm, setAdjustForm] = useState({ qty: 0 })
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const summary = useMemo(() => ({
    totalUnits: rows.reduce((s, r) => s + r.qty, 0),
    dealers: new Set(rows.map(r => r.dealer)).size,
    models: new Set(rows.map(r => r.model)).size
  }), [rows])

  const filtered = useMemo(() => rows.filter(r =>
    (dealer === 'All' || r.dealer === dealer) &&
    (!query || `${r.model} ${r.variant}`.toLowerCase().includes(query.toLowerCase()))
  ), [rows, dealer, query])
  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const fetchInventory = React.useCallback(async () => {
    const data = await apiGet('/evm/inventory')
    setRows(Array.isArray(data) ? data : [])
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => { if (!cancelled) await fetchInventory() })()
    return () => { cancelled = true }
  }, [fetchInventory])

  const handleRefresh = useCallback(async () => {
    await fetchInventory()
    setLastRefreshed(new Date().toLocaleTimeString())
  }, [fetchInventory])

  const handleAllocate = useCallback(async (row) => { setSelected(row); setAllocForm({ dealer: 'Dealer B', qty: 1 }); setAllocOpen(true) }, [])
  const handleAdjust = useCallback(async (row) => { setSelected(row); setAdjustForm({ qty: row.qty }); setAdjustOpen(true) }, [])

  const exportCsv = useCallback(() => {
    const header = 'Dealer,Model,Variant,Quantity,Status,DaysInStock\n'
    const body = filtered.map(r => [r.dealer, r.model, r.variant, r.qty, r.status, r.daysInStock].join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-600 mt-1">Coordinate vehicle stock across dealers</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric label="Total Units" value={summary.totalUnits} icon={Package} />
        <Metric label="Dealers" value={summary.dealers} icon={Building2} />
        <Metric label="Models" value={summary.models} icon={BarChart3} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <input 
            placeholder="Search model/variant..." 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setPage(1) }} 
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <select 
            value={dealer} 
            onChange={(e) => setDealer(e.target.value)} 
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All</option>
            <option>Dealer A</option>
            <option>Dealer B</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {lastRefreshed && (
          <div className="text-xs text-gray-500 px-6 pt-4 mb-2">Last refreshed at {lastRefreshed}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('dealer')}
                >
                  Dealer
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('model')}
                >
                  Model
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('variant')}
                >
                  Variant
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('qty')}
                >
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.dealer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.variant}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{r.qty}</span>
                      {(r.qty <= 2) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low
                        </span>
                      )}
                      {(r.daysInStock >= 60 && r.qty > 0) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Long stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleAllocate(r)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Allocate
                      </button>
                      <button 
                        onClick={() => handleAdjust(r)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} • Total {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Allocate Modal */}
      <Modal title={`Allocate from ${selected?.dealer || ''}`} open={allocOpen} onClose={() => setAllocOpen(false)} onSubmit={async () => { try { const qty = parseInt(allocForm.qty, 10); await apiSend('/evm/inventory/allocate', 'POST', { fromId: selected?.id, toDealer: allocForm.dealer, qty }); await fetchInventory(); setAllocOpen(false) } catch (e) { window.alert(e.message || 'Allocation failed') } }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dealer</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Dealer" 
              value={allocForm.dealer} 
              onChange={(e) => setAllocForm(f => ({ ...f, dealer: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Quantity" 
              type="number" 
              value={allocForm.qty} 
              onChange={(e) => setAllocForm(f => ({ ...f, qty: e.target.value }))} 
            />
          </div>
        </div>
      </Modal>

      {/* Adjust Modal */}
      <Modal title={`Adjust ${selected?.model || ''} ${selected?.variant || ''}`} open={adjustOpen} onClose={() => setAdjustOpen(false)} onSubmit={async () => { await apiSend(`/evm/inventory/${selected?.id}`, 'PATCH', { qty: Math.max(0, parseInt(adjustForm.qty, 10)) }); await fetchInventory(); setAdjustOpen(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Quantity</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="New quantity" 
              type="number" 
              value={adjustForm.qty} 
              onChange={(e) => setAdjustForm({ qty: e.target.value })} 
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Inventory
