import { useState } from 'react'
import { Scale } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../store/cart'
import { formatCRC } from '../utils/format'
import WeightInputModal from './WeightInputModal'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const add = useCart((s) => s.add)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const inStock = product.stock > 0
  
  const handleAddToCart = () => {
    if (product.isPorPeso) {
      setShowWeightModal(true)
    } else {
      add(product)
    }
  }

  const handleWeightConfirm = (quantity: number) => {
    add(product, quantity)
  }

  const unit = product.unit || (product.isPorPeso ? 'kg' : 'unidad')
  const priceLabel = product.isPorPeso ? `${formatCRC(product.price)}/${unit}` : formatCRC(product.price)

  return (
    <>
      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 grid place-items-center text-gray-400">
            Sin imagen
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium line-clamp-1 text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <span className="text-brand font-semibold">{priceLabel}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {product.category || 'General'} • {inStock ? `Stock: ${product.stock}` : 'Agotado'}
            {product.isPorPeso && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Por peso
              </span>
            )}
          </div>
          <button
            disabled={!inStock}
            onClick={handleAddToCart}
            className={`mt-3 w-full rounded-md py-2 text-white font-medium transition-colors
              ${product.isPorPeso 
                ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300' 
                : 'bg-brand hover:bg-blue-700 disabled:bg-gray-300'
              }`}
          >
            {product.isPorPeso ? (
              <span className="flex items-center justify-center gap-2">
                <Scale className="w-4 h-4" />
                Ingresar peso
              </span>
            ) : (
              'Agregar al carrito'
            )}
          </button>
        </div>
      </div>

      <WeightInputModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        product={product}
        onConfirm={handleWeightConfirm}
      />
    </>
  )
}