import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Filter,
  Download,
  Upload,
  BarChart3,
  DollarSign,
  Tag,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileDown
} from 'lucide-react'
import Button from '../components/Button'
import ProductModal from '../components/ProductModal'
import ConfirmDialog from '../components/ConfirmDialog'
import MobileHeader from '../components/MobileHeader'
import ResponsiveTable from '../components/ResponsiveTable'
import { ProductService } from '../services/productService'
import { excelService } from '../services/excelService'
import { useToastContext } from '../contexts/ToastContext'
import { formatCRC } from '../utils/format'
import type { Product } from '../types'

export default function Inventory() {
  const { success, error } = useToastContext()
  
  // Referencias
  const excelInputRef = useRef<HTMLInputElement>(null)
  
  // Estados principales
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showLowStock, setShowLowStock] = useState(false)
  
  // Estados de modales
  const [showProductModal, setShowProductModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  
  // Estados de vista
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  
  // Categorías disponibles
  const [categories, setCategories] = useState<string[]>([])

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts()
  }, [])

  // Filtrar productos cuando cambien los filtros
  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, showLowStock])

  const loadProducts = () => {
    setIsLoading(true)
    try {
      const allProducts = ProductService.getAllProducts()
      setProducts(allProducts)
      setCategories(ProductService.getCategories())
    } catch (err) {
      console.error('Error al cargar productos:', err)
      error('Error', 'No se pudieron cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = ProductService.searchProducts(searchTerm)
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filtro por stock bajo
    if (showLowStock) {
      filtered = filtered.filter(p => p.stock <= p.minStock)
    }

    setFilteredProducts(filtered)
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setShowProductModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setModalMode('edit')
    setShowProductModal(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      const success = ProductService.deleteProduct(selectedProduct.id)
      if (success) {
        loadProducts()
        success('Producto eliminado', `${selectedProduct.name} se eliminó del inventario`)
      } else {
        error('Error', 'No se pudo eliminar el producto')
      }
    }
    setShowDeleteConfirm(false)
    setSelectedProduct(null)
  }

  const handleProductSaved = () => {
    loadProducts()
  }

  const handleExportProducts = () => {
    try {
      const jsonData = ProductService.exportProducts()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `productos_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      success('Exportación exitosa', 'Productos exportados en formato JSON')
    } catch (err) {
      error('Error', 'No se pudo exportar los productos')
    }
  }

  // Funciones de Excel
  const handleExportToExcel = () => {
    try {
      excelService.exportProductsToExcel(products)
      success('Exportación exitosa', 'Inventario exportado a Excel')
    } catch (err) {
      error('Error', 'No se pudo exportar a Excel')
    }
  }

  const handleDownloadTemplate = () => {
    try {
      excelService.downloadTemplate()
      success('Template descargado', 'Use este archivo para cargar productos masivamente')
    } catch (err) {
      error('Error', 'No se pudo descargar el template')
    }
  }

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      error('Formato incorrecto', 'Por favor seleccione un archivo Excel (.xlsx o .xls)')
      return
    }

    try {
      setIsLoading(true)
      const result = await excelService.importProductsFromExcel(file)
      
      if (result.success && result.products.length > 0) {
        // Procesar productos importados
        let importedCount = 0
        let updatedCount = 0
        
        for (const product of result.products) {
          const existingProduct = ProductService.getProductByCode(product.code)
          
          if (existingProduct) {
            // Actualizar producto existente
            const updated = ProductService.updateProduct(existingProduct.id, {
              ...product,
              id: existingProduct.id
            })
            if (updated) updatedCount++
          } else {
            // Crear nuevo producto
            const created = ProductService.createProduct(product)
            if (created) importedCount++
          }
        }
        
        loadProducts()
        
        let message = ''
        if (importedCount > 0) message += `${importedCount} productos nuevos importados`
        if (updatedCount > 0) {
          if (message) message += ', '
          message += `${updatedCount} productos actualizados`
        }
        
        success('Importación exitosa', message)
        
        // Mostrar advertencias si las hay
        if (result.warnings.length > 0) {
          console.warn('Advertencias de importación:', result.warnings)
        }
        
      } else {
        error('Error de importación', result.errors.join(', ') || 'No se pudieron procesar los productos')
      }
      
    } catch (err) {
      error('Error', 'No se pudo procesar el archivo Excel')
    } finally {
      setIsLoading(false)
      // Limpiar el input
      if (excelInputRef.current) {
        excelInputRef.current.value = ''
      }
    }
  }

  const handleImportProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const result = ProductService.importProducts(jsonData)
        
        if (result.success) {
          loadProducts()
          success('Importación exitosa', `${result.count} productos importados`)
        } else {
          error('Error de importación', result.message)
        }
      } catch (err) {
        error('Error', 'No se pudo procesar el archivo')
      }
    }
    reader.readAsText(file)
    
    // Limpiar el input
    event.target.value = ''
  }

  const lowStockProducts = products.filter(p => p.stock <= p.minStock)
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0)

  // Configuración de la tabla
  const tableColumns = [
    {
      key: 'name',
      label: 'Producto',
      render: (product: Product) => (
        <div>
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.category}</div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      render: (product: Product) => (
        <div className="text-right">
          <div className="font-medium">{formatCRC(product.price)}</div>
          <div className="text-sm text-gray-500">Costo: {formatCRC(product.cost)}</div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product: Product) => (
        <div className="text-center">
          <div className={`font-medium ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'}`}>
            {product.stock}
          </div>
          <div className="text-sm text-gray-500">Min: {product.minStock}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (product: Product) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleEditProduct(product)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar producto"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteProduct(product)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Cargando inventario...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header móvil */}
      <MobileHeader title="Gestión de Inventario" />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-xl font-bold text-red-600">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-xl font-bold text-green-600">{formatCRC(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Costo Total</p>
              <p className="text-xl font-bold text-orange-600">{formatCRC(totalCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos por nombre, descripción o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                showLowStock 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle size={16} className="inline mr-1" />
              Stock Bajo
            </button>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleCreateProduct}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar
            </Button>

            {/* Botones de Excel */}
            <button
              onClick={handleExportToExcel}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              title="Exportar a Excel"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Descargar template de Excel"
            >
              <FileDown size={16} />
              <span className="hidden sm:inline">Template</span>
            </button>

            <label className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-2" title="Importar desde Excel">
              <Upload size={16} />
              <span className="hidden sm:inline">Importar Excel</span>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFromExcel}
                className="hidden"
              />
            </label>

            {/* Separador */}
            <div className="border-l border-gray-300 mx-1"></div>

            {/* Botones JSON originales */}
            <button
              onClick={handleExportProducts}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Exportar JSON"
            >
              <Download size={16} />
            </button>

            <label className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" title="Importar JSON">
              <Upload size={16} />
              <input
                type="file"
                accept=".json"
                onChange={handleImportProducts}
                className="hidden"
              />
            </label>

            <button
              onClick={loadProducts}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' || showLowStock 
                ? 'No se encontraron productos' 
                : 'No hay productos en el inventario'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || showLowStock
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto al inventario'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && !showLowStock && (
              <Button variant="primary" onClick={handleCreateProduct}>
                <Plus size={16} className="mr-2" />
                Agregar Primer Producto
              </Button>
            )}
          </div>
        ) : (
          <ResponsiveTable
            data={filteredProducts}
            columns={tableColumns}
            keyField="id"
          />
        )}
      </div>

      {/* Modal de producto */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleProductSaved}
        product={selectedProduct}
        mode={modalMode}
      />

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${selectedProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}