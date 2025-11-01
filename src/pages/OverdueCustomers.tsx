import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, DollarSign, Phone, Mail, User, Download, Filter } from 'lucide-react'
import { InvoiceService } from '../services/invoiceService'
import { formatCRC } from '../utils/format'
import MobileHeader from '../components/MobileHeader'
import Button from '../components/Button'

interface OverdueCustomer {
  id: string
  name: string
  phone?: string
  email?: string
  totalBalance: number
  overdueBalance: number
  oldestInvoiceDate: string
  daysPastDue: number
  invoiceCount: number
}

export default function OverdueCustomers() {
  const [overdueCustomers, setOverdueCustomers] = useState<OverdueCustomer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<OverdueCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDays, setFilterDays] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'balance' | 'days' | 'name'>('balance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadOverdueCustomers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [overdueCustomers, filterDays, sortBy, sortOrder])

  const loadOverdueCustomers = () => {
    setLoading(true)
    try {
      const customers = InvoiceService.getAllCustomers()
      const invoices = InvoiceService.getAllInvoices()
      const today = new Date()
      
      const overdueData: OverdueCustomer[] = customers
        .map(customer => {
          const customerInvoices = invoices.filter(inv => 
            inv.customerData?.name === customer.name && 
            inv.paymentMethod === 'credit' &&
            inv.balance > 0
          )
          
          if (customerInvoices.length === 0) return null
          
          const totalBalance = customerInvoices.reduce((sum, inv) => sum + inv.balance, 0)
          const oldestInvoice = customerInvoices.reduce((oldest, inv) => 
            new Date(inv.date) < new Date(oldest.date) ? inv : oldest
          )
          
          const daysPastDue = Math.floor(
            (today.getTime() - new Date(oldestInvoice.date).getTime()) / (1000 * 60 * 60 * 24)
          )
          
          // Solo incluir si tiene más de 30 días de vencimiento
          if (daysPastDue < 30) return null
          
          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            totalBalance,
            overdueBalance: totalBalance, // Por simplicidad, todo el balance está vencido
            oldestInvoiceDate: oldestInvoice.date,
            daysPastDue,
            invoiceCount: customerInvoices.length
          }
        })
        .filter((customer): customer is OverdueCustomer => customer !== null)
      
      setOverdueCustomers(overdueData)
    } catch (error) {
      console.error('Error loading overdue customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...overdueCustomers]
    
    // Filtrar por días de vencimiento
    if (filterDays > 0) {
      filtered = filtered.filter(customer => customer.daysPastDue >= filterDays)
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'balance':
          comparison = a.totalBalance - b.totalBalance
          break
        case 'days':
          comparison = a.daysPastDue - b.daysPastDue
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    setFilteredCustomers(filtered)
  }

  const getRiskLevel = (daysPastDue: number) => {
    if (daysPastDue >= 90) return { level: 'Alto', color: 'text-red-600 bg-red-100 border-red-200' }
    if (daysPastDue >= 60) return { level: 'Medio', color: 'text-orange-600 bg-orange-100 border-orange-200' }
    return { level: 'Bajo', color: 'text-yellow-600 bg-yellow-100 border-yellow-200' }
  }

  const exportToCSV = () => {
    const headers = ['Cliente', 'Teléfono', 'Email', 'Saldo Total', 'Días Vencido', 'Facturas', 'Riesgo']
    const csvData = filteredCustomers.map(customer => [
      customer.name,
      customer.phone || '',
      customer.email || '',
      customer.totalBalance.toString(),
      customer.daysPastDue.toString(),
      customer.invoiceCount.toString(),
      getRiskLevel(customer.daysPastDue).level
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes-vencidos-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalOverdueAmount = filteredCustomers.reduce((sum, customer) => sum + customer.totalBalance, 0)
  const averageDaysOverdue = filteredCustomers.length > 0 
    ? Math.round(filteredCustomers.reduce((sum, customer) => sum + customer.daysPastDue, 0) / filteredCustomers.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando clientes vencidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader title="Clientes Vencidos" />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="text-2xl font-bold text-neutral-900">Clientes con Saldo Vencido</h1>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={filteredCustomers.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Clientes Vencidos</p>
                <p className="text-2xl font-bold text-neutral-900">{filteredCustomers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Saldo Total Vencido</p>
                <p className="text-2xl font-bold text-neutral-900">{formatCRC(totalOverdueAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Promedio Días Vencido</p>
                <p className="text-2xl font-bold text-neutral-900">{averageDaysOverdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Riesgo Alto</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {filteredCustomers.filter(c => c.daysPastDue >= 90).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-neutral-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Filtros y Ordenamiento</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Días mínimos vencido
              </label>
              <select
                value={filterDays}
                onChange={(e) => setFilterDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>Todos</option>
                <option value={30}>30+ días</option>
                <option value={60}>60+ días</option>
                <option value={90}>90+ días</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'balance' | 'days' | 'name')}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="balance">Saldo</option>
                <option value="days">Días vencido</option>
                <option value="name">Nombre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="desc">Mayor a menor</option>
                <option value="asc">Menor a mayor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">
              Lista de Clientes ({filteredCustomers.length})
            </h2>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Saldo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Días Vencido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Facturas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredCustomers.map((customer) => {
                    const risk = getRiskLevel(customer.daysPastDue)
                    return (
                      <tr key={customer.id} className="hover:bg-neutral-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 rounded-full">
                              <User className="h-4 w-4 text-neutral-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900">{customer.name}</div>
                              <div className="text-xs text-neutral-500">
                                Desde: {new Date(customer.oldestInvoiceDate).toLocaleDateString('es-CR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{formatCRC(customer.totalBalance)}</div>
                          <div className="text-xs text-neutral-500">{customer.invoiceCount} facturas</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{customer.daysPastDue} días</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {customer.invoiceCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${risk.color}`}>
                            {risk.level}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500 text-lg">No hay clientes con saldo vencido</p>
              <p className="text-neutral-400 text-sm">Los clientes aparecerán aquí cuando tengan facturas con más de 30 días de vencimiento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}