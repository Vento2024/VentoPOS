import React, { useState, useMemo } from 'react'
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { useSales } from '../store/sales'
import { ReportService } from '../services/reportService'
import { formatCRC } from '../utils/format'
import Button from '../components/Button'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import type { PaymentMethod } from '../types'

// Helper function for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CR')
}

export default function Reports() {
  const { sales } = useSales()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  // Generar reporte actual
  const currentReport = useMemo(() => {
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      return ReportService.generateSalesReport(customStartDate, customEndDate, sales)
    }
    
    const periods = ReportService.generatePeriods()
    let startDate: string, endDate: string
    
    switch (selectedPeriod) {
      case 'today':
        startDate = endDate = periods.today.startDate
        break
      case 'week':
        startDate = periods.thisWeek.startDate
        endDate = periods.thisWeek.endDate
        break
      case 'month':
        startDate = periods.thisMonth.startDate
        endDate = periods.thisMonth.endDate
        break
      case 'quarter':
        const now = new Date()
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        startDate = quarterStart.toISOString().split('T')[0]
        endDate = new Date().toISOString().split('T')[0]
        break
      case 'year':
        startDate = periods.thisYear.startDate
        endDate = periods.thisYear.endDate
        break
      default:
        startDate = periods.thisWeek.startDate
        endDate = periods.thisWeek.endDate
    }
    
    return ReportService.generateSalesReport(startDate, endDate, sales)
  }, [sales, selectedPeriod, customStartDate, customEndDate])

  // Datos para el resumen ejecutivo
  const executiveSummary = {
    totalSales: currentReport?.totalSales || 0,
    totalTransactions: currentReport?.totalTransactions || 0,
    averageTicket: currentReport?.averageTicket || 0,
    topPaymentMethod: getTopPaymentMethod(currentReport?.salesByPaymentMethod || {}),
    salesGrowth: 0
  }

  // Datos para comparación
  const comparisonData = {
    salesChange: 0,
    transactionsChange: 0,
    averageTicketChange: 0
  }

  // Datos para gráficos
  const paymentMethodData = currentReport ? [
    {
      label: 'Efectivo',
      value: currentReport.salesByPaymentMethod.cash || 0,
      color: '#10b981'
    },
    {
      label: 'Tarjeta',
      value: currentReport.salesByPaymentMethod.card || 0,
      color: '#3b82f6'
    },
    {
      label: 'SINPE Móvil',
      value: currentReport.salesByPaymentMethod.sinpe || 0,
      color: '#f59e0b'
    },
    {
      label: 'Crédito',
      value: currentReport.salesByPaymentMethod.credit || 0,
      color: '#8b5cf6'
    },
    {
      label: 'Mixto',
      value: currentReport.salesByPaymentMethod.mixed || 0,
      color: '#ef4444'
    }
  ] : []

  const dailyTrendsData = currentReport?.dailyBreakdown.map(day => ({
    date: day.date,
    sales: day.sales,
    transactions: day.transactions
  })) || []

  const topProductsData = currentReport?.topProducts.map(product => ({
    name: product.name,
    value: product.revenue
  })) || []

  const exportToExcel = async () => {
    if (!currentReport) return
    
    setIsExporting(true)
    try {
      await ReportService.exportToExcel(currentReport, selectedPeriod)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    if (!currentReport) return
    
    setIsExporting(true)
    try {
      await ReportService.exportToPDF(currentReport, selectedPeriod)
    } finally {
      setIsExporting(false)
    }
  }

  function getTopPaymentMethod(salesByPaymentMethod: Record<string, number>) {
    const methods = Object.entries(salesByPaymentMethod)
    if (methods.length === 0) return 'N/A'
    
    const topMethod = methods.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    
    return getPaymentMethodLabel(topMethod[0] as PaymentMethod)
  }

  function getPaymentMethodLabel(method: PaymentMethod) {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'card':
        return 'Tarjeta'
      case 'sinpe':
        return 'SINPE Móvil'
      case 'credit':
        return 'Crédito'
      case 'mixed':
        return 'Mixto'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h1>
          <p className="text-gray-600">Análisis detallado de las ventas y rendimiento</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={exportToExcel}
            disabled={!currentReport || isExporting}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={!currentReport || isExporting}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Período:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'Hoy' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'quarter', label: 'Este trimestre' },
              { value: 'year', label: 'Este año' },
              { value: 'custom', label: 'Personalizado' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {currentReport ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCRC(executiveSummary.totalSales)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transacciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {executiveSummary.totalTransactions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCRC(executiveSummary.averageTicket)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Método Principal</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {executiveSummary.topPaymentMethod}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart
              data={paymentMethodData}
              title="Ventas por método de pago"
            />
            
            <BarChart
              data={topProductsData.map(product => ({
                label: product.name,
                value: product.value
              }))}
              title="Productos más vendidos"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <LineChart
                data={dailyTrendsData.map(day => ({
                  label: formatDate(day.date),
                  value: day.sales
                }))}
                title="Tendencia de ventas diarias"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose Diario</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transacciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.dailyBreakdown.map((day, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCRC(day.sales)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {day.transactions}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCRC(day.transactions > 0 ? day.sales / day.transactions : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
        </div>
      )}
    </div>
  )
}