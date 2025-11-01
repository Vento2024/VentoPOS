import { useState } from 'react'
import { Search, User, Phone, Mail, DollarSign, Calendar, Eye, Plus, Trash2, Lock } from 'lucide-react'
import { invoiceService } from '../services/invoiceService'
import { useToastContext } from '../contexts/ToastContext'
import { clearAllSampleData } from '../data/seedData'
import Button from '../components/Button'
import MobileHeader from '../components/MobileHeader'
import ResponsiveTable from '../components/ResponsiveTable'
import { formatCRC } from '../utils/format'
import type { Customer } from '../types'

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Estados para el formulario de nuevo cliente
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 50000
  })

  const { success, error } = useToastContext()

  // Obtener todos los clientes
  const customers = invoiceService.getAllCustomers()
  
  // Filtrar clientes por término de búsqueda
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Separar clientes con y sin saldo
  const customersWithBalance = filteredCustomers.filter(c => c.balance > 0)
  const customersWithoutBalance = filteredCustomers.filter(c => c.balance <= 0)

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetail(true)
    setPaymentAmount('')
  }

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return

    const amount = parseFloat(paymentAmount)
    if (amount <= 0 || amount > selectedCustomer.balance) {
      error('Monto inválido', 'El monto debe ser mayor a 0 y no exceder el saldo pendiente')
      return
    }

    setIsProcessing(true)
    try {
      invoiceService.recordPayment(selectedCustomer.id, amount)
      success('Pago registrado', `Se ha registrado el pago de ${formatCRC(amount)}`)
      setShowDetail(false)
      setSelectedCustomer(null)
      setPaymentAmount('')
    } catch (err) {
      error('Error al registrar pago', 'No se pudo procesar el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      error('Campos requeridos', 'El nombre y teléfono son obligatorios')
      return
    }

    setIsProcessing(true)
    try {
      await invoiceService.createCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim() || undefined,
        address: newCustomer.address.trim() || undefined,
        creditLimit: newCustomer.creditLimit
      })
      
      success('Cliente creado', `El cliente ${newCustomer.name} ha sido creado exitosamente`)
      setShowCreateModal(false)
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        creditLimit: 50000
      })
    } catch (err: any) {
      error('Error al crear cliente', err.message || 'No se pudo crear el cliente')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearSampleData = () => {
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = () => {
    // Contraseña de administrador (en un sistema real, esto debería estar en una base de datos segura)
    const ADMIN_PASSWORD = 'admin123'
    
    if (adminPassword !== ADMIN_PASSWORD) {
      error('Acceso denegado', 'Contraseña de administrador incorrecta')
      return
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los datos de ejemplo?\n\nEsto incluye:\n- Todos los clientes\n- Todas las facturas\n- Todos los productos\n\nEsta acción no se puede deshacer.')) {
      try {
        clearAllSampleData()
        success('Datos eliminados', 'Todos los datos de ejemplo han sido eliminados. Recarga la página para ver los cambios.')
        setShowPasswordModal(false)
        setAdminPassword('')
      } catch (err: any) {
        error('Error', 'No se pudieron eliminar los datos de ejemplo')
      }
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordModal(false)
    setAdminPassword('')
  }

  const tableColumns = [
    {
      key: 'name',
      label: 'Cliente',
      render: (customer: Customer) => {
        if (!customer) return <div>-</div>
        return (
          <div>
            <div className="font-medium text-neutral-900">{customer.name || 'Sin nombre'}</div>
            <div className="text-sm text-neutral-500">{customer.phone || 'Sin teléfono'}</div>
          </div>
        )
      }
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer: Customer) => {
        if (!customer) return <div>-</div>
        return (
          <div className="text-sm text-neutral-600">
            {customer.email || 'No registrado'}
          </div>
        )
      }
    },
    {
      key: 'balance',
      label: 'Saldo',
      render: (customer: Customer) => {
        if (!customer) return <div>-</div>
        return (
          <div className={`font-semibold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCRC(customer.balance || 0)}
          </div>
        )
      }
    },
    {
      key: 'lastPurchase',
      label: 'Última Compra',
      render: (customer: Customer) => {
        if (!customer) return <div>-</div>
        return (
          <div className="text-sm text-neutral-600">
            {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'}
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (customer: Customer) => {
        if (!customer) return <div>-</div>
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(customer)}
            icon={Eye}
          />
        )
      }
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <MobileHeader title="Clientes" />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Gestión de Clientes</h1>
                <p className="text-neutral-600 mt-1">
                  Administra los clientes y sus saldos de crédito
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus size={16} />}
                  className="whitespace-nowrap"
                >
                  Nuevo Cliente
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearSampleData}
                  icon={<Trash2 size={16} />}
                  className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Limpiar Datos
                </Button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 bg-neutral-50 border-b border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-600">Total Clientes</div>
                    <div className="text-xl font-bold text-neutral-900">{customers.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DollarSign className="text-red-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-600">Con Saldo Pendiente</div>
                    <div className="text-xl font-bold text-red-600">{customersWithBalance.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-600">Saldo Total</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatCRC(customers.reduce((sum, c) => sum + c.balance, 0))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customers with Balance */}
          {customersWithBalance.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <DollarSign className="text-red-600" size={20} />
                Clientes con Saldo Pendiente ({customersWithBalance.length})
              </h2>
              <ResponsiveTable
                columns={tableColumns}
                data={customersWithBalance}
                keyField="id"
                emptyMessage="No hay clientes con saldo pendiente"
              />
            </div>
          )}

          {/* All Customers */}
          <div className="p-6 border-t border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Todos los Clientes ({filteredCustomers.length})
            </h2>
            <ResponsiveTable
              columns={tableColumns}
              data={filteredCustomers}
              keyField="id"
              emptyMessage="No se encontraron clientes"
            />
          </div>
        </div>
      </main>

      {/* Customer Detail Modal */}
      {showDetail && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-strong">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Detalle del Cliente</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                  disabled={isProcessing}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-neutral-400" size={20} />
                  <div>
                    <div className="font-medium text-neutral-900">{selectedCustomer.name}</div>
                    <div className="text-sm text-neutral-500">Cliente</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="text-neutral-400" size={20} />
                  <div>
                    <div className="font-medium text-neutral-900">{selectedCustomer.phone}</div>
                    <div className="text-sm text-neutral-500">Teléfono</div>
                  </div>
                </div>
                
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-neutral-400" size={20} />
                    <div>
                      <div className="font-medium text-neutral-900">{selectedCustomer.email}</div>
                      <div className="text-sm text-neutral-500">Email</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <DollarSign className="text-red-500" size={20} />
                  <div>
                    <div className="font-bold text-xl text-red-600">{formatCRC(selectedCustomer.balance)}</div>
                    <div className="text-sm text-neutral-500">Saldo Pendiente</div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              {selectedCustomer.balance > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Registrar Pago</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Monto del pago:
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        max={selectedCustomer.balance}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="text-xs text-neutral-500 mt-1">
                        Máximo: {formatCRC(selectedCustomer.balance)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDetail(false)}
                  disabled={isProcessing}
                >
                  Cerrar
                </Button>
                {selectedCustomer.balance > 0 && (
                  <Button
                    variant="primary"
                    onClick={handlePayment}
                    loading={isProcessing}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  >
                    Registrar Pago
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-strong">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Nuevo Cliente</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                  disabled={isProcessing}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: 8888-1234"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ej: juan@email.com"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dirección (opcional)
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ej: San José, Costa Rica"
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Límite de crédito
                </label>
                <input
                  type="number"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, creditLimit: parseInt(e.target.value) || 0 }))}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <div className="text-xs text-neutral-500 mt-1">
                  Límite sugerido: {formatCRC(50000)}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateCustomer}
                  loading={isProcessing}
                  disabled={!newCustomer.name.trim() || !newCustomer.phone.trim()}
                >
                  Crear Cliente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contraseña de Administrador */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-neutral-900">
                  Contraseña de Administrador
                </h2>
              </div>
              <p className="text-sm text-neutral-600 mt-2">
                Esta acción requiere permisos de administrador. Ingresa la contraseña para continuar.
              </p>
            </div>

            <div className="p-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Ingresa la contraseña de administrador"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit()
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handlePasswordCancel}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handlePasswordSubmit}
                  disabled={!adminPassword.trim()}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}