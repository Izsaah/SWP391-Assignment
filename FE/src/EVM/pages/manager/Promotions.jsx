import React, { useMemo, useState, useCallback } from 'react'
import Modal from '../../components/Modal'

const grid = { display: 'grid', gap: 16 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const button = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const cell = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee' }

const Promotions = () => {
  const [rows, setRows] = useState([
    { id: 101, dealer: 'Dealer A', name: 'Q4 Volume Discount', type: 'Discount', value: '5%', active: true, from: '2025-10-01', to: '2025-12-31' },
    { id: 102, dealer: 'Dealer B', name: 'Launch Promo', type: 'Rebate', value: '$1,000', active: true, from: '2025-09-01', to: '2025-11-30' },
    { id: 103, dealer: 'Dealer A', name: 'Old Stock Clearance', type: 'Discount', value: '8%', active: false, from: '2025-07-01', to: '2025-08-31' }
  ])
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('dealer')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ dealer: 'Dealer A', name: '', type: 'Discount', value: '5%', from: '2025-10-01', to: '2025-12-31' })
  const [editing, setEditing] = useState(null)

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
  const handleDisable = useCallback(async (row) => { const ok = window.confirm(`Disable promotion ${row.name}?`); if (ok) setRows(prev => prev.map(p => p.id === row.id ? { ...p, active: false } : p)) }, [])

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Promotions</h2>
          <div style={{color: '#6b7280'}}>Wholesale prices, discounts and dealer promos</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <input placeholder="Search promotions..." value={query} onChange={(e) => setQuery(e.target.value)} style={input} />
          <select value={dealer} onChange={(e) => setDealer(e.target.value)} style={{...input, minWidth: 140}}>
            <option>All</option>
            <option>Dealer A</option>
            <option>Dealer B</option>
          </select>
          <button style={button} onClick={handleCreate}>Create promotion</button>
          <button style={{...button, background: '#0ea5e9'}} onClick={() => { const header = 'Dealer,Name,Type,Value,Active,From,To\n'; const body = filtered.map(p => [p.dealer, p.name, p.type, p.value, p.active, p.from, p.to].join(',')).join('\n'); const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'promotions.csv'; a.click(); URL.revokeObjectURL(url) }}>Export CSV</button>
        </div>
      </div>

      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={cell} onClick={() => toggleSort('dealer')}>Dealer</th>
              <th style={cell} onClick={() => toggleSort('name')}>Name</th>
              <th style={cell} onClick={() => toggleSort('type')}>Type</th>
              <th style={cell} onClick={() => toggleSort('value')}>Value</th>
              <th style={cell} onClick={() => toggleSort('from')}>From</th>
              <th style={cell} onClick={() => toggleSort('to')}>To</th>
              <th style={cell} onClick={() => toggleSort('active')}>Status</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(p => (
              <tr key={p.id}>
                <td style={cell}>{p.dealer}</td>
                <td style={cell}>{p.name}</td>
                <td style={cell}>{p.type}</td>
                <td style={cell}>{p.value}</td>
                <td style={cell}>{p.from}</td>
                <td style={cell}>{p.to}</td>
                <td style={cell}>
                  <span style={{padding: '2px 8px', borderRadius: 12, background: p.active ? '#e6f4ea' : '#fdeaea', color: p.active ? '#18794e' : '#b42318'}}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={cell}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={{padding: '6px 10px', border: '1px solid #0d6efd', color: '#0d6efd', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleEdit(p)}>Edit</button>
                    <button style={{padding: '6px 10px', border: '1px solid #b42318', color: '#b42318', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleDisable(p)}>Disable</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
          <div style={{color: '#64748b', fontSize: 12}}>Page {page} of {totalPages} • Total {filtered.length}</div>
          <div style={{display: 'flex', gap: 8}}>
            <button onClick={() => setPage(p=>Math.max(1, p-1))} disabled={page===1} style={{padding: '6px 10px', border: '1px solid #64748b', color: '#475569', background: 'transparent', borderRadius: 6, cursor: 'pointer', opacity: page===1?0.5:1}}>Prev</button>
            <button onClick={() => setPage(p=>Math.min(totalPages, p+1))} disabled={page===totalPages} style={{padding: '6px 10px', border: '1px solid #64748b', color: '#475569', background: 'transparent', borderRadius: 6, cursor: 'pointer', opacity: page===totalPages?0.5:1}}>Next</button>
          </div>
        </div>
      </div>

      <Modal title="Create Promotion" open={showCreate} onClose={() => setShowCreate(false)} onSubmit={() => { const id = Math.max(100, ...rows.map(r=>r.id)) + 1; setRows(prev => [...prev, { id, ...form, active: true }]); setShowCreate(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Dealer" value={form.dealer} onChange={(e)=>setForm(f=>({...f, dealer: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Type" value={form.type} onChange={(e)=>setForm(f=>({...f, type: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Value" value={form.value} onChange={(e)=>setForm(f=>({...f, value: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="From (YYYY-MM-DD)" value={form.from} onChange={(e)=>setForm(f=>({...f, from: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="To (YYYY-MM-DD)" value={form.to} onChange={(e)=>setForm(f=>({...f, to: e.target.value}))} />
        </div>
      </Modal>

      <Modal title={`Edit Promotion #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p)); setShowEdit(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Dealer" value={form.dealer} onChange={(e)=>setForm(f=>({...f, dealer: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Type" value={form.type} onChange={(e)=>setForm(f=>({...f, type: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Value" value={form.value} onChange={(e)=>setForm(f=>({...f, value: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="From (YYYY-MM-DD)" value={form.from} onChange={(e)=>setForm(f=>({...f, from: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="To (YYYY-MM-DD)" value={form.to} onChange={(e)=>setForm(f=>({...f, to: e.target.value}))} />
        </div>
      </Modal>
    </div>
  )
}

export default Promotions


