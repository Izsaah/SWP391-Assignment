import React, { useMemo, useState, useCallback } from 'react'
import Modal from '../../components/Modal'

const grid = { display: 'grid', gap: 16 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const button = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const cell = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee' }

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
    <div style={grid}>
      <div style={headerStyle}>
        <div>
          <h2 style={{margin: 0}}>Vehicle Variants</h2>
          <div style={{color: '#6b7280'}}>Manage versions, colors and pricing</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <input placeholder="Search variants..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} style={input} />
          <select value={color} onChange={(e) => setColor(e.target.value)} style={{...input, minWidth: 120}}>
            <option>All</option>
            <option>White</option>
            <option>Blue</option>
            <option>Red</option>
          </select>
          <button style={button} onClick={handleAdd}>Add variant</button>
        </div>
      </div>

      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={cell}>ID</th>
              <th style={cell}>Model</th>
              <th style={cell}>Version</th>
              <th style={cell}>Color</th>
              <th style={cell}>Price</th>
              <th style={cell}>Status</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(v => (
              <tr key={v.id}>
                <td style={cell}>{v.id}</td>
                <td style={cell}>{v.model}</td>
                <td style={cell}>{v.version}</td>
                <td style={cell}>{v.color}</td>
                <td style={cell}>${v.price.toLocaleString()}</td>
                <td style={cell}>
                  <span style={{padding: '2px 8px', borderRadius: 12, background: v.active ? '#e6f4ea' : '#fdeaea', color: v.active ? '#18794e' : '#b42318'}}>
                    {v.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={cell}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={{padding: '6px 10px', border: '1px solid #0d6efd', color: '#0d6efd', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleEdit(v)}>Edit</button>
                    <button style={{padding: '6px 10px', border: '1px solid #b42318', color: '#b42318', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleDelete(v)}>Delete</button>
                    <button style={{padding: '6px 10px', border: '1px solid #64748b', color: '#475569', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => setRows(prev => prev.map(x => x.id === v.id ? { ...x, active: !x.active } : x))}>{v.active ? 'Deactivate' : 'Activate'}</button>
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

      <Modal title="Add Variant" open={showAdd} onClose={() => setShowAdd(false)} onSubmit={() => { const id = Math.max(10, ...rows.map(r=>r.id)) + 1; const modelName = form.modelId === 1 ? 'Model 3' : (form.modelId === 2 ? 'Model S' : 'Unknown'); setRows(prev => [...prev, { id, modelId: parseInt(form.modelId,10), model: modelName, version: form.version, color: form.color, price: parseInt(form.price,10), active: true }]); setShowAdd(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Model ID" type="number" value={form.modelId} onChange={(e)=>setForm(f=>({...f, modelId: parseInt(e.target.value,10)}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Version" value={form.version} onChange={(e)=>setForm(f=>({...f, version: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Color" value={form.color} onChange={(e)=>setForm(f=>({...f, color: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Price" type="number" value={form.price} onChange={(e)=>setForm(f=>({...f, price: e.target.value}))} />
        </div>
      </Modal>

      <Modal title={`Edit Variant #${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(v => v.id === editing.id ? { ...v, modelId: parseInt(form.modelId,10), model: form.modelId===1?'Model 3':(form.modelId===2?'Model S':'Unknown'), version: form.version, color: form.color, price: parseInt(form.price,10) } : v)); setShowEdit(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Model ID" type="number" value={form.modelId} onChange={(e)=>setForm(f=>({...f, modelId: parseInt(e.target.value,10)}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Version" value={form.version} onChange={(e)=>setForm(f=>({...f, version: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Color" value={form.color} onChange={(e)=>setForm(f=>({...f, color: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Price" type="number" value={form.price} onChange={(e)=>setForm(f=>({...f, price: e.target.value}))} />
        </div>
      </Modal>
    </div>
  )
}

export default VehicleVariants


