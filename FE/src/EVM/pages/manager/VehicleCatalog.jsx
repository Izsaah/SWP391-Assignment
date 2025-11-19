import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Car, Palette, Plus, Search, Edit2, Trash2, Power, PowerOff, ChevronLeft, ChevronDown } from 'lucide-react'
import Modal from '../../modals/Modal'
import ConfirmModal from '../../modals/ConfirmModal'
import SuccessModal from '../../modals/SuccessModal'
import {
  fetchVehicleModels,
  createVehicleModel,
  updateVehicleModel,
  enableVehicleModel,
  disableVehicleModel,
  fetchVehicleVariants,
  createVehicleVariant,
  updateVehicleVariant,
  enableVehicleVariant,
  disableVehicleVariant
} from '../../services/vehicleCatalogService'

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
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [form, setForm] = useState({ name: '', year: 2025, description: '' })
  const [editing, setEditing] = useState(null)
  const [deletingModel, setDeletingModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch models from API
  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchVehicleModels()
      
      if (result.success && result.data) {
        // Transform backend data to frontend format
        const models = (result.data || []).map(model => {
          return {
            id: model.modelId,
            name: model.modelName,
            description: model.description,
            year: 2025,
            variants: model.lists ? model.lists.length : 0,
            active: model.isActive
          };
        })
        setRows(models)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      alert(error.message || 'Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])


  const filtered = useMemo(() => rows.filter(m =>
    (!query || m.name.toLowerCase().includes(query.toLowerCase()))
  ), [rows, query])

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

  const handleAdd = () => { setForm({ name: '', year: 2025, description: '' }); setShowAdd(true) }
  const handleEdit = (row) => { setEditing(row); setForm({ name: row.name, year: row.year, description: row.description || '' }); setShowEdit(true) }
  const handleDelete = (row) => { setDeletingModel(row); setShowDeleteModal(true) }
  const handleToggleStatus = async (row) => {
    try {
      const modelId = parseInt(row.id, 10)
      
      if (isNaN(modelId)) {
        setSuccessMessage('Invalid model ID')
        setShowSuccessModal(true)
        return
      }
      
      const result = row.active 
        ? await disableVehicleModel(modelId)
        : await enableVehicleModel(modelId)
      
      if (result.success) {
        // Fetch lại models sau khi toggle thành công
        await fetchModels()
        setSuccessMessage(result.message || (row.active ? 'Deactivated successfully' : 'Activated successfully'))
        setShowSuccessModal(true)
      } else {
        setSuccessMessage(result.message || 'Failed to change status')
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error toggling model status:', error)
      setSuccessMessage(error.message || 'Failed to change status')
      setShowSuccessModal(true)
    }
  }
  const confirmDelete = async () => {
    if (!deletingModel) return
    
    try {
      const modelId = parseInt(deletingModel.id, 10)
      
      if (isNaN(modelId)) {
        setSuccessMessage('Invalid model ID')
        setShowSuccessModal(true)
        return
      }
      
      const result = await disableVehicleModel(modelId)
      
      if (result.success) {
        // Fetch lại models sau khi delete thành công
        await fetchModels()
        setShowDeleteModal(false)
        setDeletingModel(null)
        setSuccessMessage(result.message || 'Deleted successfully')
        setShowSuccessModal(true)
      } else {
        setSuccessMessage(result.message || 'Failed to delete')
        setShowSuccessModal(true)
        // Vẫn fetch lại để refresh UI
        await fetchModels()
        setShowDeleteModal(false)
        setDeletingModel(null)
      }
    } catch (error) {
      console.error('Error deleting model:', error)
      setSuccessMessage(error.message || 'Failed to delete')
      setShowDeleteModal(false)
      setDeletingModel(null)
      setShowSuccessModal(true)
      // Vẫn fetch lại để refresh UI
      await fetchModels()
    }
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
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
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
                      <button onClick={() => handleToggleStatus(row)} className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
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

      <Modal 
        title="Add Model" 
        open={showAdd} 
        onClose={() => setShowAdd(false)} 
        onSubmit={async () => {
          if (!form.name || !form.description) {
            setSuccessMessage('Please fill in all required fields')
            setShowSuccessModal(true)
            return
          }
          
          try {
            const result = await createVehicleModel({
              model_name: form.name,
              description: form.description || ''
            })
            
            if (result.success) {
              // Fetch lại models sau khi create thành công
              await fetchModels()
              setShowAdd(false)
              setSuccessMessage(result.message || 'Created successfully')
              setShowSuccessModal(true)
            } else {
              setSuccessMessage(result.message || 'Failed to create')
              setShowSuccessModal(true)
            }
          } catch (error) {
            console.error('Error creating model:', error)
            setSuccessMessage(error.message || 'Failed to create')
            setShowSuccessModal(true)
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Description" rows="3" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Year" type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal 
        title={`Edit Model #${editing?.id || ''}`} 
        open={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSubmit={async () => {
          if (!editing) return
          
          try {
            const result = await updateVehicleModel({
              model_id: editing.id,
              model_name: form.name,
              description: form.description || ''
            })
            
            if (result.success) {
              // Fetch lại models sau khi update thành công
              await fetchModels()
              setShowEdit(false)
              setSuccessMessage(result.message || 'Updated successfully')
              setShowSuccessModal(true)
            } else {
              setSuccessMessage(result.message || 'Failed to update')
              setShowSuccessModal(true)
            }
          } catch (error) {
            console.error('Error updating model:', error)
            setSuccessMessage(error.message || 'Failed to update')
            setShowSuccessModal(true)
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Name <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Model name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Description" rows="3" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
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

      <SuccessModal 
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
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
  const [form, setForm] = useState({ modelId: '', version: '', color: 'White', price: 30000 })
  const [editing, setEditing] = useState(null)
  const [deletingVariant, setDeletingVariant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [models, setModels] = useState([]) // Danh sách models để hiển thị trong dropdown
  const [showAddModel, setShowAddModel] = useState(false) // Modal để tạo model mới
  const [newModelForm, setNewModelForm] = useState({ name: '', description: '' })

  // Fetch models để hiển thị trong dropdown
  const fetchModels = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const modelsResponse = await axios.post(`${API_URL}/EVM/viewVehicleForEVM`, { _empty: true }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (modelsResponse.data && modelsResponse.data.status === 'success' && modelsResponse.data.data) {
        const modelsList = modelsResponse.data.data.map(model => ({
          id: model.modelId,
          name: model.modelName,
          description: model.description,
          isActive: model.isActive
        }))
        setModels(modelsList)
        return modelsList
      }
      return []
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }, [])

  // Load variants from API - Fetch từ models để lấy model name, và fetch variants riêng cho từng model để lấy tất cả (cả inactive)
  const fetchVariants = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Bước 1: Fetch models để lấy danh sách models và model names
      const modelsResponse = await axios.post(`${API_URL}/EVM/viewVehicleForEVM`, { _empty: true }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      console.log('Models API response:', modelsResponse.data)

      if (modelsResponse.data && modelsResponse.data.status === 'success' && modelsResponse.data.data) {
        const modelsData = modelsResponse.data.data || []
        const modelsMap = new Map()
        const allVariants = []
        
        // Create map model_id -> modelName and update state models
        const modelsList = modelsData.map(model => ({
          id: model.modelId,
          name: model.modelName,
          description: model.description,
          isActive: model.isActive
        }))
        setModels(modelsList)
        
        modelsData.forEach(model => {
          modelsMap.set(model.modelId, model.modelName || 'N/A')
        })
        
        // Bước 2: Fetch variants cho từng model (bao gồm cả inactive)
        for (const model of modelsData) {
          try {
            const variantsResponse = await axios.post(`${API_URL}/EVM/viewVehicleVariant`, {
              model_id: model.modelId
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              }
            })
            
            if (variantsResponse.data && variantsResponse.data.status === 'success' && variantsResponse.data.data) {
              const variants = variantsResponse.data.data || []
              variants.forEach(variant => {
                // Normalize color: trim và đảm bảo format nhất quán
                let normalizedColor = (variant.color || '').trim()
                // Chuyển chữ cái đầu thành hoa nếu cần (đỏ -> Đỏ)
                if (normalizedColor && normalizedColor.length > 0) {
                  normalizedColor = normalizedColor.charAt(0).toUpperCase() + normalizedColor.slice(1).toLowerCase()
                }
                
                const modelId = variant.modelId || model.modelId;
                const variantId = variant.variantId;
                
                allVariants.push({
                  id: variant.variantId,
                  modelId: modelId,
                  model: modelsMap.get(modelId) || 'N/A',
                  version: variant.versionName || '',
                  color: normalizedColor,
                  price: variant.price || 0,
                  active: variant.isActive !== undefined ? variant.isActive : true
                })
              })
            }
          } catch (error) {
            console.error(`Error fetching variants for model ${model.modelId}:`, error)
          }
        }
        
        console.log('All variants (including inactive):', allVariants)
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
    fetchModels() // Fetch models để hiển thị trong dropdown
    fetchVariants()
  }, [fetchModels, fetchVariants])

  // Mapping: Vietnamese (from DB) -> English (for display)
  const colorToEnglish = useMemo(() => ({
    'Trắng': 'White',
    'Xanh dương': 'Blue',
    'Đỏ': 'Red',
    'Đen': 'Black',
    'Bạc': 'Silver',
    'trắng': 'White',
    'xanh dương': 'Blue',
    'đỏ': 'Red',
    'đen': 'Black',
    'bạc': 'Silver'
  }), [])

  // Mapping: English (from filter) -> Vietnamese (for DB query)
  const colorToVietnamese = useMemo(() => ({
    'White': 'Trắng',
    'Blue': 'Xanh dương',
    'Red': 'Đỏ',
    'Black': 'Đen',
    'Silver': 'Bạc'
  }), [])
  
  // Convert color from Vietnamese (DB) to English (display)
  const getDisplayColor = (color) => {
    if (!color) return color
    return colorToEnglish[color] || color
  }
  
  // Lấy danh sách màu động từ data (bao gồm cả màu mới được thêm vào)
  const availableColors = useMemo(() => {
    const colorSet = new Set()
    rows.forEach(variant => {
      if (variant.color && variant.color.trim()) {
        colorSet.add(variant.color.trim())
      }
    })
    
    // Sort and return color list
    const colors = Array.from(colorSet).sort()
    
    // Map known colors to English, keep new colors as is
    const mappedColors = colors.map(c => {
      const english = colorToEnglish[c] || c
      return { vietnamese: c, english: english }
    })
    
    return mappedColors
  }, [rows, colorToEnglish])

  const filtered = useMemo(() => {
    // Create reverse mapping: Vietnamese -> English for search
    const reverseColorMapping = {
      'trắng': 'white',
      'xanh dương': 'blue',
      'đỏ': 'red',
      'đen': 'black',
      'bạc': 'silver',
      'Trắng': 'white',
      'Xanh dương': 'blue',
      'Đỏ': 'red',
      'Đen': 'black',
      'Bạc': 'silver'
    }
    
    return rows.filter(v => {
      // Search query: tìm trong model, version, color (cả tiếng Anh và tiếng Việt)
      let queryMatch = true
      if (query) {
        const searchText = query.toLowerCase().trim()
        const modelText = (v.model || '').toLowerCase()
        const versionText = (v.version || '').toLowerCase()
        const colorText = (v.color || '').toLowerCase()
        
        // Kiểm tra trực tiếp trong các field
        const directMatch = modelText.includes(searchText) || 
                           versionText.includes(searchText) || 
                           colorText.includes(searchText)
        
        // Kiểm tra reverse mapping: nếu user search "red" hoặc "đỏ", tìm cả hai
        const reverseMapped = reverseColorMapping[searchText]
        const mappedMatch = reverseMapped && (
          colorText.includes(reverseMapped) || 
          colorText.includes(searchText)
        )
        
        queryMatch = directMatch || mappedMatch || false
      }
      
      // Color filter: so sánh không phân biệt hoa thường
      let colorMatch = true
      if (color !== 'All') {
        const variantColor = (v.color || '').trim().toLowerCase()
        const filterColor = (color || '').trim().toLowerCase()
        
        // Check if color filter is English, convert to Vietnamese for comparison
        const mappedColor = colorToVietnamese[color] // Get Vietnamese color from English filter
        const mappedColorLower = mappedColor ? (mappedColor || '').trim().toLowerCase() : null
        
        // Compare with:
        // 1. Mapped color (Vietnamese) if exists
        // 2. Original color (English) from filter
        // 3. Directly with variant color (for new colors not in mapping)
        colorMatch = variantColor === mappedColorLower || 
                    variantColor === filterColor ||
                    variantColor.includes(filterColor) ||
                    filterColor.includes(variantColor)
      }
      
      return queryMatch && colorMatch
    })
  }, [rows, query, color, colorToVietnamese])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  const handleAdd = async () => {
    // Fetch models trước khi mở modal để đảm bảo có danh sách models mới nhất
    const modelsList = await fetchModels()
    const activeModels = modelsList.filter(m => m.isActive)
    setForm({ modelId: activeModels.length > 0 ? activeModels[0].id.toString() : '', version: '', color: 'White', price: 30000 })
    setShowAdd(true)
  }
  const handleEdit = async (row) => {
    // Fetch models trước khi mở modal để đảm bảo có danh sách models mới nhất
    await fetchModels()
    setEditing(row)
    setForm({ 
      modelId: row.modelId ? row.modelId.toString() : '', 
      version: row.version || '', 
      color: row.color || '', 
      price: row.price || 0
    })
    setShowEdit(true)
  }
  const handleDelete = (row) => { setDeletingVariant(row); setShowDeleteModal(true) }
  const handleToggleStatus = async (row) => {
    try {
      const token = localStorage.getItem('token')
      const variantId = parseInt(row.id, 10)
      
      if (isNaN(variantId)) {
        setSuccessMessage('Invalid variant ID')
        setShowSuccessModal(true)
        return
      }
      
      const endpoint = row.active 
        ? `${API_URL}/EVM/disableVehicleVariant`
        : `${API_URL}/EVM/enableVehicleVariant`
      
      const response = await axios.post(endpoint, {
        variant_id: variantId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })
      
      if (response.data && response.data.status === 'success') {
        // Fetch lại variants sau khi toggle thành công
        await fetchVariants()
        setSuccessMessage(row.active ? 'Deactivated successfully' : 'Activated successfully')
        setShowSuccessModal(true)
      } else {
        setSuccessMessage(response.data?.message || 'Failed to change status')
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error toggling variant status:', error)
      setSuccessMessage(error.response?.data?.message || 'Thay đổi trạng thái thất bại')
      setShowSuccessModal(true)
    }
  }
  const confirmDelete = async () => {
    if (!deletingVariant) return
    
    try {
      const token = localStorage.getItem('token')
      const variantId = parseInt(deletingVariant.id, 10)
      
      if (isNaN(variantId)) {
        setSuccessMessage('Invalid variant ID')
        setShowSuccessModal(true)
        return
      }
      
      console.log('Deleting variant with ID:', variantId)
      
      const response = await axios.post(`${API_URL}/EVM/disableVehicleVariant`, {
        variant_id: variantId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })
      
      console.log('Delete response:', response.data)
      
      if (response.data && response.data.status === 'success') {
        // Fetch lại variants sau khi delete thành công
        await fetchVariants()
        setShowDeleteModal(false)
        setDeletingVariant(null)
        setSuccessMessage('Deleted successfully')
        setShowSuccessModal(true)
      } else {
        setSuccessMessage(response.data?.message || 'Failed to delete')
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error deleting variant:', error)
      console.error('Error response:', error.response?.data)
      
      // Backend trả về 400 với error response
      if (error.response?.status === 400 && error.response?.data) {
        const errorMsg = error.response.data.message || 'Cannot delete this variant'
        setSuccessMessage(errorMsg)
        // Vẫn fetch lại để refresh UI (có thể variant đã bị xóa bởi người khác)
        await fetchVariants()
      } else {
        setSuccessMessage(error.response?.data?.message || error.message || 'Failed to delete')
      }
      
      setShowDeleteModal(false)
      setDeletingVariant(null)
      setShowSuccessModal(true)
    }
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
            <option value="All">All</option>
            {availableColors.map(colorOption => (
              <option key={colorOption.vietnamese} value={colorOption.english}>
                {colorOption.english}
              </option>
            ))}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getDisplayColor(v.color)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {v.price ? new Intl.NumberFormat('vi-VN').format(v.price) + ' ₫' : '0 ₫'}
                  </td>
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
                      <button onClick={() => handleToggleStatus(v)} className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1">
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

      <Modal 
        title="Add Variant" 
        open={showAdd} 
        onClose={() => setShowAdd(false)} 
        onSubmit={async () => {
          if (!form.modelId || !form.version || !form.color || !form.price) {
            setSuccessMessage('Please fill in all required fields')
            setShowSuccessModal(true)
            return
          }
          
          const modelIdInt = parseInt(form.modelId, 10)
          if (isNaN(modelIdInt) || modelIdInt <= 0) {
            setSuccessMessage('Please select a valid model')
            setShowSuccessModal(true)
            return
          }
          
          try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_URL}/EVM/createVehicleVariant`, {
              model_id: modelIdInt,
              version_name: form.version,
              color: form.color,
              image: '', // Image field removed
              price: parseFloat(form.price)
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              }
            })
            
            if (response.data && response.data.status === 'success') {
              // Fetch lại variants và models sau khi create thành công
              await fetchModels()
              await fetchVariants()
              setShowAdd(false)
              setSuccessMessage('Created successfully')
              setShowSuccessModal(true)
            } else {
              setSuccessMessage(response.data?.message || 'Failed to create')
              setShowSuccessModal(true)
            }
          } catch (error) {
            console.error('Error creating variant:', error)
            setSuccessMessage(error.response?.data?.message || 'Failed to create')
            setShowSuccessModal(true)
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model <span className="text-red-500">*</span></label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.modelId} 
              onChange={(e) => setForm(f => ({ ...f, modelId: e.target.value }))}
            >
              <option value="">Select a model</option>
              {models.filter(m => m.isActive).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
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

      <Modal 
        title={`Edit Variant #${editing?.id || ''}`} 
        open={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSubmit={async () => {
          if (!editing) return
          
          if (!form.modelId || !form.version || !form.color || !form.price) {
            setSuccessMessage('Please fill in all required fields')
            setShowSuccessModal(true)
            return
          }
          
          const modelIdInt = parseInt(form.modelId, 10)
          if (isNaN(modelIdInt) || modelIdInt <= 0) {
            setSuccessMessage('Please select a valid model')
            setShowSuccessModal(true)
            return
          }
          
          try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_URL}/EVM/updateVehicleVariant`, {
              variant_id: editing.id,
              model_id: modelIdInt,
              version_name: form.version,
              color: form.color,
              image: '', // Image field removed
              price: parseFloat(form.price)
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              }
            })
            
            if (response.data && response.data.status === 'success') {
              // Fetch lại variants và models sau khi update thành công
              await fetchModels()
              await fetchVariants()
              setShowEdit(false)
              setSuccessMessage('Cập nhật thành công')
              setShowSuccessModal(true)
            } else {
              setSuccessMessage(response.data?.message || 'Cập nhật thất bại')
              setShowSuccessModal(true)
            }
          } catch (error) {
            console.error('Error updating variant:', error)
            setSuccessMessage(error.response?.data?.message || 'Cập nhật thất bại')
            setShowSuccessModal(true)
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model <span className="text-red-500">*</span></label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.modelId} 
              onChange={(e) => setForm(f => ({ ...f, modelId: e.target.value }))}
            >
              {models.filter(m => m.isActive).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
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

      {/* Modal để tạo Model mới */}
      <Modal 
        title="Create New Model" 
        open={showAddModel} 
        onClose={() => { setShowAddModel(false); setNewModelForm({ name: '', description: '' }) }} 
        onSubmit={async () => {
          if (!newModelForm.name || !newModelForm.description) {
            setSuccessMessage('Please fill in all required fields')
            setShowSuccessModal(true)
            return
          }
          
          try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_URL}/EVM/createVehicleModel`, {
              model_name: newModelForm.name,
              description: newModelForm.description || ''
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
              }
            })
            
            if (response.data && response.data.status === 'success') {
              // Fetch lại models sau khi create thành công
              await fetchModels()
              setShowAddModel(false)
              setNewModelForm({ name: '', description: '' })
              setSuccessMessage('Model created successfully')
              setShowSuccessModal(true)
              
              // Tự động chọn model vừa tạo trong form Add Variant (nếu có modelId trong response)
              // Lưu ý: Backend có thể không trả về modelId, nên sẽ fetch lại và chọn model đầu tiên
              const updatedModels = await fetchModels()
              if (updatedModels.length > 0) {
                // Tìm model mới tạo bằng tên
                const newModel = updatedModels.find(m => m.name === newModelForm.name)
                if (newModel) {
                  setForm(f => ({ ...f, modelId: newModel.id.toString() }))
                }
              }
            } else {
              setSuccessMessage(response.data?.message || 'Failed to create model')
              setShowSuccessModal(true)
            }
          } catch (error) {
            console.error('Error creating model:', error)
            setSuccessMessage(error.response?.data?.message || 'Failed to create model')
            setShowSuccessModal(true)
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên Model <span className="text-red-500">*</span></label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tên Model" value={newModelForm.name} onChange={(e) => setNewModelForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả <span className="text-red-500">*</span></label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Mô tả" rows={3} value={newModelForm.description} onChange={(e) => setNewModelForm(f => ({ ...f, description: e.target.value }))} />
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

      <SuccessModal 
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  )
}
