import { useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Archive, ShoppingCart, Trash2, Eye, Clock } from 'lucide-react'
import { useSales } from '../store/sales'
import { useCart } from '../store/cart'
import { useToastContext } from '../contexts/ToastContext'
import { formatCRC } from '../utils/format'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import type { HoldSale, Product } from '../types'

// Función para obtener productos (copiada del Catalog)
const fetchProducts = async (): Promise<Product[]> => {
  // Simulamos una llamada a API con datos mock
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Arroz Premium 1kg', price: 1200, costPrice: 800, stock: 50, category: 'Granos' },
        { id: 2, name: 'Frijoles Negros 500g', price: 800, costPrice: 500, stock: 30, category: 'Granos' },
        { id: 3, name: 'Aceite Vegetal 1L', price: 2500, costPrice: 1800, stock: 25, category: 'Aceites' },
        { id: 4, name: 'Leche Entera 1L', price: 1100, costPrice: 750, stock: 40, category: 'Lácteos' },
        { id: 5, name: 'Pan Integral', price: 1500, costPrice: 900, stock: 20, category: 'Panadería' },
        { id: 6, name: 'Pollo Entero', price: 3500, costPrice: 2200, stock: 15, category: 'Carnes' },
        { id: 7, name: 'Bananos 1kg', price: 900, costPrice: 600, stock: 35, category: 'Frutas' },
        { id: 8, name: 'Coca Cola 2L', price: 1800, costPrice: 1200, stock: 45, category: 'Bebidas' },
      ])
    }, 100)
  })
}

export default function HoldSales() {
  const { getHoldSales, deleteHoldSale, convertHoldSaleToSale } = useSales()
  const { clear: clearCart, add: addToCart } = useCart()
  const { success, error } = useToastContext()
  const [, setLocation] = useLocation()
  const [selectedHoldSale, setSelectedHoldSale] = useState<HoldSale | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Obtener productos para poder recuperar las ventas
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const holdSales = getHoldSales()

  const handleRecoverSale = (holdSale: HoldSale) => {
    try {
      // Limpiar carrito actual
      clearCart()
      
      // Agregar cada item del hold sale al carrito
      holdSale.items.forEach(item => {
        // Buscar el producto completo por ID
        const product = products.find(p => p.id === item.productId)
        if (product) {
          // Agregar el producto con la cantidad guardada
          addToCart(product, item.quantity)
        } else {
          console.warn(`Producto con ID ${item.productId} no encontrado`)
        }
      })
      
      // No eliminar la venta guardada inmediatamente
      success('Venta recuperada', 'Los productos han sido agregados al carrito')
      
      // Redirigir al catálogo después de un breve delay
      setTimeout(() => {
        setLocation('/')
      }, 1000)
    } catch (err) {
      console.error('Error al recuperar venta:', err)
      error('Error', 'No se pudo recuperar la venta')
    }
  }

  const handleCompleteSale = (holdSale: HoldSale) => {
    try {
      convertHoldSaleToSale(holdSale.id)
      success('Venta completada', 'La venta guardada ha sido procesada')
    } catch (err) {
      error('Error', 'No se pudo completar la venta')
    }
  }

  const handleDeleteSale = () => {
    if (selectedHoldSale) {
      try {
        deleteHoldSale(selectedHoldSale.id)
        success('Venta eliminada', 'La venta guardada ha sido eliminada')
        setShowDeleteConfirm(false)
        setSelectedHoldSale(null)
      } catch (err) {
        error('Error', 'No se pudo eliminar la venta')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Archive className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ventas Guardadas
        </h1>
      </div>

      {holdSales.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No hay ventas guardadas
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Las ventas guardadas aparecerán aquí cuando uses F9 en el punto de venta
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {holdSales.map((holdSale) => (
            <div
              key={holdSale.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Venta #{holdSale.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(holdSale.createdAt)} • {holdSale.cashierName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCRC(holdSale.total)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {holdSale.items.length} producto{holdSale.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedHoldSale(holdSale)
                    setShowDetails(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRecoverSale(holdSale)}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Recuperar al carrito
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleCompleteSale(holdSale)}
                  className="flex items-center gap-2"
                >
                  Completar venta
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedHoldSale(holdSale)
                    setShowDeleteConfirm(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatCRC(holdSale.subtotalWithoutTax)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Impuestos:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatCRC(holdSale.taxAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="ml-2 font-bold text-lg text-gray-900 dark:text-white">
                      {formatCRC(holdSale.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedHoldSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalles de Venta #{selectedHoldSale.id.slice(-8)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Cerrar
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedHoldSale.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cajero:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedHoldSale.cashierName}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Productos ({selectedHoldSale.items.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedHoldSale.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCRC(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCRC(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCRC(selectedHoldSale.subtotalWithoutTax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Impuestos:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCRC(selectedHoldSale.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCRC(selectedHoldSale.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSale}
        title="Eliminar venta guardada"
        message={`¿Estás seguro de que deseas eliminar la venta #${selectedHoldSale?.id.slice(-8)}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}