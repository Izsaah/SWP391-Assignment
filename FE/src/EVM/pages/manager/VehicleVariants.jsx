import React, { useMemo, useState, useCallback } from 'react'
import { ChevronRight, Plus, Search, Edit2, Trash2, Power, PowerOff, ChevronLeft, ChevronDown } from 'lucide-react'
import Modal from '../../components/Modal'

const VehicleVariants = () => {
  const [rows, setRows] = useState([
    { id: 11, modelId: 1, model: 'Model 3', version: 'Standard', color: 'White', price: 38000, battery: 57, active: true },
    { id: 12, modelId: 1, model: 'Model 3', version: 'Long Range', color: 'Blue', price: 45000, battery: 75, active: true },
    { id: 21, modelId: 2, model: 'Model S', version: 'Performance', color: 'Red', price: 72000, battery: 95, active: false }
  ])
  const [query, setQuery] = useState('')
  const [color, setColor] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ modelId: 1, version: '', color: 'White', price: 30000 })
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => rows.filter(v =>
    (!query || `${v.model} ${v.version}`.toLowerCase().includes(query.toLowerCase())) &&
    (color === 'All' || v.color === color)
  ), [rows, query, color])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  const handleAdd = useCallback(async () => { setForm({ modelId: 1, version: '', color: 'White', price: 30000 }); setShowAdd(true) }, [])
  const handleEdit = useCallback(async (row) => { setEditing(row); setForm({ modelId: row.modelId, version: row.version, color: row.color, price: row.price }); setShowEdit(true) }, [])
  const handleDelete = useCallback(async (row) => { if (window.confirm(`Delete variant ${row.model} ${row.version}?`)) setRows(prev => prev.filter(v => v.id !== row.id)) }, [])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Vehicle Variants</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Variants</h1>
            <p className="text-sm text-gray-600 mt-1">Manage versions, colors and pricing</p>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search variants..." 
              value={query} 
              onChange={(e) => { setQuery(e.target.value); setPage(1) }} 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All</option>
            <option>White</option>
            <option>Blue</option>
            <option>Red</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      v.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(v)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(v)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button 
                        onClick={() => setRows(prev => prev.map(x => x.id === v.id ? { ...x, active: !x.active } : x))}
                        className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                      >
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

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} • Total {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              Next
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal title="Add Variant" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={() => { const id = Math.max(10, ...rows.map(r => r.id)) + 1; const modelName = form.modelId === 1 ? 'Model 3' : (form.modelId === 2 ? 'Model S' : 'Unknown'); setRows(prev => [...prev, { id, modelId: parseInt(form.modelId, 10), model: modelName, version: form.version, color: form.color, price: parseInt(form.price, 10), active: true }]); setShowAdd(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model ID <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Model ID" 
              type="number" 
              value={form.modelId} 
              onChange={(e) => setForm(f => ({ ...f, modelId: parseInt(e.target.value, 10) }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Version" 
              value={form.version} 
              onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Color" 
              value={form.color} 
              onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Price" 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} 
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal title={`Edit Variant #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(v => v.id === editing.id ? { ...v, modelId: parseInt(form.modelId, 10), model: form.modelId === 1 ? 'Model 3' : (form.modelId === 2 ? 'Model S' : 'Unknown'), version: form.version, color: form.color, price: parseInt(form.price, 10) } : v)); setShowEdit(false) }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model ID <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Model ID" 
              type="number" 
              value={form.modelId} 
              onChange={(e) => setForm(f => ({ ...f, modelId: parseInt(e.target.value, 10) }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Version" 
              value={form.version} 
              onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Color" 
              value={form.color} 
              onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Price" 
              type="number" 
              value={form.price} 
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} 
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default VehicleVariants
