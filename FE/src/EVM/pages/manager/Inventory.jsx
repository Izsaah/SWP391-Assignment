import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { RefreshCw, Download, TrendingUp, Package, Building2, BarChart3, AlertTriangle, Clock } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'

const API_URL = import.meta.env.VITE_API_URL

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

  const [rows, setRows] = useState([
    { id: '1-1', dealer: 'Dealer A', model: 'Model 3 Standard', variant: 'RWD White', qty: 5, status: 'In Stock', daysInStock: 15 },
    { id: '1-2', dealer: 'Dealer A', model: 'Model 3 Standard', variant: 'RWD Blue', qty: 3, status: 'In Stock', daysInStock: 8 },
    { id: '2-1', dealer: 'Dealer B', model: 'Model Y Long Range', variant: 'AWD Red', qty: 2, status: 'In Stock', daysInStock: 45 },
    { id: '2-2', dealer: 'Dealer B', model: 'Model Y Long Range', variant: 'AWD White', qty: 1, status: 'In Stock', daysInStock: 62 },
    { id: '3-1', dealer: 'Dealer C', model: 'Model 3 Performance', variant: 'AWD Black', qty: 4, status: 'In Stock', daysInStock: 20 },
    { id: '1-3', dealer: 'Dealer A', model: 'Model 3 Standard', variant: 'RWD Black', qty: 7, status: 'In Stock', daysInStock: 12 },
    { id: '2-3', dealer: 'Dealer B', model: 'Model Y Long Range', variant: 'AWD Blue', qty: 6, status: 'In Stock', daysInStock: 30 },
    { id: '3-2', dealer: 'Dealer C', model: 'Model 3 Performance', variant: 'AWD Silver', qty: 3, status: 'In Stock', daysInStock: 18 },
  ])
  const [loading, setLoading] = useState(false)

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No authentication token found. Please login again.')
        return
      }
      
      console.log('Fetching inventory from:', `${API_URL}/EVM/viewInventory`)
      const response = await axios.post(
        `${API_URL}/EVM/viewInventory`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      )

      if (response.data && response.data.success) {
        // Transform backend data to frontend format
        const inventoryList = []
        const backendData = response.data.data || []
        
        backendData.forEach((inventory) => {
          if (inventory.list && Array.isArray(inventory.list)) {
            inventory.list.forEach((model) => {
              if (model.lists && Array.isArray(model.lists)) {
                model.lists.forEach((variant) => {
                  if (variant.quantity > 0) {
                    inventoryList.push({
                      id: `${model.modelId}-${variant.variantId}`,
                      dealer: inventory.dealerName || 'N/A',
                      model: model.modelName || 'N/A',
                      variant: variant.variantName || 'N/A',
                      qty: variant.quantity || 0,
                      status: variant.isActive ? 'In Stock' : 'Out of Stock',
                      daysInStock: variant.daysInStock || 0
                    })
                  }
                })
              }
            })
          }
        })
        
        setRows(inventoryList)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${API_URL}/EVM/viewInventory`,
        message: error.message
      })
      
      let errorMessage = 'Failed to fetch inventory'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect(() => {
  //   fetchInventory()
  // }, [fetchInventory])

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

  const handleRefresh = useCallback(async () => {
    setLastRefreshed(new Date().toLocaleTimeString())
    await fetchInventory()
  }, [fetchInventory])

  const handleAllocate = useCallback((row) => { setSelected(row); setAllocForm({ dealer: 'Dealer B', qty: 1 }); setAllocOpen(true) }, [])
  const handleAdjust = useCallback((row) => { setSelected(row); setAdjustForm({ qty: row.qty }); setAdjustOpen(true) }, [])

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
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No inventory found
                  </td>
                </tr>
              ) : (
                paged.map(r => (
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
              ))
              )}
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
      <Modal title={`Allocate from ${selected?.dealer || ''}`} open={allocOpen} onClose={() => setAllocOpen(false)} onSubmit={() => { setAllocOpen(false) }}>
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
      <Modal title={`Adjust ${selected?.model || ''} ${selected?.variant || ''}`} open={adjustOpen} onClose={() => setAdjustOpen(false)} onSubmit={() => { setRows(prev => prev.map(r => r.id === selected?.id ? { ...r, qty: Math.max(0, parseInt(adjustForm.qty, 10)) } : r)); setAdjustOpen(false) }}>
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
