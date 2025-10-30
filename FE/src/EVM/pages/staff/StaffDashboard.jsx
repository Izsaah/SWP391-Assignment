import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'

const grid = { display: 'grid', gap: 16 }
const row = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }
const card = { background: '#fff', border: '1px solid #e6e6ea', borderRadius: 8, padding: 16 }
const linkCard = { ...card, cursor: 'pointer' }

const StaffDashboard = () => {
  const navigate = useNavigate()
  const kpis = useMemo(() => ([
    { label: 'Active Models', value: 5 },
    { label: 'Total Inventory', value: 100 },
    { label: 'Active Promotions', value: 3 }
  ]), [])

  return (
    <div style={grid}>
      <div>
        <h2 style={{margin: 0}}>EVM Staff Dashboard</h2>
        <div style={{color: '#6b7280'}}>Overview and quick actions</div>
      </div>

      <div style={row}>
        {kpis.map(k => (
          <div key={k.label} style={card}>
            <div style={{color: '#6b7280', marginBottom: 4}}>{k.label}</div>
            <div style={{fontSize: 22, fontWeight: 700}}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12}}>
        <button onClick={() => navigate('/evm/vehicle-models')} style={{all: 'unset', display: 'block'}}>
          <div style={linkCard}>🚗 Manage Models</div>
        </button>
        <button onClick={() => navigate('/evm/inventory')} style={{all: 'unset', display: 'block'}}>
          <div style={linkCard}>📦 View Inventory</div>
        </button>
        <button onClick={() => navigate('/evm/promotions')} style={{all: 'unset', display: 'block'}}>
          <div style={linkCard}>🏷️ Promotions</div>
        </button>
      </div>
    </div>
  )
}

export default StaffDashboard


