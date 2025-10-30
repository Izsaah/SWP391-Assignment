import React, { useMemo, useState, useCallback } from 'react'
import Modal from '../../components/Modal'

const grid = { display: 'grid', gap: 16 }
const row = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const button = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const cell = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee' }

const Metric = ({ label, value }) => (
  <div style={{...card}}>
    <div style={{color: '#6b7280', marginBottom: 4}}>{label}</div>
    <div style={{fontSize: 22, fontWeight: 700}}>{value}</div>
  </div>
)

const Inventory = () => {
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('dealer')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [rows, setRows] = useState([
    { id: 1, dealer: 'Dealer A', modelId: 1, model: 'Model 3', variant: 'Standard', qty: 12, status: 'in_stock', daysInStock: 18 },
    { id: 2, dealer: 'Dealer B', modelId: 1, model: 'Model 3', variant: 'Long Range', qty: 3, status: 'in_stock', daysInStock: 62 },
    { id: 3, dealer: 'Dealer A', modelId: 2, model: 'Model S', variant: 'Performance', qty: 0, status: 'sold', daysInStock: 0 },
    { id: 4, dealer: 'Total Warehouse', modelId: 2, model: 'Model S', variant: 'Performance', qty: 9, status: 'in_stock', daysInStock: 5 }
  ])

  const [allocOpen, setAllocOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [allocForm, setAllocForm] = useState({ dealer: 'Dealer B', qty: 1 })
  const [adjustForm, setAdjustForm] = useState({ qty: 0 })
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const summary = useMemo(() => ({
    totalUnits: rows.reduce((s, r) => s + r.qty, 0),
    dealers: new Set(rows.map(r => r.dealer)).size,
    models: new Set(rows.map(r => r.model)).size
  }), [rows])

  const filtered = useMemo(() => rows.filter(r =>
    (dealer === 'All' || r.dealer === dealer) &&
    (!query || `${r.model} ${r.variant}`.toLowerCase().includes(query.toLowerCase()))
  ), [rows, dealer, query])
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const handleRefresh = useCallback(async () => {
    setLastRefreshed(new Date().toLocaleTimeString())
    setRows(r => [...r])
  }, [])

  const handleAllocate = useCallback(async (row) => { setSelected(row); setAllocForm({ dealer: 'Dealer B', qty: 1 }); setAllocOpen(true) }, [])
  const handleAdjust = useCallback(async (row) => { setSelected(row); setAdjustForm({ qty: row.qty }); setAdjustOpen(true) }, [])

  const exportCsv = useCallback(() => {
    const header = 'Dealer,Model,Variant,Quantity,Status,DaysInStock\n'
    const body = filtered.map(r => [r.dealer, r.model, r.variant, r.qty, r.status, r.daysInStock].join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Inventory</h2>
          <div style={{color: '#6b7280'}}>Coordinate vehicle stock across dealers</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <input placeholder="Search model/variant..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} style={input} />
          <select value={dealer} onChange={(e) => setDealer(e.target.value)} style={{...input, minWidth: 140}}>
            <option>All</option>
            <option>Dealer A</option>
            <option>Dealer B</option>
          </select>
          <button style={button} onClick={handleRefresh}>Refresh</button>
          <button style={{...button, background: '#0ea5e9'}} onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div style={row}>
        <Metric label="Total Units" value={summary.totalUnits} />
        <Metric label="Dealers" value={summary.dealers} />
        <Metric label="Models" value={summary.models} />
      </div>

      <div style={card}>
        {lastRefreshed && (
          <div style={{color: '#64748b', fontSize: 12, marginBottom: 8}}>Last refreshed at {lastRefreshed}</div>
        )}
        <table style={table}>
          <thead>
            <tr>
              <th style={cell} onClick={() => toggleSort('dealer')}>Dealer</th>
              <th style={cell} onClick={() => toggleSort('model')}>Model</th>
              <th style={cell} onClick={() => toggleSort('variant')}>Variant</th>
              <th style={cell} onClick={() => toggleSort('qty')}>Quantity</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                <td style={cell}>{r.dealer}</td>
                <td style={cell}>{r.model}</td>
                <td style={cell}>{r.variant}</td>
                <td style={cell}>
                  {r.qty}
                  {(r.qty <= 2) && (
                    <span style={{marginLeft: 8, padding: '2px 6px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontSize: 12}}>Low</span>
                  )}
                  {(r.daysInStock >= 60 && r.qty > 0) && (
                    <span style={{marginLeft: 6, padding: '2px 6px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontSize: 12}}>Long stock</span>
                  )}
                </td>
                <td style={cell}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={{padding: '6px 10px', border: '1px solid #0d6efd', color: '#0d6efd', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleAllocate(r)}>Allocate</button>
                    <button style={{padding: '6px 10px', border: '1px solid #64748b', color: '#475569', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleAdjust(r)}>Adjust</button>
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

      <Modal title={`Allocate from ${selected?.dealer || ''}`} open={allocOpen} onClose={() => setAllocOpen(false)} onSubmit={() => { try { const qty = parseInt(allocForm.qty, 10); setRows(prev => { const from = prev.find(i=>i.id===selected.id); if (!from || from.qty < qty) throw new Error('Insufficient stock'); from.qty -= qty; const existing = prev.find(i => i.dealer===allocForm.dealer && i.modelId===from.modelId && i.variant===from.variant); if (existing) existing.qty += qty; else prev.push({ id: Math.max(...prev.map(p=>p.id))+1, dealer: allocForm.dealer, modelId: from.modelId, model: from.model, variant: from.variant, qty, status: 'in_stock', daysInStock: 0 }); return [...prev] }); setAllocOpen(false) } catch (e) { window.alert(e.message) } }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Dealer" value={allocForm.dealer} onChange={(e)=>setAllocForm(f=>({...f, dealer: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Quantity" type="number" value={allocForm.qty} onChange={(e)=>setAllocForm(f=>({...f, qty: e.target.value}))} />
        </div>
      </Modal>

      <Modal title={`Adjust ${selected?.model || ''} ${selected?.variant || ''}`} open={adjustOpen} onClose={() => setAdjustOpen(false)} onSubmit={() => { setRows(prev => prev.map(i => i.id === selected.id ? { ...i, qty: Math.max(0, parseInt(adjustForm.qty, 10)) } : i)); setAdjustOpen(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="New quantity" type="number" value={adjustForm.qty} onChange={(e)=>setAdjustForm({ qty: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

export default Inventory


