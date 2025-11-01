import { useState, useEffect } from 'react'
import { X, Save, Package, DollarSign, Hash, Tag, BarChart3, AlertTriangle } from 'lucide-react'
import Button from './Button'
import { ProductService } from '../services/productService'
import { useToastContext } from '../contexts/ToastContext'
import type { Product } from '../types'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  product?: Product | null
  mode: 'create' | 'edit'
}

export default function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const { success, error } = useToastContext()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    barcode: '',
    isPorPeso: false
  })

  // Categorías disponibles
  const [categories] = useState(() => ProductService.getCategories())

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          category: product.category,
          price: product.price.toString(),
          cost: product.cost.toString(),
          stock: product.stock.toString(),
          minStock: product.minStock.toString(),
          barcode: product.barcode || '',
          isPorPeso: product.isPorPeso || false
        })
      } else {
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          cost: '',
          stock: '',
          minStock: '5',
          barcode: '',
          isPorPeso: false
        })
      }
      setErrors([])
    }
  }, [isOpen, mode, product])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    try {
      // Preparar datos del producto
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
        barcode: formData.barcode.trim() || undefined,
        isPorPeso: formData.isPorPeso
      }

      // Validar datos
      const validation = ProductService.validateProduct(productData)
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      // Crear o actualizar producto
      if (mode === 'create') {
        ProductService.createProduct(productData)
        success('Producto creado', `${productData.name} se agregó al inventario`)
      } else if (mode === 'edit' && product) {
        ProductService.updateProduct(product.id, productData)
        success('Producto actualizado', `${productData.name} se actualizó correctamente`)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error al guardar producto:', err)
      error('Error', 'No se pudo guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? 'Agregar Producto' : 'Editar Producto'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Completa la información del nuevo producto' 
                  : 'Modifica la información del producto'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Errores */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-800 mb-1">Errores de validación:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package size={16} className="inline mr-1" />
                Nombre del producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Arroz Diana 1kg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción opcional del producto"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag size={16} className="inline mr-1" />
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="nueva">+ Nueva categoría</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash size={16} className="inline mr-1" />
                Código de barras
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Código de barras (opcional)"
              />
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Precio de venta *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Costo *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BarChart3 size={16} className="inline mr-1" />
                Stock actual *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle size={16} className="inline mr-1" />
                Stock mínimo *
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5"
                required
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPorPeso"
              checked={formData.isPorPeso}
              onChange={(e) => handleInputChange('isPorPeso', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPorPeso" className="text-sm font-medium text-gray-700">
              Producto vendido por peso
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={16} />
                  {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}