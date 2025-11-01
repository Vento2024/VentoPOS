import type { Product } from '../types'
import { sampleProducts } from '../data/seedData'

export class ProductService {
  private static STORAGE_KEY = 'ventopos_products'

  // Obtener todos los productos
  static getAllProducts(): Product[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      // Si no hay productos guardados, usar los de muestra
      this.saveProducts(sampleProducts)
      return sampleProducts
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return sampleProducts
    }
  }

  // Guardar productos en localStorage
  private static saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))
    } catch (error) {
      console.error('Error al guardar productos:', error)
    }
  }

  // Obtener producto por ID
  static getProductById(id: string): Product | null {
    const products = this.getAllProducts()
    return products.find(p => p.id === id) || null
  }

  // Obtener producto por código
  static getProductByCode(code: string): Product | null {
    const products = this.getAllProducts()
    return products.find(p => p.code.toLowerCase() === code.toLowerCase()) || null
  }

  // Crear nuevo producto
  static createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getAllProducts()
    
    // Generar ID único
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    products.push(newProduct)
    this.saveProducts(products)
    
    return newProduct
  }

  // Actualizar producto existente
  static updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
    const products = this.getAllProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return null
    }

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    products[index] = updatedProduct
    this.saveProducts(products)
    
    return updatedProduct
  }

  // Eliminar producto
  static deleteProduct(id: string): boolean {
    const products = this.getAllProducts()
    const filteredProducts = products.filter(p => p.id !== id)
    
    if (filteredProducts.length === products.length) {
      return false // Producto no encontrado
    }

    this.saveProducts(filteredProducts)
    return true
  }

  // Buscar productos
  static searchProducts(query: string): Product[] {
    const products = this.getAllProducts()
    const searchTerm = query.toLowerCase().trim()
    
    if (!searchTerm) {
      return products
    }

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.barcode?.includes(searchTerm)
    )
  }

  // Filtrar por categoría
  static getProductsByCategory(category: string): Product[] {
    const products = this.getAllProducts()
    
    if (category === 'all' || !category) {
      return products
    }

    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Obtener productos con stock bajo
  static getLowStockProducts(): Product[] {
    const products = this.getAllProducts()
    return products.filter(product => product.stock <= product.minStock)
  }

  // Obtener todas las categorías únicas
  static getCategories(): string[] {
    const products = this.getAllProducts()
    const categories = [...new Set(products.map(p => p.category))]
    return categories.sort()
  }

  // Actualizar stock de producto
  static updateStock(id: string, newStock: number): Product | null {
    return this.updateProduct(id, { stock: newStock })
  }

  // Validar datos de producto
  static validateProduct(productData: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('El nombre del producto debe tener al menos 2 caracteres')
    }

    if (!productData.category || productData.category.trim().length < 2) {
      errors.push('La categoría es obligatoria')
    }

    if (productData.price === undefined || productData.price <= 0) {
      errors.push('El precio debe ser mayor a 0')
    }

    if (productData.cost === undefined || productData.cost < 0) {
      errors.push('El costo no puede ser negativo')
    }

    if (productData.stock === undefined || productData.stock < 0) {
      errors.push('El stock no puede ser negativo')
    }

    if (productData.minStock === undefined || productData.minStock < 0) {
      errors.push('El stock mínimo no puede ser negativo')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Reinicializar productos con datos de muestra
  static reinitializeProducts(): void {
    try {
      this.saveProducts(sampleProducts)
      console.log('✅ Productos reinicializados con datos de muestra')
    } catch (error) {
      console.error('Error al reinicializar productos:', error)
      throw error
    }
  }

  // Exportar productos a JSON
  static exportProducts(): string {
    const products = this.getAllProducts()
    return JSON.stringify(products, null, 2)
  }

  // Importar productos desde JSON
  static importProducts(jsonData: string): { success: boolean; message: string; count?: number } {
    try {
      const importedProducts = JSON.parse(jsonData)
      
      if (!Array.isArray(importedProducts)) {
        return { success: false, message: 'El archivo debe contener un array de productos' }
      }

      // Validar cada producto
      for (const product of importedProducts) {
        const validation = this.validateProduct(product)
        if (!validation.isValid) {
          return { 
            success: false, 
            message: `Error en producto "${product.name || 'sin nombre'}": ${validation.errors.join(', ')}` 
          }
        }
      }

      // Si todo está bien, reemplazar productos
      this.saveProducts(importedProducts)
      
      return { 
        success: true, 
        message: 'Productos importados exitosamente', 
        count: importedProducts.length 
      }
    } catch (error) {
      return { success: false, message: 'Error al procesar el archivo JSON' }
    }
  }
}