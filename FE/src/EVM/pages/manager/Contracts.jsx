import React, { useMemo, useState, useCallback } from 'react'
import Modal from '../../components/Modal'

const grid = { display: 'grid', gap: 16 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 180 }
const button = { padding: '8px 12px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const cell = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #eee' }

const Contracts = () => {
  const [dealer, setDealer] = useState('All')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ target: 0, debt: 0 })

  const [rows, setRows] = useState([
    { id: 'C-001', dealer: 'Dealer A', target: 50, achieved: 38, period: 'Q4', creditLimit: 200000, paid: 188000, debt: 12000, status: 'Active' },
    { id: 'C-002', dealer: 'Dealer B', target: 35, achieved: 27, period: 'Q4', creditLimit: 150000, paid: 145000, debt: 5000, status: 'Active' },
    { id: 'C-003', dealer: 'Dealer A', target: 20, achieved: 20, period: 'Q3', creditLimit: 100000, paid: 100000, debt: 0, status: 'Closed' }
  ])

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

  const exportCsv = useCallback(() => {
    const header = 'ContractID,Dealer,Target,Achieved,Debt,Status,Period,CreditLimit,Paid\n'
    const body = filtered.map(c => [c.id, c.dealer, c.target, c.achieved, c.debt, c.status, c.period, c.creditLimit, c.paid].join(',')).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contracts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const handleEdit = useCallback(async (row) => { setEditing(row); setForm({ target: row.target, debt: row.debt }); setShowEdit(true) }, [])
  const handleView = useCallback((row) => { window.alert(`Dealer ${row.dealer}\nTarget ${row.target}, Achieved ${row.achieved}\nDebt $${row.debt}`) }, [])

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Contracts</h2>
          <div style={{color: '#6b7280'}}>Revenue targets and receivables by dealer</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <input placeholder="Search contract ID..." value={query} onChange={(e) => setQuery(e.target.value)} style={input} />
          <select value={dealer} onChange={(e) => setDealer(e.target.value)} style={{...input, minWidth: 140}}>
            <option>All</option>
            <option>Dealer A</option>
            <option>Dealer B</option>
          </select>
          <button style={{...button, background: '#0ea5e9'}} onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={cell} onClick={() => toggleSort('id')}>Contract ID</th>
              <th style={cell} onClick={() => toggleSort('dealer')}>Dealer</th>
              <th style={cell} onClick={() => toggleSort('target')}>Target (units)</th>
              <th style={cell} onClick={() => toggleSort('debt')}>Debt</th>
              <th style={cell}>Progress</th>
              <th style={cell} onClick={() => toggleSort('status')}>Status</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.id}>
                <td style={cell}>{c.id}</td>
                <td style={cell}>{c.dealer}</td>
                <td style={cell}>{c.target}</td>
                <td style={cell}>${c.debt.toLocaleString()}</td>
                <td style={cell}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{width: 120, height: 10, background: '#eef2f7', borderRadius: 6}}>
                      <div style={{height: '100%', width: `${Math.min(100, Math.round((c.achieved / Math.max(1, c.target)) * 100))}%`, background: '#0d6efd', borderRadius: 6}} />
                    </div>
                    <span style={{fontSize: 12, color: '#475569'}}>{Math.min(100, Math.round((c.achieved / Math.max(1, c.target)) * 100))}%</span>
                  </div>
                </td>
                <td style={cell}>{c.status}</td>
                <td style={cell}>
                  <div style={{display: 'flex', gap: 8}}>
                    <button style={{padding: '6px 10px', border: '1px solid #0d6efd', color: '#0d6efd', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleEdit(c)}>Edit</button>
                    <button style={{padding: '6px 10px', border: '1px solid #64748b', color: '#475569', background: 'transparent', borderRadius: 6, cursor: 'pointer'}} onClick={() => handleView(c)}>View</button>
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

      <Modal title={`Edit Contract ${editing?.id || ''}`} open={showEdit} onClose={() => setShowEdit(false)} onSubmit={() => { setRows(prev => prev.map(c => c.id === editing.id ? { ...c, target: parseInt(form.target,10), debt: parseInt(form.debt,10) } : c)); setShowEdit(false) }}>
        <div className="grid gap-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Target" type="number" value={form.target} onChange={(e)=>setForm(f=>({...f, target: e.target.value}))} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Debt" type="number" value={form.debt} onChange={(e)=>setForm(f=>({...f, debt: e.target.value}))} />
        </div>
      </Modal>
    </div>
  )
}

export default Contracts


