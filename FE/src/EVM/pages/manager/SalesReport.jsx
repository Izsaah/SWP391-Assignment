import React, { useMemo, useState } from 'react'

const grid = { display: 'grid', gap: 16 }
const row = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const input = { padding: '8px 10px', border: '1px solid #d0d5dd', borderRadius: 6, minWidth: 120 }

const Bar = ({ label, value, max }) => (
  <div style={{marginBottom: 10}}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 6}}>
      <div>{label}</div>
      <div style={{color: '#64748b'}}>{value}</div>
    </div>
    <div style={{height: 10, background: '#eef2f7', borderRadius: 6}}>
      <div style={{height: '100%', width: `${(value / max) * 100}%`, background: '#0d6efd', borderRadius: 6}} />
    </div>
  </div>
)

const SalesReport = () => {
  const [region, setRegion] = useState('All')
  const [period, setPeriod] = useState('Q4')

  const rows = useMemo(() => ([
    { dealer: 'Dealer A', region: 'North', sales: 38 },
    { dealer: 'Dealer B', region: 'South', sales: 27 },
    { dealer: 'Dealer C', region: 'North', sales: 18 }
  ]), [])

  const filtered = useMemo(() => rows.filter(r => region === 'All' || r.region === region), [rows, region])
  const max = useMemo(() => Math.max(...filtered.map(r => r.sales), 1), [filtered])
  const total = useMemo(() => filtered.reduce((s, r) => s + r.sales, 0), [filtered])

  const exportCsv = () => {
    const header = 'Dealer,Region,Sales\n'
    const body = filtered.map(r => `${r.dealer},${r.region},${r.sales}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={grid}>
      <div style={header}>
        <div>
          <h2 style={{margin: 0}}>Sales Report</h2>
          <div style={{color: '#6b7280'}}>Sales by region and dealer</div>
        </div>
        <div style={{display: 'flex', gap: 8}}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={input}>
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={input}>
            <option>All</option>
            <option>North</option>
            <option>South</option>
          </select>
          <button onClick={exportCsv} className="px-3 py-2 text-sm border border-gray-300 rounded">Export CSV</button>
        </div>
      </div>

      <div style={row}>
        <div style={card}>
          <div style={{fontWeight: 600, marginBottom: 8}}>Top Dealers</div>
          {filtered.map(r => (
            <Bar key={r.dealer} label={r.dealer} value={r.sales} max={max} />
          ))}
        </div>
        <div style={card}>
          <div style={{fontWeight: 600, marginBottom: 8}}>Summary</div>
          <div style={{display: 'grid', gap: 8}}>
            <div>Total sales: {total}</div>
            <div>Dealers: {filtered.length}</div>
            <div>Period: {period}</div>
          </div>
        </div>
        <div style={card}>
          <div style={{fontWeight: 600, marginBottom: 8}}>Notes</div>
          <div style={{color: '#64748b'}}>Use filters to analyze performance by region and quarter.</div>
        </div>
      </div>
    </div>
  )
}

export default SalesReport


