import React, { useMemo, useState, useCallback } from 'react'
import { ChevronRight, Search, Plus, Edit2, X, UserPlus } from 'lucide-react'

const Users = () => {
  const [role, setRole] = useState('All')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState([
    { id: 'U-100', name: 'Alice Nguyen', dealer: 'Dealer A', role: 'Dealer Admin', status: 'Active' },
    { id: 'U-101', name: 'Bob Tran', dealer: 'Dealer B', role: 'Dealer Staff', status: 'Active' },
    { id: 'U-102', name: 'Carol Vo', dealer: 'Dealer A', role: 'Dealer Staff', status: 'Suspended' }
  ])

  const filtered = useMemo(() => rows.filter(u =>
    (role === 'All' || u.role === role) && (!query || `${u.name} ${u.id}`.toLowerCase().includes(query.toLowerCase()))
  ), [rows, role, query])

  const handleCreate = useCallback(async () => { const name = window.prompt('Name'); const dealer = window.prompt('Dealer', 'Dealer A'); const r = window.prompt('Role', 'Dealer Staff'); if (!name) return; const idNum = Math.max(100, ...rows.map(u => parseInt(u.id.split('-')[1], 10))) + 1; setRows(prev => [...prev, { id: `U-${idNum}`, name, dealer, role: r, status: 'Active' }]) }, [rows])
  const handleEdit = useCallback(async (row) => { const r = window.prompt('New role', row.role) || row.role; setRows(prev => prev.map(u => u.id === row.id ? { ...u, role: r } : u)) }, [])
  const handleDisable = useCallback(async (row) => { const ok = window.confirm(`${row.status === 'Active' ? 'Disable' : 'Activate'} user ${row.name}?`); if (ok) setRows(prev => prev.map(u => u.id === row.id ? { ...u, status: row.status === 'Active' ? 'Suspended' : 'Active' } : u)) }, [])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Users (Dealer Accounts)</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users (Dealer Accounts)</h1>
            <p className="text-sm text-gray-600 mt-1">Create users, assign roles and manage access</p>
          </div>
          <button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create user</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              placeholder="Search user..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All</option>
            <option>Dealer Admin</option>
            <option>Dealer Staff</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.dealer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDisable(u)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users
