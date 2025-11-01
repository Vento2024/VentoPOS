import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Send, 
  Calendar,
  User,
  CreditCard,
  UserCheck,
  X,
  Mail,
  MessageCircle,
  Download,
  DollarSign,
  Hash,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { useSales } from '../store/sales'
import { useToastContext } from '../contexts/ToastContext'
import { SalesValidationService } from '../services/salesValidationService'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import SkeletonLoader from '../components/SkeletonLoader'
import ResponsiveTable from '../components/ResponsiveTable'
import MobileHeader from '../components/MobileHeader'
import MobileFilters from '../components/MobileFilters'
import { formatCRC } from '../utils/format'
import { printInvoice, downloadInvoiceHTML, generateWhatsAppInvoice, generateEmailInvoice } from '../utils/invoice'
import type { Sale, PaymentMethod } from '../types'

export default function SalesHistory() {
  const {
    getFilteredSales,
    getSaleById,
    setFilters,
    filters
  } = useSales()

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const filterFields = [
    {
      key: 'startDate',
      label: 'Fecha Inicio',
      type: 'date' as const,
      icon: Calendar
    },
    {
      key: 'endDate', 
      label: 'Fecha Fin',
      type: 'date' as const,
      icon: Calendar
    },
    {
      key: 'paymentMethod',
      label: 'Método de Pago',
      type: 'select' as const,
      icon: DollarSign,
      options: [
        { value: '', label: 'Todos' },
        { value: 'cash', label: 'Efectivo' },
        { value: 'card', label: 'Tarjeta' },
        { value: 'sinpe', label: 'SINPE' },
        { value: 'credit', label: 'Crédito' },
        { value: 'mixed', label: 'Mixto' }
      ]
    },
    {
      key: 'invoiceNumber',
      label: 'Número de Factura',
      type: 'text' as const,
      icon: Hash,
      placeholder: 'Buscar por número...'
    }
  ]

  const tableColumns = [
    {
      key: 'invoiceNumber',
      label: 'Factura',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        return (
          <div className="font-mono text-sm font-medium text-neutral-900">
            #{sale.invoiceNumber || 'N/A'}
          </div>
        )
      }
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        return (
          <div className="text-sm text-neutral-600">
            {formatDate(sale.date)}
          </div>
        )
      }
    },
    {
      key: 'customer',
      label: 'Cliente',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        return (
          <div className="text-sm text-neutral-900">
            {sale.customer?.name || 'Cliente General'}
          </div>
        )
      }
    },
    {
      key: 'paymentMethod',
      label: 'Pago',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(sale.paymentMethod)}`}>
            {getPaymentMethodLabel(sale.paymentMethod)}
          </span>
        )
      }
    },
    {
      key: 'total',
      label: 'Total',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        return (
          <div className="font-semibold text-neutral-900">
            {formatCRC(sale.total || 0)}
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (sale: Sale) => {
        if (!sale) return <div>-</div>
        const deleteValidation = SalesValidationService.canDeleteSale(sale)
        const riskLevel = SalesValidationService.getSaleRiskLevel(sale)
        
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetail(sale.id)}
              icon={<Eye size={16} />}
              title="Ver detalle"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePrint(sale)}
              loading={isLoading}
              icon={<Printer size={16} />}
              title="Imprimir"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSale(sale)}
              disabled={!deleteValidation.canDelete}
              icon={<Trash2 size={16} />}
              title={deleteValidation.canDelete ? 'Eliminar venta' : deleteValidation.reason}
              className={`${!deleteValidation.canDelete ? 'opacity-50 cursor-not-allowed' : ''} ${
                riskLevel === 'high' ? 'text-red-600 hover:text-red-700' : 
                riskLevel === 'medium' ? 'text-amber-600 hover:text-amber-700' : 
                'text-neutral-600 hover:text-neutral-700'
              }`}
            />
            {riskLevel === 'high' && (
              <AlertTriangle size={16} className="text-red-500" title="Venta de alto riesgo" />
            )}
            {riskLevel === 'medium' && (
              <Shield size={16} className="text-amber-500" title="Venta de riesgo medio" />
            )}
          </div>
        )
      }
    }
  ]
  const [isLoading, setIsLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'warning' | 'error' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const { success, error } = useToastContext()
  const sales = getFilteredSales()

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value || undefined })
  }

  const handleViewDetail = (saleId: string) => {
    const sale = getSaleById(saleId)
    if (sale) {
      setSelectedSale(sale)
      setShowDetail(true)
    }
  }

  const handlePrint = async (sale: Sale) => {
    setIsLoading(true)
    try {
      await printInvoice(sale)
      success('Impresión enviada', 'La factura se ha enviado a la impresora')
    } catch (err) {
      error('Error de impresión', 'No se pudo imprimir la factura')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSale = (sale: Sale) => {
    const validation = SalesValidationService.canDeleteSale(sale)
    
    if (!validation.canDelete) {
      error('No se puede eliminar', validation.reason || 'Esta venta no puede ser eliminada')
      return
    }

    const riskLevel = SalesValidationService.getSaleRiskLevel(sale)
    const isHighRisk = riskLevel === 'high'
    
    setConfirmDialog({
      isOpen: true,
      title: isHighRisk ? '⚠️ Eliminar Venta de Alto Riesgo' : 'Eliminar Venta',
      message: isHighRisk 
        ? `Esta es una venta de ALTO RIESGO. ¿Estás completamente seguro de que deseas eliminar la venta #${sale.invoiceNumber} por ${formatCRC(sale.total)}? Esta acción no se puede deshacer.`
        : `¿Estás seguro de que deseas eliminar la venta #${sale.invoiceNumber} por ${formatCRC(sale.total)}? Esta acción no se puede deshacer.`,
      type: isHighRisk ? 'error' : 'warning',
      onConfirm: () => {
        // Aquí iría la lógica real de eliminación
        // Por ahora solo mostramos un mensaje
        success('Venta eliminada', `La venta #${sale.invoiceNumber} ha sido eliminada`)
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleResend = async (sale: Sale) => {
    setIsLoading(true)
    try {
      if (sale.customerPhone) {
        const whatsappMessage = generateWhatsAppInvoice(sale)
        window.open(`https://wa.me/506${sale.customerPhone.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank')
        success('WhatsApp abierto', 'Se ha abierto WhatsApp con el mensaje de la factura')
      } else if (sale.customerEmail) {
        const emailData = generateEmailInvoice(sale)
        window.open(`mailto:${sale.customerEmail}?subject=${emailData.subject}&body=${emailData.body}`, '_blank')
        success('Email abierto', 'Se ha abierto el cliente de email con la factura')
      } else {
        // Download HTML if no contact info
        downloadInvoiceHTML(sale)
        success('Factura descargada', 'La factura se ha descargado como archivo HTML')
      }
    } catch (err) {
      error('Error al reenviar', 'No se pudo reenviar la factura')
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Limpiar filtros',
      message: '¿Estás seguro de que deseas limpiar todos los filtros aplicados?',
      type: 'info',
      onConfirm: () => {
        setFilters({})
        success('Filtros limpiados', 'Se han removido todos los filtros')
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      sinpe: 'SINPE',
      credit: 'Crédito',
      mixed: 'Mixto'
    }
    return labels[method]
  }

  const getPaymentMethodColor = (method: PaymentMethod) => {
    const colors = {
      cash: 'bg-success-100 text-success-800 border-success-200',
      card: 'bg-primary-100 text-primary-800 border-primary-200',
      sinpe: 'bg-purple-100 text-purple-800 border-purple-200',
      credit: 'bg-warning-100 text-warning-800 border-warning-200',
      mixed: 'bg-neutral-100 text-neutral-800 border-neutral-200'
    }
    return colors[method]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100'
      case 'cancelled': return 'text-error-600 bg-error-100'
      case 'refunded': return 'text-warning-600 bg-warning-100'
      default: return 'text-neutral-600 bg-neutral-100'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title="Historial de Ventas" 
          subtitle={`${sales.length} ventas encontradas`}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
              icon={<Filter size={16} />}
              className="relative"
            >
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          }
        />
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Historial de Ventas</h1>
            <p className="text-neutral-600">Gestiona y consulta todas las ventas realizadas</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-6">
        {/* Desktop Filters */}
        <div className="hidden md:block bg-white p-6 rounded-xl border border-neutral-200 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <field.icon size={16} className="inline mr-1" />
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={filters[field.key as keyof typeof filters] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={filters[field.key as keyof typeof filters] || ''}
                    onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-soft overflow-hidden">
          <ResponsiveTable
            columns={tableColumns}
            data={sales}
            keyField="id"
            onRowClick={(sale) => handleViewDetail(sale.id)}
            emptyMessage="No se encontraron ventas con los filtros aplicados"
          />
        </div>
      </main>

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Sale Detail Modal */}
      {showDetail && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-strong">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">
                Detalle de Venta #{selectedSale.invoiceNumber}
              </h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-neutral-400 hover:text-neutral-600 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Información General</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-neutral-500">Fecha:</span> {selectedSale.date} {selectedSale.time}</div>
                    <div><span className="text-neutral-500">Cajero:</span> {selectedSale.cashierName}</div>
                    <div><span className="text-neutral-500">Cliente:</span> {selectedSale.customerName || 'Cliente General'}</div>
                    {selectedSale.customerPhone && (
                      <div><span className="text-neutral-500">Teléfono:</span> {selectedSale.customerPhone}</div>
                    )}
                    {selectedSale.customerEmail && (
                      <div><span className="text-neutral-500">Email:</span> {selectedSale.customerEmail}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">Información de Pago</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-neutral-500">Método:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPaymentMethodColor(selectedSale.paymentDetails.method)}`}>
                        {getPaymentMethodLabel(selectedSale.paymentDetails.method)}
                      </span>
                    </div>
                    {selectedSale.paymentDetails.method === 'cash' && (
                      <>
                        <div><span className="text-neutral-500">Recibido:</span> {formatCRC(selectedSale.paymentDetails.receivedAmount || 0)}</div>
                        <div><span className="text-neutral-500">Cambio:</span> {formatCRC(selectedSale.paymentDetails.changeAmount || 0)}</div>
                      </>
                    )}
                    {selectedSale.paymentDetails.method === 'credit' && selectedSale.paymentDetails.creditDueDate && (
                      <div><span className="text-neutral-500">Vencimiento:</span> {new Date(selectedSale.paymentDetails.creditDueDate).toLocaleDateString('es-CR')}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Productos</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Cant.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">P. Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {selectedSale.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-neutral-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-neutral-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-neutral-900">{formatCRC(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm font-medium text-neutral-900">{formatCRC(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal (sin IVA):</span>
                    <span className="text-neutral-900">{formatCRC(selectedSale.subtotalWithoutTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">IVA (13%):</span>
                    <span className="text-neutral-900">{formatCRC(selectedSale.taxAmount)}</span>
                  </div>
                  {selectedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-error-600">
                      <span>Descuento:</span>
                      <span>-{formatCRC(selectedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-neutral-300 pt-2">
                    <span>Total:</span>
                    <span>{formatCRC(selectedSale.total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <Button
                  onClick={() => handlePrint(selectedSale)}
                  variant="success"
                  icon={<Printer size={16} />}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Reimprimir
                </Button>
                
                {selectedSale.customerPhone && (
                  <Button
                    onClick={() => {
                      const whatsappMessage = generateWhatsAppInvoice(selectedSale)
                      window.open(`https://wa.me/506${selectedSale.customerPhone.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank')
                    }}
                    variant="success"
                    icon={<MessageCircle size={16} />}
                    disabled={isLoading}
                  >
                    WhatsApp
                  </Button>
                )}
                
                {selectedSale.customerEmail && (
                  <Button
                    onClick={() => {
                      const emailData = generateEmailInvoice(selectedSale)
                      window.open(`mailto:${selectedSale.customerEmail}?subject=${emailData.subject}&body=${emailData.body}`, '_blank')
                    }}
                    variant="primary"
                    icon={<Mail size={16} />}
                    disabled={isLoading}
                  >
                    Email
                  </Button>
                )}
                
                <Button
                  onClick={() => downloadInvoiceHTML(selectedSale)}
                  variant="secondary"
                  icon={<Download size={16} />}
                  disabled={isLoading}
                >
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}