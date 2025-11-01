import { useState, useMemo } from 'react'
import { Search, ShoppingCart, Plus, Minus, X, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

const products: Product[] = [
  // Abarrotes
  { id: '1', name: 'Arroz Diana 500g', price: 25.00, category: 'Abarrotes', stock: 50 },
  { id: '2', name: 'Aceite Gourmet 500ml', price: 42.00, category: 'Abarrotes', stock: 30 },
  { id: '3', name: 'Azúcar San Carlos 1kg', price: 38.00, category: 'Abarrotes', stock: 40 },
  { id: '4', name: 'Sal Refisal 500g', price: 12.00, category: 'Abarrotes', stock: 60 },
  { id: '5', name: 'Pasta Doria 500g', price: 28.00, category: 'Abarrotes', stock: 35 },
  
  // Lácteos
  { id: '6', name: 'Leche Colanta 1L', price: 35.00, category: 'Lácteos', stock: 25 },
  { id: '7', name: 'Queso Fresco 500g', price: 45.00, category: 'Lácteos', stock: 20 },
  { id: '8', name: 'Huevos AA x30', price: 120.00, category: 'Lácteos', stock: 15 },
  
  // Carnes
  { id: '9', name: 'Carne Molida kg', price: 150.00, category: 'Carnes', stock: 10 },
  { id: '10', name: 'Pollo Entero kg', price: 85.00, category: 'Carnes', stock: 15 },
  
  // Frutas y Verduras
  { id: '11', name: 'Plátanos (libra)', price: 6.00, category: 'Frutas y Verduras', stock: 50 },
  { id: '12', name: 'Tomates (libra)', price: 12.00, category: 'Frutas y Verduras', stock: 40 },
  
  // Limpieza
  { id: '13', name: 'Detergente Líquido', price: 35.00, category: 'Limpieza', stock: 25 },
  
  // Cuidado Personal
  { id: '14', name: 'Champú 400ml', price: 28.00, category: 'Cuidado Personal', stock: 20 }
]

const categories = ['Todos', 'Abarrotes', 'Lácteos', 'Carnes', 'Frutas y Verduras', 'Limpieza', 'Cuidado Personal']

export default function PublicCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price)
  }

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return ''
    
    let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n'
    
    cart.forEach(item => {
      message += `• ${item.name} - Cantidad: ${item.quantity} - ${formatPrice(item.price * item.quantity)}\n`
    })
    
    message += `\n*Total: ${formatPrice(getTotalPrice())}*\n\n¡Gracias!`
    
    return encodeURIComponent(message)
  }

  const sendWhatsAppOrder = () => {
    const message = generateWhatsAppMessage()
    const phoneNumber = '50688888888' // Número de WhatsApp del negocio
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Minisúper El Ventolero</h1>
            </div>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Carrito de Compras</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-primary-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-primary-600"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:text-red-700 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}