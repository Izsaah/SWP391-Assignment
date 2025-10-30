import React, { useMemo, useState } from 'react'

const grid = { display: 'grid', gap: 16 }
const row = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 140 }

const InventoryReport = () => {
  const [model, setModel] = useState('All')
  const [period, setPeriod] = useState('Last 30 days')

  const [rows, setRows] = useState([
    { model: 'Model 3', stock: 60, sold: 45 },
    { model: 'Model S', stock: 25, sold: 10 },
    { model: 'E-Urban', stock: 15, sold: 12 }
  ])

  const filtered = useMemo(() => rows.filter(r => model === 'All' || r.model === model), [rows, model])

  const totalStock = useMemo(() => filtered.reduce((s, r) => s + r.stock, 0), [filtered])
  const totalSold = useMemo(() => filtered.reduce((s, r) => s + r.sold, 0), [filtered])
  const rate = useMemo(() => totalStock ? Math.round((totalSold / (totalStock + totalSold)) * 100) : 0, [totalStock, totalSold])
  const forecast = useMemo(() => Math.round(totalSold * 1.1), [totalSold])

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Inventory & Consumption</h2>
          <div style={{color: '#6b7280'}}>Track stock levels and sell-through rate</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={input}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <select value={model} onChange={(e) => setModel(e.target.value)} style={input}>
            <option>All</option>
            <option>Model 3</option>
            <option>Model S</option>
            <option>E-Urban</option>
          </select>
        </div>
      </div>

      <div style={row}>
        <div style={card}>
          <div style={{color: '#6b7280', marginBottom: 4}}>Total Stock</div>
          <div style={{fontSize: 22, fontWeight: 700}}>{totalStock}</div>
        </div>
        <div style={card}>
          <div style={{color: '#6b7280', marginBottom: 4}}>Total Sold</div>
          <div style={{fontSize: 22, fontWeight: 700}}>{totalSold}</div>
        </div>
        <div style={card}>
          <div style={{color: '#6b7280', marginBottom: 4}}>Consumption Rate</div>
          <div style={{fontSize: 22, fontWeight: 700}}>{rate}%</div>
        </div>
        <div style={card}>
          <div style={{color: '#6b7280', marginBottom: 4}}>Forecast (next period)</div>
          <div style={{fontSize: 22, fontWeight: 700}}>{forecast}</div>
        </div>
      </div>

      <div style={card}>
        <div style={{fontWeight: 600, marginBottom: 12}}>Models Breakdown</div>
        <div style={{display: 'grid', gap: 10}}>
          {filtered.map(r => (
            <div key={r.model}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
                <div>{r.model}</div>
                <div style={{color: '#64748b'}}>Stock {r.stock} • Sold {r.sold}</div>
              </div>
              <div style={{height: 10, background: '#eef2f7', borderRadius: 6}}>
                <div style={{height: '100%', width: `${(r.sold / (r.stock + r.sold)) * 100}%`, background: '#10b981', borderRadius: 6}} />
              </div>
              {r.stock <= 5 && (
                <div style={{marginTop: 6, color: '#b45309', fontSize: 12}}>Warning: Near out-of-stock</div>
              )}
              {r.stock > 0 && r.stock >= 50 && (
                <div style={{marginTop: 6, color: '#b91c1c', fontSize: 12}}>Warning: Long-term inventory risk</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InventoryReport


