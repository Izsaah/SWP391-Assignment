import React, { useMemo, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const Bar = ({ label, value, max, formatCurrency }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <span className="text-sm text-gray-600">{formatCurrency ? formatCurrency(value) : value}</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 transition-all duration-300" 
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  </div>
)

const SalesReport = () => {
  const [region, setRegion] = useState('All')
  const [period, setPeriod] = useState('Q4')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch sales data from API
  const fetchSalesData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No authentication token found. Please login again.')
        return
      }

      const response = await axios.post(
        `${API_URL}/EVM/dealerSaleRecords`,
        { _empty: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      )

      // Backend trả về {status: 'success', message: '...', data: Array}
      // data là List<Map> với: dealerId, dealerName, address, phoneNumber, totalSales, totalOrders
      if (response.data && response.data.status === 'success' && response.data.data) {
        const backendData = response.data.data || []
        
        // Transform backend data to frontend format
        const salesData = backendData.map(dealer => ({
          dealer: dealer.dealerName || 'Unknown Dealer',
          sales: parseFloat(dealer.totalSales || 0),
          orders: parseInt(dealer.totalOrders || 0),
          region: 'All' // Backend không có region, để "All" hoặc extract từ address nếu cần
        }))

        setRows(salesData)
      } else {
        console.log('Response not successful or no data:', response.data)
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${API_URL}/EVM/dealerSaleRecords`,
        message: error.message
      })
      alert(error.response?.data?.message || 'Failed to fetch sales data')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  const filtered = useMemo(() => rows.filter(r => region === 'All' || r.region === region), [rows, region])
  const max = useMemo(() => {
    if (filtered.length === 0) return 1
    return Math.max(...filtered.map(r => r.sales), 1)
  }, [filtered])
  const total = useMemo(() => filtered.reduce((s, r) => s + r.sales, 0), [filtered])
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-600 mt-1">Sales by region and dealer</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Q1</option>
              <option>Q2</option>
              <option>Q3</option>
              <option>Q4</option>
            </select>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)} 
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All</option>
              <option>North</option>
              <option>South</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Dealers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Top Dealers</div>
          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">No sales data available</div>
          ) : (
            filtered
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map(r => (
                <Bar key={r.dealer} label={r.dealer} value={r.sales} max={max} formatCurrency={formatCurrency} />
              ))
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total sales</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dealers</span>
              <span className="text-lg font-bold text-gray-900">{filtered.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Period</span>
              <span className="text-lg font-bold text-gray-900">{period}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-lg font-bold text-gray-900">
                {filtered.reduce((sum, r) => sum + (r.orders || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-semibold text-gray-900 mb-4">Notes</div>
          <div className="text-sm text-gray-600">
            Use filters to analyze performance by region and quarter.
            {loading && <div className="mt-2 text-blue-600">Loading data...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
