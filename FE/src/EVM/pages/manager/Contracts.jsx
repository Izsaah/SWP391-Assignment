import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Edit2, Eye, ChevronLeft, ChevronDown } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'
import ContractViewModal from '../../components/ContractViewModal'

const API_URL = import.meta.env.VITE_API_URL

const Contracts = () => {
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [showEdit, setShowEdit] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingContract, setViewingContract] = useState(null)
  const [form, setForm] = useState({ debt: 0 })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch contracts from API
  const fetchContracts = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/EVM/dealerSaleRecords`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Backend trả về {status: 'success', message: 'success', data: Array}
      if (response.data && response.data.status === 'success' && response.data.data) {
        // Transform backend data to frontend format
        const contracts = (response.data.data || []).map(record => ({
          id: `C-${record.dealerId || record.id}`,
          dealer: record.dealerName || `Dealer ${record.dealerId || 'A'}`,
          target: record.target || 0,
          achieved: record.achieved || record.sales || 0,
          debt: record.debt || 0,
          status: 'Active'
        }))
        setRows(contracts)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
      alert(error.response?.data?.message || 'Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const filtered = useMemo(() => rows.filter(c =>
    (dealer === 'All' || c.dealer === dealer) &&
    (!query || c.id.toLowerCase().includes(query.toLowerCase()))
  ), [rows, dealer, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
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
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page])
  const toggleSort = (key) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }

  const handleEdit = useCallback(async (row) => { setEditing(row); setForm({ debt: row.debt }); setShowEdit(true) }, [])
  const handleView = useCallback((row) => {
    setViewingContract(row)
    setShowViewModal(true)
  }, [])

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
            <p className="text-sm text-gray-600 mt-1">Revenue targets and receivables by dealer</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <input 
            placeholder="Search contract ID..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('id')}
                >
                  Contract ID
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('dealer')}
                >
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target (units)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
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
                    No contracts found
                  </td>
                </tr>
              ) : (
                paged.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.dealer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.target}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.debt.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.round((c.achieved / Math.max(1, c.target)) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{Math.min(100, Math.round((c.achieved / Math.max(1, c.target)) * 100))}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleView(c)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4 inline" />
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

      <ContractViewModal open={showViewModal} contract={viewingContract} onClose={() => { setShowViewModal(false); setViewingContract(null) }} />

      {/* Edit Modal */}
      <Modal 
        title={`Edit Contract ${editing?.id || ''}`} 
        open={showEdit} 
        onClose={() => setShowEdit(false)} 
        onSubmit={async () => {
          try {
            const token = localStorage.getItem('token')
            await axios.post(
              `${API_URL}/EVM/contracts/${editing.id}/debt`,
              { debt: parseInt(form.debt, 10) },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )
            await fetchContracts()
            setShowEdit(false)
          } catch (error) {
            console.error('Error updating contract debt:', error)
            alert(error.response?.data?.message || 'Failed to update contract debt')
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Debt</label>
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Debt" type="number" value={form.debt} onChange={(e) => setForm(f => ({ ...f, debt: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Contracts
