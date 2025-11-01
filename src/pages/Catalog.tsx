import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import Button from '../components/Button'
import PaymentModal from '../components/PaymentModal'
import { QuantityModal } from '../components/QuantityModal'

import { useCart, cartTotals } from '../store/cart'
import { useSales } from '../store/sales'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'
import { formatCRC } from '../utils/format'
import { reinitializeProducts } from '../data/seedData'
import { ProductService } from '../services/productService'
import type { Product, PaymentDetails } from '../types'

// Mock API function - replace with actual API call
const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Get products using ProductService
  try {
    const products = ProductService.getAllProducts()
    return products.filter(product => product.isActive) // Solo productos activos
  } catch (error) {
    console.error('Error al cargar productos:', error)
    return []
  }
}

export default function Catalog() {
  const [showPayment, setShowPayment] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedCartItem, setSelectedCartItem] = useState<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { items, add: addToCart, clear, remove: removeItem, setQuantity: updateQuantity } = useCart()
  const { addSale, saveHoldSale } = useSales()
  const { user } = useAuth()
  const { success, error } = useToastContext()
  const [, setLocation] = useLocation()
  const totals = cartTotals(items)

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })

  const categories = ['all', 'Granos', 'Aceites', 'Bebidas', 'Lácteos', 'Carnes', 'Frutas']

  // Función de búsqueda simplificada y más robusta
  const searchProducts = (term: string): Product[] => {
    if (!products || !term || term.length < 1) return []
    
    const searchLower = term.toLowerCase().trim()
    
    const filtered = products.filter(product => {
      if (!product.isActive) return false
      
      // Verificar categoría
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
      
      // Búsqueda en múltiples campos
      const searchFields = [
        product.name?.toLowerCase() || '',
        product.description?.toLowerCase() || '',
        product.id?.toString() || '',
        product.barcode || '',
        product.price?.toString() || ''
      ]
      
      return searchFields.some(field => field.includes(searchLower))
    })
    
    console.log(`🔍 Búsqueda: "${term}" -> ${filtered.length} resultados`)
    return filtered.slice(0, 10) // Limitar resultados
  }

  const filteredProducts = searchProducts(searchTerm)

  // Manejar clicks fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manejar entrada de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.length > 0)
  }

  // Manejar selección de producto del dropdown - AGREGAR AL CARRITO
  const handleProductSelect = (product: Product) => {
    addToCart(product)
    
    setSearchTerm('')
    setShowDropdown(false)
    setSelectedProduct(product)
    
    // Comentado para evitar notificaciones molestas
    // success('Producto agregado', `${product.name} se agregó al carrito`)
    
    // Enfocar de nuevo el input para continuar escaneando/buscando
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Manejar entrada de escáner (detectar códigos de barra)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // Si hay productos filtrados, seleccionar el primero
      if (filteredProducts.length > 0) {
        handleProductSelect(filteredProducts[0])
      } else if (searchTerm.length > 0) {
        // Buscar por código de barra exacto
        const exactMatch = products?.find(p => 
          p.barcode === searchTerm || 
          p.id.toString() === searchTerm
        )
        
        if (exactMatch) {
          handleProductSelect(exactMatch)
        } else {
          error('Producto no encontrado', `No se encontró un producto con el código: ${searchTerm}`)
          setSearchTerm('')
        }
      }
    }
  }

  // Manejar selección de método de pago
  const handlePaymentMethodSelect = (method: string) => {
    if (items.length === 0) {
      error('Carrito vacío', 'Agrega productos antes de seleccionar el método de pago')
      return
    }
    
    setSelectedPaymentMethod(method)
    setShowPayment(true)
  }

  const handlePaymentConfirm = async (
    paymentDetails: PaymentDetails, 
    customerData?: { name: string; phone: string; email?: string },
    discountAmount?: number
  ) => {
    setIsProcessing(true)
    try {
      const now = new Date()
      const finalTotal = totals.total - (discountAmount || 0)
      
      const saleData = {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        cashierName: user?.name || 'Cajero',
        customerName: customerData?.name || 'Cliente General',
        customerPhone: customerData?.phone,
        customerEmail: customerData?.email,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        subtotalWithoutTax: totals.subtotalWithoutTax,
        taxAmount: totals.taxAmount,
        discountAmount: discountAmount || 0,
        total: finalTotal,
        paymentDetails,
        status: 'completed' as const
      }

      await addSale(saleData)
      success('Venta procesada', 'La venta se ha registrado exitosamente')
      
      // Limpiar carrito pero NO cerrar el modal aún
      // El modal se cerrará cuando el usuario cierre las opciones de factura
      clear()
      
      // Enfocar de nuevo el input para la siguiente venta
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } catch (err) {
      error('Error al procesar', 'No se pudo completar la venta. Intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearCart = () => {
    clear()
    success('Carrito limpiado', 'Se han removido todos los productos')
  }

  // Funciones para el modal de cantidad
  const handleQuantityClick = (item: any) => {
    setSelectedCartItem(item)
    setShowQuantityModal(true)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedCartItem) {
      if (newQuantity === 0) {
        removeItem(selectedCartItem.productId)
        success('Producto removido', `${selectedCartItem.productName} removido del carrito`)
      } else {
        updateQuantity(selectedCartItem.productId, newQuantity)
        success('Cantidad actualizada', `${selectedCartItem.productName}: ${newQuantity} unidades`)
      }
    }
    setSelectedCartItem(null)
  }

  // Función para reinicializar productos
  const handleReinitializeProducts = () => {
    try {
      // Usar ProductService para reinicializar
      ProductService.reinitializeProducts()
      refetch() // Refrescar la consulta de productos
      success('Productos reinicializados', 'Los productos de ejemplo han sido restaurados')
    } catch (error) {
      console.error('Error al reinicializar productos:', error)
      error('Error', 'No se pudieron reinicializar los productos')
    }
  }

  // Función para manejar teclas de función
  const handleFunctionKey = (functionName: string) => {
    switch (functionName) {
      case 'F1':
        // Buscar producto
        searchInputRef.current?.focus()
        break
      case 'F2':
        // Efectivo
        handlePaymentMethodSelect('cash')
        break
      case 'F3':
        // Buscar producto (alternativo)
        searchInputRef.current?.focus()
        break
      case 'F4':
        // Tarjeta
        handlePaymentMethodSelect('card')
        break
      case 'F5':
        // SINPE Móvil
        handlePaymentMethodSelect('sinpe')
        break
      case 'F6':
        // Transferencia
        handlePaymentMethodSelect('transfer')
        break
      case 'F7':
        // Descuento
        if (items.length > 0) {
          // Aquí podrías abrir un modal de descuento
          success('Descuento', 'Función de descuento - Por implementar')
        } else {
          error('Carrito vacío', 'Agrega productos antes de aplicar descuento')
        }
        break
      case 'F8':
        // Crédito
        handlePaymentMethodSelect('credit')
        break
      case 'F9':
        // Guardar venta (hold)
        if (items.length > 0) {
          const holdSaleData = {
            cashierName: user?.name || 'Cajero',
            items,
            subtotalWithoutTax: totals.subtotalWithoutTax,
            taxAmount: totals.taxAmount,
            total: totals.total
          }
          
          const holdId = saveHoldSale(holdSaleData)
          success('Venta guardada', `Venta guardada con ID: ${holdId.slice(-4)}`)
          clear()
        } else {
          error('Carrito vacío', 'No hay productos para guardar')
        }
        break
      case 'F10':
        // Procesar Pago
        if (items.length > 0) {
          setShowPayment(true)
        } else {
          error('Carrito vacío', 'Agrega productos antes de procesar el pago')
        }
        break
      case 'F11':
        // Limpiar carrito
        if (items.length > 0) {
          handleClearCart()
        }
        break
      case 'F12':
        // Cambiar cantidad del último item
        if (items.length > 0) {
          const lastItem = items[items.length - 1]
          handleQuantityClick(lastItem)
        } else {
          error('Carrito vacío', 'Agrega productos antes de cambiar cantidades')
        }
        break
      case 'Delete':
        // Anular orden
        if (items.length > 0) {
          handleClearCart()
        }
        break
      default:
        console.log(`Función ${functionName} no implementada`)
    }
  }

  // Agregar listener para teclas de función
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevenir que las teclas de función afecten otros elementos
      if (e.key.startsWith('F') || e.key === 'Delete') {
        e.preventDefault()
        handleFunctionKey(e.key)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [items.length]) // Dependencia para que se actualice cuando cambie el carrito

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header unificado */}
      <div className="bg-gray-800 border-b border-gray-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Minisúper El Ventolero</h1>
          {/* Botón temporal para reinicializar productos */}
          {(!products || products.length === 0) && (
            <button
              onClick={handleReinitializeProducts}
              className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              <span>🔄</span>
              <span>Restaurar Productos</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-70px)]">
        {/* Panel izquierdo - Tabla de productos */}
        <div className="flex-1 bg-gray-900">
          {/* Barra de búsqueda */}
          <div className="p-4 bg-gray-800 border-b border-gray-600">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar producto o escanear código..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                autoFocus
              />
              
              {/* Dropdown de resultados */}
              {showDropdown && filteredProducts.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-500 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-500 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{product.name}</div>
                          <div className="text-gray-300 text-sm">{product.barcode}</div>
                        </div>
                        <div className="text-green-400 font-bold">{formatCRC(product.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="flex-1 bg-gray-900">
            {/* Table Header */}
            <div className="bg-gray-800 border-b border-gray-600">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-300">
                <div className="col-span-6">Nombre del producto</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🛒</div>
                    <p>No hay productos en el carrito</p>
                    <p className="text-sm mt-1">Busca o escanea productos para agregar</p>
                  </div>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.productId} className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-black'}`}>
                    <div className="col-span-8">
                      <div className="text-white font-medium">{item.productName}</div>
                      <div className="text-gray-400 text-sm">#{item.productId} • Cantidad: {item.quantity}</div>
                    </div>
                    <div className="col-span-2 text-right text-white">{formatCRC(item.unitPrice)}</div>
                    <div className="col-span-2 text-right text-green-400 font-bold">{formatCRC(item.totalPrice)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Funciones y Pago */}
        <div className="w-80 bg-gray-800 flex flex-col">
          {/* Botones de función */}
          <div className="p-4 bg-gray-800 border-b border-gray-600">
            <h2 className="text-sm font-medium text-gray-300 mb-3">Métodos de Pago</h2>
            <div className="grid grid-cols-2 gap-3">
            {/* Row 1 - Métodos de Pago */}
            <button 
              onClick={() => handleFunctionKey('F2')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F2</div>
              <div>Efectivo</div>
            </button>
            <button 
              onClick={() => handleFunctionKey('F4')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F4</div>
              <div>Tarjeta</div>
            </button>

            {/* Row 2 - Más Métodos de Pago */}
            <button 
              onClick={() => handleFunctionKey('F5')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F5</div>
              <div>SINPE Móvil</div>
            </button>
            <button 
              onClick={() => handleFunctionKey('F6')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F6</div>
              <div>Transferencia</div>
            </button>

            {/* Row 3 - Funciones Especiales */}
            <button 
              onClick={() => handleFunctionKey('F8')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F8</div>
              <div>Crédito</div>
            </button>
            <button 
              onClick={() => handleFunctionKey('F7')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F7</div>
              <div>Descuento</div>
            </button>

            {/* Row 4 - Utilidades */}
            <button 
              onClick={() => handleFunctionKey('F1')}
              className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F1</div>
              <div>Buscar</div>
            </button>
            <button 
              onClick={() => handleFunctionKey('F12')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F12</div>
              <div>Cambiar Cantidad</div>
            </button>

            {/* Row 5 - Acciones de Venta */}
            <button 
              onClick={() => handleFunctionKey('F9')}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F9</div>
              <div>Guardar</div>
            </button>
            <button 
              onClick={() => handleFunctionKey('F11')}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">F11</div>
              <div>Limpiar</div>
            </button>

            {/* Bottom Row - Pago Principal */}
            <button 
              onClick={() => handleFunctionKey('F10')}
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded text-lg font-bold"
            >
              <div className="text-sm">F10</div>
              <div>PROCESAR PAGO</div>
            </button>

            {/* Action Buttons */}
            <button 
              onClick={() => handleFunctionKey('Delete')}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded text-sm font-medium"
            >
              <div className="text-xs">Del</div>
              <div>Anular Orden</div>
            </button>
            <button 
              onClick={() => {
                if (user?.role === 'admin') {
                  setLocation('/inventory')
                } else {
                  error('Acceso Denegado', 'Solo los administradores pueden acceder al inventario')
                }
              }}
              className={`p-3 rounded text-sm font-medium transition-colors ${
                user?.role === 'admin' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white opacity-50 cursor-not-allowed'
              }`}
              title={user?.role === 'admin' ? 'Ir al Inventario' : 'Solo para administradores'}
            >
              <div className="text-xs">{user?.role === 'admin' ? '📦' : '•••'}</div>
              <div>{user?.role === 'admin' ? 'Inventario' : 'Reservado'}</div>
            </button>
            </div>
          </div>

          {/* Sección de totales */}
          <div className="mt-auto bg-gray-700 p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-white">
                <span>Subtotal</span>
                <span className="font-mono">{formatCRC(totals.subtotalWithoutTax)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Impuestos</span>
                <span className="font-mono">{formatCRC(totals.taxAmount)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>TOTAL</span>
                  <span className="font-mono">{formatCRC(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false)
          setSelectedPaymentMethod('')
        }}
        total={totals.total}
        subtotal={totals.subtotalWithoutTax}
        tax={totals.taxAmount}
        discount={0}
        items={items}
        cashierId={user?.id || 'unknown'}
        cashierName={user?.name || 'Cajero'}
        onConfirm={handlePaymentConfirm}
        onInvoiceComplete={() => {
          setShowPayment(false)
          setSelectedPaymentMethod('')
        }}
        isProcessing={isProcessing}
      />

      {/* Quantity Modal */}
      <QuantityModal
        isOpen={showQuantityModal}
        onClose={() => {
          setShowQuantityModal(false)
          setSelectedCartItem(null)
        }}
        onConfirm={handleQuantityChange}
        currentQuantity={selectedCartItem?.quantity || 1}
        productName={selectedCartItem?.productName || ''}
      />
    </div>
  )
}