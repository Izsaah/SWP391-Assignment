import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Car, Palette, Plus, Search, Edit2, Trash2, Power, PowerOff, ChevronLeft, ChevronDown } from 'lucide-react'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

// Inline API base and helpers
const API_BASE = (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_EVM_API || import.meta.env?.VITE_API_URL) : undefined)
  || (typeof process !== 'undefined' ? (process.env?.REACT_APP_EVM_API || process.env?.REACT_APP_API_URL) : undefined)
  || ''
// Debug: Log API_BASE on load
if (typeof window !== 'undefined' && !window._API_BASE_LOGGED) {
  console.log('[EVM] API_BASE:', API_BASE || '(empty - check .env file)')
  window._API_BASE_LOGGED = true
}
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

const VehicleCatalog = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // derive initial tab from query param
  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const t = params.get('tab')
    return t === 'variants' ? 'variants' : 'models'
  }, [location.search])

  const [tab, setTab] = useState(initialTab) // models | variants

  // keep URL in sync when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('tab') !== tab) {
      params.set('tab', tab)
      navigate({ pathname: '/evm/vehicle-catalog', search: params.toString() }, { replace: true })
    }
    // only respond to tab changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Catalog</h1>
            <p className="text-sm text-gray-600 mt-1">Manage models and variants in one place</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setTab('models')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium inline-flex items-center gap-2 ${
                tab === 'models' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="w-4 h-4" /> Models
            </button>
            <button
              onClick={() => setTab('variants')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium inline-flex items-center gap-2 ${
                tab === 'variants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Palette className="w-4 h-4" /> Variants
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {tab === 'models' ? <ModelsSection /> : <VariantsSection />}
      </div>
    </div>
  )
}

export default VehicleCatalog


// Models Section (inlined from VehicleModels)
const ModelsSection = () => {
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [form, setForm] = useState({ name: '', brand: 'EVM', year: 2025 })
  const [editing, setEditing] = useState(null)
  const [deletingModel, setDeletingModel] = useState(null)

  // Load models from API
  const fetchModels = React.useCallback(async () => {
    const data = await apiGet('/evm/models')
    setRows(Array.isArray(data) ? data : [])
  }, [])
  React.useEffect(() => {
    let cancelled = false
    ;(async () => { if (!cancelled) await fetchModels() })()
    return () => { cancelled = true }
  }, [fetchModels])

  const filtered = useMemo(() => rows.filter(m =>
    (brand === 'All' || m.brand === brand) &&
    (!query || m.name.toLowerCase().includes(query.toLowerCase()))
  ), [rows, query, brand])

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page])
  const toggleSort = (key) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  const handleAdd = () => { setForm({ name: '', brand: 'EVM', year: 2025 }); setShowAdd(true) }
  const handleEdit = (row) => { setEditing(row); setForm({ name: row.name, brand: row.brand, year: row.year }); setShowEdit(true) }
  const handleDelete = (row) => { setDeletingModel(row); setShowDeleteModal(true) }
  const confirmDelete = async () => {
    if (!deletingModel) return
    await apiSend(`/evm/models/${deletingModel.id}`, 'DELETE')
    await fetchModels()
    setShowDeleteModal(false)
    setDeletingModel(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Models</h1>
            <p className="text-sm text-gray-600 mt-1">Manage model catalog and lifecycle</p>
          </div>
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input placeholder="Search models..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All</option>
            <option>EVM</option>
            <option>Neo</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('id')}>
                  ID {sortKey === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('name')}>
                  Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('brand')}>
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('variants')}>
                  Variants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('active')}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paged.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.variants}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button onClick={() => setRows(prev => prev.map(r => r.id === row.id ? { ...r, active: !r.active } : r))} className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
                        {row.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {row.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {sorted.length}</div>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1">
              Next
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      <Modal title="Add Model" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={async () => { await apiSend('/evm/models', 'POST', { name: form.name, brand: form.brand, year: parseInt(form.year, 10) }); await fetchModels(); setShowAdd(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Brand" value={form.brand} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Year" type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal title={`Edit Model #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={async () => { await apiSend(`/evm/models/${editing.id}`, 'PUT', { name: form.name, brand: form.brand, year: parseInt(form.year, 10) }); await fetchModels(); setShowEdit(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Brand" value={form.brand} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Year" type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDeleteModal && !!deletingModel}
        title="Delete Model"
        description={deletingModel ? (
          <div>
            <p className="text-gray-700 mb-2">Are you sure you want to remove <span className="font-semibold text-gray-900">{deletingModel.name}</span>?</p>
            <p className="text-sm text-gray-500">This will permanently delete the model and all associated data.</p>
          </div>
        ) : ''}
        onCancel={() => { setShowDeleteModal(false); setDeletingModel(null) }}
        onConfirm={confirmDelete}
        confirmText="Delete Model"
        tone="red"
        Icon={Trash2}
      />
    </div>
  )
}

// Variants Section (inlined from VehicleVariants)
const VariantsSection = () => {
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [color, setColor] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [form, setForm] = useState({ modelId: 1, version: '', color: 'White', price: 30000 })
  const [editing, setEditing] = useState(null)
  const [deletingVariant, setDeletingVariant] = useState(null)

  // Load variants from API
  const fetchVariants = React.useCallback(async () => {
    const data = await apiGet('/evm/variants')
    setRows(Array.isArray(data) ? data : [])
  }, [])
  React.useEffect(() => {
    let cancelled = false
    ;(async () => { if (!cancelled) await fetchVariants() })()
    return () => { cancelled = true }
  }, [fetchVariants])

  const filtered = useMemo(() => rows.filter(v =>
    (!query || `${v.model} ${v.version}`.toLowerCase().includes(query.toLowerCase())) &&
    (color === 'All' || v.color === color)
  ), [rows, query, color])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  const handleAdd = () => { setForm({ modelId: 1, version: '', color: 'White', price: 30000 }); setShowAdd(true) }
  const handleEdit = (row) => { setEditing(row); setForm({ modelId: row.modelId, version: row.version, color: row.color, price: row.price }); setShowEdit(true) }
  const handleDelete = (row) => { setDeletingVariant(row); setShowDeleteModal(true) }
  const confirmDelete = async () => {
    if (!deletingVariant) return
    await apiSend(`/evm/variants/${deletingVariant.id}`, 'DELETE')
    await fetchVariants()
    setShowDeleteModal(false)
    setDeletingVariant(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Variants</h1>
            <p className="text-sm text-gray-600 mt-1">Manage versions, colors and pricing</p>
          </div>
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input placeholder="Search variants..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All</option>
            <option>White</option>
            <option>Blue</option>
            <option>Red</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paged.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.color}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${v.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {v.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(v)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button onClick={() => setRows(prev => prev.map(x => x.id === v.id ? { ...x, active: !x.active } : x))} className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
                        {v.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {v.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages} • Total {filtered.length}</div>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1">
              Next
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      <Modal title="Add Variant" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={async () => { await apiSend('/evm/variants', 'POST', { modelId: parseInt(form.modelId, 10), version: form.version, color: form.color, price: parseInt(form.price, 10) }); await fetchVariants(); setShowAdd(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model ID <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model ID" type="number" value={form.modelId} onChange={(e) => setForm(f => ({ ...f, modelId: parseInt(e.target.value, 10) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Version" value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal title={`Edit Variant #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={async () => { await apiSend(`/evm/variants/${editing.id}`, 'PUT', { modelId: parseInt(form.modelId, 10), version: form.version, color: form.color, price: parseInt(form.price, 10) }); await fetchVariants(); setShowEdit(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model ID <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model ID" type="number" value={form.modelId} onChange={(e) => setForm(f => ({ ...f, modelId: parseInt(e.target.value, 10) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Version" value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDeleteModal && !!deletingVariant}
        title="Delete Variant"
        description={deletingVariant ? (
          <div>
            <p className="text-gray-700 mb-2">Are you sure you want to remove <span className="font-semibold text-gray-900">{deletingVariant.model} {deletingVariant.version}</span>?</p>
            <p className="text-sm text-gray-500">This will permanently delete the variant and all associated data.</p>
          </div>
        ) : ''}
        onCancel={() => { setShowDeleteModal(false); setDeletingVariant(null) }}
        onConfirm={confirmDelete}
        confirmText="Delete Variant"
        tone="red"
        Icon={Trash2}
      />
    </div>
  )
}
