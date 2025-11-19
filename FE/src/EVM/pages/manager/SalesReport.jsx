import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { fetchDealerSaleRecords } from '../../services/salesReportService'

const SalesReport = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const normalizeNumber = (value) => {
    if (value == null) return 0
    if (typeof value === 'number') return value
    if (typeof value === 'string') return Number(value.replace(/,/g, '')) || 0
    if (typeof value === 'object') {
      if ('value' in value) return normalizeNumber(value.value)
      if ('amount' in value) return normalizeNumber(value.amount)
    }
    return Number(value) || 0
  }

  const fetchSalesData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchDealerSaleRecords()
      
      if (result.success && Array.isArray(result.data)) {
        const salesData = result.data.map((dealer) => ({
          dealerId: dealer.dealerId ?? dealer.dealer_id ?? null,
          dealerName: dealer.dealerName ?? dealer.dealer_name ?? 'Unknown dealer',
          address: dealer.address ?? '',
          phoneNumber: dealer.phoneNumber ?? dealer.phone_number ?? '',
          totalSales: normalizeNumber(dealer.totalSales ?? dealer.total_sales),
          totalOrders: normalizeNumber(dealer.totalOrders ?? dealer.total_orders)
        }))
        setRows(salesData)
      } else {
        setRows([])
        setError(result.message || 'Failed to fetch sales data.')
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      setError(error.message || 'Failed to fetch sales data.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }, [])

  const filteredRows = useMemo(() => {
    if (!query) return rows
    const lower = query.toLowerCase()
    return rows.filter((row) => {
      return [
        row.dealerId != null ? String(row.dealerId) : '',
        row.dealerName || '',
        row.phoneNumber || '',
        row.address || ''
      ]
        .some((field) => field.toLowerCase().includes(lower))
    })
  }, [rows, query])

  const totalSales = useMemo(
    () => filteredRows.reduce((sum, row) => sum + (row.totalSales || 0), 0),
    [filteredRows]
  )
  const totalOrders = useMemo(
    () => filteredRows.reduce((sum, row) => sum + (row.totalOrders || 0), 0),
    [filteredRows]
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dealer Sales Report</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo dealer, ID, số điện thoại..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchSalesData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dealer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dealer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    No sales data available
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.dealerId ?? row.dealerName}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.dealerId ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.dealerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(row.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.phoneNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 min-w-[12rem]">
                      {row.address || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng
                </th>
                <td className="px-6 py-3 text-sm font-semibold text-gray-700">
                  {filteredRows.length} dealer
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                  {formatCurrency(totalSales)}
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                  {totalOrders}
                </td>
                <td colSpan="2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
