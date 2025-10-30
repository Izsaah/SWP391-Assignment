import React, { useMemo, useState, useCallback } from 'react'
import Modal from '../../components/Modal'

const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const toolbarStyle = { display: 'flex', gap: 8 }
const cardStyle = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const inputStyle = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const buttonPrimary = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const buttonGhost = { padding: '8px 12px', background: 'transparent', color: '#0d6efd', border: '1px solid #0d6efd', borderRadius: 6, cursor: 'pointer' }
const tableStyle = { width: '100%', borderCollapse: 'collapse' }
const thtd = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee', cursor: 'pointer' }

const VehicleModels = () => {
  const [rows, setRows] = useState([
    { id: 1, name: 'Model 3', brand: 'EVM', description: 'Compact EV sedan', year: 2024, variants: 3, active: true },
    { id: 2, name: 'Model S', brand: 'EVM', description: 'Performance EV', year: 2025, variants: 2, active: true },
    { id: 3, name: 'E-Urban', brand: 'Neo', description: 'City commuter', year: 2023, variants: 1, active: false }
  ])
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ name: '', brand: 'EVM', year: 2025 })
  const [editing, setEditing] = useState(null)

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

  const handleAdd = useCallback(() => { setForm({ name: '', brand: 'EVM', year: 2025 }); setShowAdd(true) }, [])
  const handleEdit = useCallback((row) => { setEditing(row); setForm({ name: row.name, brand: row.brand, year: row.year }); setShowEdit(true) }, [])
  const handleDelete = useCallback((row) => { if (window.confirm(`Delete model ${row.name}?`)) setRows(prev => prev.filter(r => r.id !== row.id)) }, [])

  return (
    <div style={{display: 'grid', gap: 16}}>
      <div style={headerStyle}>
        <div>
          <h2 style={{margin: 0}}>Vehicle Models</h2>
          <div style={{color: '#6b7280'}}>Manage model catalog and lifecycle</div>
        </div>
        <div style={toolbarStyle}>
          <input placeholder="Search models..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} style={inputStyle} />
          <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{...inputStyle, minWidth: 140}}>
            <option>All</option>
            <option>EVM</option>
            <option>Neo</option>
          </select>
          <button style={buttonPrimary} onClick={handleAdd}>Add model</button>
        </div>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtd} onClick={() => toggleSort('id')}>ID</th>
              <th style={thtd} onClick={() => toggleSort('name')}>Name {sortKey==='name' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
              <th style={thtd} onClick={() => toggleSort('brand')}>Brand</th>
              <th style={thtd} onClick={() => toggleSort('variants')}>Variants</th>
              <th style={thtd} onClick={() => toggleSort('active')}>Status</th>
              <th style={thtd}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(row => (
              <tr key={row.id}>
                <td style={thtd}>{row.id}</td>
                <td style={thtd}>{row.name}</td>
                <td style={thtd}>{row.brand}</td>
                <td style={thtd}>{row.variants}</td>
                <td style={thtd}>
                  <span style={{padding: '2px 8px', borderRadius: 12, background: row.active ? '#e6f4ea' : '#fdeaea', color: row.active ? '#18794e' : '#b42318'}}>
                    {row.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={thtd}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={buttonGhost} onClick={() => handleEdit(row)}>Edit</button>
                    <button style={{...buttonGhost, color: '#b42318', borderColor: '#b42318'}} onClick={() => handleDelete(row)}>Delete</button>
                    <button style={{...buttonGhost}} onClick={() => setRows(prev => prev.map(r => r.id === row.id ? { ...r, active: !r.active } : r))}>{row.active ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
          <div style={{color: '#64748b', fontSize: 12}}>Page {page} of {totalPages} • Total {sorted.length}</div>
          <div style={{display: 'flex', gap: 8}}>
            <button disabled={page===1} onClick={() => setPage(p=>Math.max(1, p-1))} style={{...buttonGhost, opacity: page===1?0.5:1}}>Prev</button>
            <button disabled={page===totalPages} onClick={() => setPage(p=>Math.min(totalPages, p+1))} style={{...buttonGhost, opacity: page===totalPages?0.5:1}}>Next</button>
          </div>
        </div>
      </div>

      <Modal title="Add Model" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={() => { const id = Math.max(0, ...rows.map(r=>r.id)) + 1; setRows(prev => [...prev, { id, name: form.name, brand: form.brand, year: parseInt(form.year, 10), variants: 0, active: true }]); setShowAdd(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Model name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Brand" value={form.brand} onChange={(e)=>setForm(f=>({...f, brand: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Year" type="number" value={form.year} onChange={(e)=>setForm(f=>({...f, year: e.target.value}))} />
        </div>
      </Modal>

      <Modal title={`Edit Model #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(r => r.id === editing.id ? { ...r, name: form.name, brand: form.brand, year: parseInt(form.year, 10) } : r)); setShowEdit(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Model name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Brand" value={form.brand} onChange={(e)=>setForm(f=>({...f, brand: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Year" type="number" value={form.year} onChange={(e)=>setForm(f=>({...f, year: e.target.value}))} />
        </div>
      </Modal>
    </div>
  )
}

export default VehicleModels


