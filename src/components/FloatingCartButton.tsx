import { ShoppingCart } from 'lucide-react'
import { useCart } from '../store/cart'
import { formatCRC } from '../utils/format'

type Props = { onClick: () => void }

export default function FloatingCartButton({ onClick }: Props) {
  const { items } = useCart()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.totalPrice, 0)
  
  if (count === 0) return null
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-primary-600 text-white rounded-full shadow-strong hover:bg-primary-700 transition-all duration-200 hover:scale-105 z-40"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-warning-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {count}
          </span>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-medium">Carrito</div>
          <div className="text-xs opacity-90">{formatCRC(total)}</div>
        </div>
      </div>
    </button>
  )
}