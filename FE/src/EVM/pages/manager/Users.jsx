import React, { useMemo, useState, useCallback } from 'react'

const grid = { display: 'grid', gap: 16 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const button = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const cell = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee' }

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

  const handleCreate = useCallback(async () => { const name = window.prompt('Name'); const dealer = window.prompt('Dealer', 'Dealer A'); const r = window.prompt('Role', 'Dealer Staff'); if (!name) return; const idNum = Math.max(100, ...rows.map(u=>parseInt(u.id.split('-')[1],10)))+1; setRows(prev => [...prev, { id: `U-${idNum}`, name, dealer, role: r, status: 'Active' }]) }, [rows])
  const handleEdit = useCallback(async (row) => { const r = window.prompt('New role', row.role) || row.role; setRows(prev => prev.map(u => u.id === row.id ? { ...u, role: r } : u)) }, [])
  const handleDisable = useCallback(async (row) => { const ok = window.confirm(`${row.status === 'Active' ? 'Disable' : 'Activate'} user ${row.name}?`); if (ok) setRows(prev => prev.map(u => u.id === row.id ? { ...u, status: row.status === 'Active' ? 'Suspended' : 'Active' } : u)) }, [])

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Users (Dealers Accounts)</h2>
          <div style={{color: '#6b7280'}}>Create users, assign roles and manage access</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <input placeholder="Search user..." value={query} onChange={(e) => setQuery(e.target.value)} style={input} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{...input, minWidth: 160}}>
            <option>All</option>
            <option>Dealer Admin</option>
            <option>Dealer Staff</option>
          </select>
          <button style={button} onClick={handleCreate}>Create user</button>
        </div>
      </div>

      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={cell}>User ID</th>
              <th style={cell}>Name</th>
              <th style={cell}>Dealer</th>
              <th style={cell}>Role</th>
              <th style={cell}>Status</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={cell}>{u.id}</td>
                <td style={cell}>{u.name}</td>
                <td style={cell}>{u.dealer}</td>
                <td style={cell}>{u.role}</td>
                <td style={cell}>{u.status}</td>
                <td style={cell}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={{padding: '6px 10px', border: '1px solid #0d6efd', color: '#0d6efd', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleEdit(u)}>Edit</button>
                    <button style={{padding: '6px 10px', border: '1px solid #b42318', color: '#b42318', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleDisable(u)}>{u.status === 'Active' ? 'Disable' : 'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users


