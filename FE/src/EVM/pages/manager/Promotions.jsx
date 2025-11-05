import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Plus, Search, Edit2, X, Download, ChevronLeft, ChevronDown } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

const API_URL = import.meta.env.VITE_API_URL

const Promotions = () => {
  const [rows, setRows] = useState([])
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('dealer')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [form, setForm] = useState({ dealer: 'Dealer A', name: '', type: 'Discount', value: '5%', from: '2025-10-01', to: '2025-12-31' })
  const [editing, setEditing] = useState(null)
  const [disablingPromotion, setDisablingPromotion] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch promotions from API
  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/EVM/viewPromotionDealerCount`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Backend trả về {status: 'success', message: 'success', data: Array}
      if (response.data && response.data.status === 'success' && response.data.data) {
        // Transform backend data to frontend format
        const promotions = (response.data.data || []).map(promo => ({
          id: promo.promoId || promo.id,
          dealer: promo.dealerName || 'All Dealers',
          name: promo.description || promo.promoName || 'Promotion',
          type: promo.type || 'Discount',
          value: promo.discountRate ? `${promo.discountRate}%` : '0%',
          from: promo.startDate || '',
          to: promo.endDate || '',
          active: promo.isActive !== undefined ? promo.isActive : true
        }))
        setRows(promotions)
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
      alert(error.response?.data?.message || 'Failed to fetch promotions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  const filtered = useMemo(() => rows.filter(p =>
    (dealer === 'All' || p.dealer === dealer) &&
    (!query || p.name.toLowerCase().includes(query.toLowerCase()))
  ), [rows, dealer, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page])
  const toggleSort = (key) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  const handleCreate = useCallback(async () => { setForm({ dealer: 'Dealer A', name: '', type: 'Discount', value: '5%', from: '2025-10-01', to: '2025-12-31' }); setShowCreate(true) }, [])
  const handleEdit = useCallback(async (row) => { setEditing(row); setForm({ dealer: row.dealer, name: row.name, type: row.type, value: row.value, from: row.from, to: row.to }); setShowEdit(true) }, [])
  const handleDisable = useCallback((row) => {
    setDisablingPromotion(row)
    setShowDisableModal(true)
  }, [])

  const confirmDisable = useCallback(async () => {
    if (!disablingPromotion) return
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/EVM/promotions/${disablingPromotion.id}`,
        { active: false },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      await fetchPromotions()
      setShowDisableModal(false)
      setDisablingPromotion(null)
    } catch (error) {
      console.error('Error disabling promotion:', error)
      alert(error.response?.data?.message || 'Failed to disable promotion')
    }
  }, [disablingPromotion, fetchPromotions])

  const exportCsv = () => {
    const header = 'Dealer,Name,Type,Value,Active,From,To\n'
    const body = filtered.map(p => [p.dealer, p.name, p.type, p.value, p.active, p.from, p.to].join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'promotions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
            <p className="text-sm text-gray-600 mt-1">Wholesale prices, discounts and dealer promos</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create promotion</span>
            </button>
            <button 
              onClick={exportCsv}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search promotions..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
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
                  onClick={() => toggleSort('name')}
                >
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No promotions found
                  </td>
                </tr>
              ) : (
                paged.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.dealer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.to}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDisable(p)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="w-4 h-4 inline" />
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

      {/* Create Modal */}
      <Modal 
        title="Create Promotion" 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSubmit={async () => {
          try {
            const token = localStorage.getItem('token')
            const valueWithoutPercent = form.value.replace('%', '')
            const response = await axios.post(
              `${API_URL}/EVM/promotions`,
              {
                name: form.name,
                type: form.type,
                value: valueWithoutPercent,
                from: form.from,
                to: form.to,
                dealer: form.dealer
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            if (response.data && response.data.success) {
              await fetchPromotions()
              setShowCreate(false)
            } else {
              alert(response.data?.message || 'Failed to create promotion')
            }
          } catch (error) {
            console.error('Error creating promotion:', error)
            alert(error.response?.data?.message || 'Failed to create promotion')
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dealer</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dealer" value={form.dealer} onChange={(e) => setForm(f => ({ ...f, dealer: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Value" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From (YYYY-MM-DD)</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="From (YYYY-MM-DD)" value={form.from} onChange={(e) => setForm(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To (YYYY-MM-DD)</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="To (YYYY-MM-DD)" value={form.to} onChange={(e) => setForm(f => ({ ...f, to: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        title={`Edit Promotion #${editing?.id || ''}`} 
        open={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSubmit={async () => {
          try {
            const token = localStorage.getItem('token')
            const valueWithoutPercent = form.value.replace('%', '')
            const response = await axios.post(
              `${API_URL}/EVM/promotions`,
              {
                id: editing.id,
                name: form.name,
                type: form.type,
                value: valueWithoutPercent,
                from: form.from,
                to: form.to,
                dealer: form.dealer
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            if (response.data && response.data.success) {
              await fetchPromotions()
              setShowEdit(false)
            } else {
              alert(response.data?.message || 'Failed to update promotion')
            }
          } catch (error) {
            console.error('Error updating promotion:', error)
            alert(error.response?.data?.message || 'Failed to update promotion')
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dealer</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dealer" value={form.dealer} onChange={(e) => setForm(f => ({ ...f, dealer: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Value" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From (YYYY-MM-DD)</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="From (YYYY-MM-DD)" value={form.from} onChange={(e) => setForm(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To (YYYY-MM-DD)</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="To (YYYY-MM-DD)" value={form.to} onChange={(e) => setForm(f => ({ ...f, to: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={showDisableModal && !!disablingPromotion}
        title="Disable Promotion"
        description={disablingPromotion ? (
          <div>
            <p className="text-gray-700 mb-2">Are you sure you want to disable <span className="font-semibold text-gray-900">{disablingPromotion.name}</span>?</p>
            <p className="text-sm text-gray-500">The promotion will be deactivated and no longer available for use.</p>
          </div>
        ) : ''}
        onCancel={() => { setShowDisableModal(false); setDisablingPromotion(null) }}
        onConfirm={confirmDisable}
        confirmText="Disable Promotion"
        tone="yellow"
      />
    </div>
  )
}

export default Promotions
