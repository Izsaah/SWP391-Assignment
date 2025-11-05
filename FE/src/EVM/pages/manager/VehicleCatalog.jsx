import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Car, Palette, Plus, Search, Edit2, Trash2, Power, PowerOff, ChevronLeft, ChevronDown } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL

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
  const [loading, setLoading] = useState(false)

  // Fetch models from API
  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/EVM/viewVehicleForEVM`, { _empty: true }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      // Backend trả về {status: 'success', message: 'success', data: Array}
      if (response.data && response.data.status === 'success' && response.data.data) {
        // Transform backend data to frontend format
        const models = (response.data.data || []).map(model => ({
          id: model.modelId,
          name: model.modelName,
          description: model.description,
          brand: 'EVM',
          year: 2025,
          variants: model.lists ? model.lists.length : 0,
          active: model.isActive
        }))
        setRows(models)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      alert(error.response?.data?.message || 'Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
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
  const confirmDelete = () => {
    if (!deletingModel) return
    setRows(prev => prev.filter(m => m.id !== deletingModel.id))
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No models found
                  </td>
                </tr>
              ) : (
                paged.map(row => (
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
              ))
              )}
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

      <Modal title="Add Model" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={() => { setRows(prev => [...prev, { id: `M-${Date.now()}`, name: form.name, brand: form.brand, year: parseInt(form.year, 10), variants: 0, active: true, description: '' }]); setShowAdd(false) }}>
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

      <Modal title={`Edit Model #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(m => m.id === editing.id ? { ...m, name: form.name, brand: form.brand, year: parseInt(form.year, 10) } : m)); setShowEdit(false) }}>
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

  const [loading, setLoading] = useState(false)

  // Load variants from API - Fetch từ models vì models đã có variants trong lists
  const fetchVariants = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch models (models đã có variants trong lists)
      const modelsResponse = await axios.post(`${API_URL}/EVM/viewVehicleForEVM`, { _empty: true }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      console.log('Models API response for variants:', modelsResponse.data)

      if (modelsResponse.data && modelsResponse.data.status === 'success' && modelsResponse.data.data) {
        const models = modelsResponse.data.data || []
        const allVariants = []
        
        // Extract variants từ mỗi model
        models.forEach(model => {
          if (model.lists && Array.isArray(model.lists) && model.lists.length > 0) {
            model.lists.forEach(variant => {
              allVariants.push({
                id: variant.variantId,
                modelId: variant.modelId || model.modelId,
                model: model.modelName || 'N/A',
                version: variant.versionName || '',
                color: variant.color || '',
                price: variant.price || 0,
                active: variant.isActive !== undefined ? variant.isActive : true
              })
            })
          }
        })
        
        console.log('Extracted variants from models:', allVariants)
        setRows(allVariants)
      } else {
        console.log('Models response not successful:', modelsResponse.data)
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
      console.error('Error details:', error.response?.data)
      alert(error.response?.data?.message || 'Failed to fetch variants')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVariants()
  }, [fetchVariants])

  // Mapping giữa filter (tiếng Anh) và dữ liệu (tiếng Việt)
  const colorMapping = useMemo(() => ({
    'All': 'All',
    'White': 'Trắng',
    'Blue': 'Xanh dương',
    'Red': 'Đỏ',
    'Black': 'Đen',
    'Silver': 'Bạc'
  }), [])

  const filtered = useMemo(() => rows.filter(v => {
    const queryMatch = !query || `${v.model} ${v.version} ${v.color}`.toLowerCase().includes(query.toLowerCase())
    const colorMatch = color === 'All' || v.color === colorMapping[color] || v.color === color
    return queryMatch && colorMatch
  }), [rows, query, color, colorMapping])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  const handleAdd = () => { setForm({ modelId: 1, version: '', color: 'White', price: 30000 }); setShowAdd(true) }
  const handleEdit = (row) => { setEditing(row); setForm({ modelId: row.modelId, version: row.version, color: row.color, price: row.price }); setShowEdit(true) }
  const handleDelete = (row) => { setDeletingVariant(row); setShowDeleteModal(true) }
  const confirmDelete = () => {
    if (!deletingVariant) return
    setRows(prev => prev.filter(v => v.id !== deletingVariant.id))
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
            <option>Black</option>
            <option>Silver</option>
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No variants found
                  </td>
                </tr>
              ) : (
                paged.map(v => (
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
              ))
              )}
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

      <Modal title="Add Variant" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={() => { setRows(prev => [...prev, { id: `V-${Date.now()}`, modelId: parseInt(form.modelId, 10), version: form.version, color: form.color, price: parseInt(form.price, 10), modelName: 'Model', active: true }]); setShowAdd(false) }}>
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

      <Modal title={`Edit Variant #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(v => v.id === editing.id ? { ...v, modelId: parseInt(form.modelId, 10), version: form.version, color: form.color, price: parseInt(form.price, 10) } : v)); setShowEdit(false) }}>
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
