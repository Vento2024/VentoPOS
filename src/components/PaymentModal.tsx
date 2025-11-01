import { useState } from 'react'
import { CreditCard, DollarSign, Smartphone, UserPlus, X, Percent, AlertTriangle, Shield } from 'lucide-react'
import Button from './Button'
import { formatCRC } from '../utils/format'
import { SalesValidationService } from '../services/salesValidationService'
import { InvoiceService } from '../services/invoiceService'
import InvoiceOptions from './InvoiceOptions'
import type { PaymentMethod, PaymentDetails, Invoice, CartItem } from '../types'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  subtotal: number
  tax: number
  discount: number
  items: CartItem[]
  cashierId: string
  cashierName: string
  onConfirm: (paymentDetails: PaymentDetails, customerData?: {
    name: string
    phone: string
    email?: string
  }, discountAmount?: number) => void
  onInvoiceComplete?: () => void
  isProcessing: boolean
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  total, 
  subtotal,
  tax,
  discount,
  items,
  cashierId,
  cashierName,
  onConfirm,
  onInvoiceComplete,
  isProcessing
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)
  const [requiresAuthorization, setRequiresAuthorization] = useState(false)
  const [authorizationCode, setAuthorizationCode] = useState('')
  const [showInvoiceOptions, setShowInvoiceOptions] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null)

  if (!isOpen) return null

  const discountAmountNum = parseFloat(discountAmount) || 0
  const maxDiscount = subtotal * 0.5 // 50% máximo
  const discountValidation = SalesValidationService.validateDiscount(subtotal, discountAmountNum)
  const isDiscountValid = discountValidation.isValid
  const finalTotal = total - discountAmountNum
  
  // Verificar si requiere autorización
  const needsAuth = discountAmountNum > 0 && SalesValidationService.requiresDiscountAuthorization(subtotal, discountAmountNum)
  
  // Actualizar estado de autorización cuando cambia el descuento
  if (needsAuth !== requiresAuthorization) {
    setRequiresAuthorization(needsAuth)
    if (!needsAuth) {
      setAuthorizationCode('')
    }
  }
  const receivedAmountNum = parseFloat(receivedAmount) || 0
  const changeAmount = receivedAmountNum - finalTotal

  const handleConfirm = () => {
    // Validar descuento si se aplica
    if (discountAmountNum > 0 && !isDiscountValid) {
      return
    }

    // Validar autorización si es requerida
    if (requiresAuthorization && authorizationCode !== 'ADMIN2024') {
      return
    }

    // Validar límites de efectivo
    if (paymentMethod === 'cash') {
      const cashValidation = SalesValidationService.validateCashLimits(finalTotal)
      if (!cashValidation.isValid) {
        alert(cashValidation.reason)
        return
      }
    }

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'cash' && {
        cashAmount: finalTotal,
        receivedAmount: receivedAmountNum,
        changeAmount: Math.max(0, changeAmount)
      }),
      ...(paymentMethod === 'card' && {
        cardAmount: finalTotal
      }),
      ...(paymentMethod === 'sinpe' && {
        sinpeAmount: finalTotal
      }),
      ...(paymentMethod === 'credit' && {
        creditAmount: finalTotal
      })
    }

    const customerData = paymentMethod === 'credit' ? {
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined
    } : {
      name: customerName || 'Cliente',
      phone: customerPhone,
      email: customerEmail || undefined
    }

    // Generar factura
    const invoice = InvoiceService.createInvoice({
      items,
      subtotal,
      tax,
      discount: discountAmountNum,
      total: finalTotal,
      paymentMethod,
      paymentDetails,
      isCredit: paymentMethod === 'credit',
      creditDueDate: paymentMethod === 'credit' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      customerId: undefined,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      cashierId,
      cashierName
    })

    // Establecer factura generada y mostrar opciones
    setGeneratedInvoice(invoice)
    setShowInvoiceOptions(true)

    // Llamar al onConfirm original
    onConfirm(paymentDetails, customerData, discountAmountNum > 0 ? discountAmountNum : undefined)
  }

  const handleCloseInvoiceOptions = () => {
    setShowInvoiceOptions(false)
    setGeneratedInvoice(null)
    // Resetear el modal
    setPaymentMethod('cash')
    setReceivedAmount('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setDiscountAmount('')
    setShowDiscount(false)
    setRequiresAuthorization(false)
    setAuthorizationCode('')
    onClose()
    // Llamar al callback para completar el flujo
    onInvoiceComplete?.()
  }

  const isValid = () => {
    // Validar descuento
    if (discountAmountNum > 0 && !isDiscountValid) {
      return false
    }
    
    // Validar autorización si es requerida
    if (requiresAuthorization && authorizationCode !== 'ADMIN2024') {
      return false
    }
    
    if (paymentMethod === 'cash') {
      return receivedAmountNum >= finalTotal
    }
    if (paymentMethod === 'credit') {
      return customerName.trim() && customerPhone.trim()
    }
    return true
  }

  const paymentMethods = [
    { value: 'cash' as const, label: 'Efectivo', icon: DollarSign, color: 'bg-green-900 text-green-300 border-green-700' },
    { value: 'card' as const, label: 'Tarjeta', icon: CreditCard, color: 'bg-blue-900 text-blue-300 border-blue-700' },
    { value: 'sinpe' as const, label: 'SINPE', icon: Smartphone, color: 'bg-purple-900 text-purple-300 border-purple-700' },
    { value: 'credit' as const, label: 'Crédito', icon: UserPlus, color: 'bg-orange-900 text-orange-300 border-orange-700' }
  ]

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full shadow-2xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Método de Pago</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              disabled={isProcessing}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Total */}
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Total original:</div>
              <div className="text-lg font-semibold text-white">{formatCRC(total)}</div>
            </div>
            
            {/* Discount Section */}
            <div className="border-t border-gray-700 pt-2">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowDiscount(!showDiscount)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <Percent size={16} />
                  {showDiscount ? 'Ocultar descuento' : 'Aplicar descuento'}
                </button>
                {discountAmountNum > 0 && (
                  <div className="text-sm text-red-400 font-medium">
                    -{formatCRC(discountAmountNum)}
                  </div>
                )}
              </div>
              
              {showDiscount && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Monto de descuento (máx. {formatCRC(maxDiscount)}):
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder="0"
                      className={`w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white ${
                        !isDiscountValid ? 'border-red-500 bg-red-900/20' : 'border-gray-600'
                      }`}
                      min="0"
                      max={maxDiscount}
                      step="0.01"
                    />
                  </div>
                  
                  {!isDiscountValid && discountAmountNum > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-400">
                      <AlertTriangle size={12} />
                      El descuento no puede exceder el 50% del subtotal
                    </div>
                  )}
                  
                  {discountAmountNum > 0 && isDiscountValid && (
                    <div className="text-xs text-green-400">
                      Descuento aplicado: {((discountAmountNum / subtotal) * 100).toFixed(1)}%
                    </div>
                  )}
                  
                  {!isDiscountValid && discountAmountNum > 0 && (
                    <div className="text-xs text-red-400">
                      {discountValidation.reason}
                    </div>
                  )}
                </div>
              )}
              
              {/* Authorization Required */}
              {requiresAuthorization && (
                <div className="mt-3 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">
                      Autorización Requerida
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 mb-2">
                    Este descuento requiere código de autorización del supervisor
                  </p>
                  <input
                    type="password"
                    placeholder="Código de autorización"
                    value={authorizationCode}
                    onChange={(e) => setAuthorizationCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-800 text-white"
                  />
                  {authorizationCode && authorizationCode !== 'ADMIN2024' && (
                    <div className="text-xs text-red-400 mt-1">
                      Código de autorización incorrecto
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Final Total */}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300">Total a pagar:</div>
                <div className="text-xl font-bold text-white">{formatCRC(finalTotal)}</div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seleccionar método de pago:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      paymentMethod === method.value
                        ? method.color
                        : 'bg-gray-800 border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <Icon size={20} className="mx-auto mb-1" />
                    <div className="text-sm font-medium">{method.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Monto recibido:
                </label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  min="0"
                  step="0.01"
                />
              </div>
              {receivedAmountNum > 0 && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cambio:</span>
                    <span className={`font-medium ${changeAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCRC(Math.max(0, changeAmount))}
                    </span>
                  </div>
                  {changeAmount < 0 && (
                    <div className="text-xs text-red-400 mt-1">
                      Monto insuficiente
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Credit Payment Details */}
          {paymentMethod === 'credit' && (
            <div className="space-y-3">
              <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-700">
                <div className="text-sm text-orange-300 font-medium mb-1">Venta a Crédito</div>
                <div className="text-xs text-orange-400">
                  Se creará un cliente automáticamente y se registrará el saldo pendiente.
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre del cliente: *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono: *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="8888-8888"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email (opcional):
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mostrar opciones de facturación si están disponibles */}
        {showInvoiceOptions && generatedInvoice ? (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <InvoiceOptions 
              invoice={generatedInvoice}
              onClose={handleCloseInvoiceOptions}
              showTitle={true}
            />
          </div>
        ) : (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                loading={isProcessing}
                disabled={!isValid()}
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}