import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface QuantityModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
  currentQuantity: number
  productName: string
}

export const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentQuantity,
  productName
}) => {
  const [quantity, setQuantity] = useState(currentQuantity.toString())
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuantity(currentQuantity.toString())
      setError('')
    }
  }, [isOpen, currentQuantity])

  const handleQuantityChange = (value: string) => {
    // Convertir coma a punto para compatibilidad
    const normalizedValue = value.replace(',', '.');
    
    // Permitir números, punto decimal, y string vacío
    if (normalizedValue === '' || /^[\d.]*$/.test(normalizedValue)) {
      setQuantity(normalizedValue)
      setError('')
    }
  }

  const handleConfirm = () => {
    const numQuantity = parseFloat(quantity)
    
    if (!quantity || numQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    if (numQuantity > 999) {
      setError('La cantidad no puede ser mayor a 999')
      return
    }

    onConfirm(numQuantity)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const addToQuantity = (amount: number) => {
    const currentNum = parseInt(quantity) || 0
    const newQuantity = Math.max(0, currentNum + amount)
    setQuantity(newQuantity.toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Cambiar Cantidad</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Producto:</p>
          <p className="text-white font-medium">{productName}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            Nueva Cantidad:
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Botones rápidos */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => addToQuantity(-10)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
          >
            -10
          </button>
          <button
            onClick={() => addToQuantity(-1)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
          >
            -1
          </button>
          <button
            onClick={() => setQuantity('0')}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
          >
            0
          </button>
          <button
            onClick={() => addToQuantity(1)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
          >
            +1
          </button>
          <button
            onClick={() => addToQuantity(10)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
          >
            +10
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}