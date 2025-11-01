import { useState, useEffect } from 'react'
import { Scale, X } from 'lucide-react'
import { formatCRC } from '../utils/format'
import type { Product } from '../types'

interface WeightInputModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onConfirm: (quantity: number) => void
}

export default function WeightInputModal({ isOpen, onClose, product, onConfirm }: WeightInputModalProps) {
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setWeight('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const handleWeightChange = (value: string) => {
    console.log('WeightModal - Valor recibido:', value);
    // Convertir coma a punto para compatibilidad
    const normalizedValue = value.replace(',', '.');
    
    // Validación muy permisiva - solo rechazar caracteres claramente inválidos
    // Permitir: números, punto, string vacío
    if (normalizedValue === '' || /^[\d.]*$/.test(normalizedValue)) {
      console.log('WeightModal - Valor aceptado:', normalizedValue);
      setWeight(normalizedValue)
      setError('')
    } else {
      console.log('WeightModal - Valor rechazado:', value);
    }
  }

  const handleConfirm = () => {
    const weightValue = parseFloat(weight)
    
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      setError('Ingrese un peso válido mayor a 0')
      return
    }

    if (weightValue > 999) {
      setError('El peso no puede ser mayor a 999')
      return
    }

    onConfirm(weightValue)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Solo manejar Enter y Escape, permitir todos los demás caracteres
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
    // No prevenir otros caracteres para permitir escritura normal
  }

  const addWeight = (amount: number) => {
    const currentWeight = parseFloat(weight) || 0
    const newWeight = Math.max(0, currentWeight + amount)
    // Redondear a 2 decimales para evitar problemas de precisión
    setWeight(Number(newWeight.toFixed(2)).toString())
  }

  const setQuickWeight = (amount: number) => {
    setWeight(amount.toString())
  }

  const calculatePrice = () => {
    const weightValue = parseFloat(weight) || 0
    return weightValue * product.price
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-500" />
            Ingresar Peso
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Producto:</p>
          <p className="text-white font-medium">{product.name}</p>
          <p className="text-gray-400 text-sm">
            Precio: {formatCRC(product.price)}/{product.unit || 'kg'}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            Peso ({product.unit || 'kg'}):
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-md text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0.00"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Precio calculado */}
        {weight && !isNaN(parseFloat(weight)) && (
          <div className="mb-4 p-3 bg-gray-700 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total a pagar:</span>
              <span className="text-green-400 font-bold text-lg">
                {formatCRC(calculatePrice())}
              </span>
            </div>
          </div>
        )}

        {/* Botones rápidos de peso */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Pesos comunes:</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            <button
              onClick={() => setQuickWeight(0.25)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
            >
              0.25
            </button>
            <button
              onClick={() => setQuickWeight(0.5)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
            >
              0.5
            </button>
            <button
              onClick={() => setQuickWeight(1)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
            >
              1.0
            </button>
            <button
              onClick={() => setQuickWeight(2)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
            >
              2.0
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => addWeight(-0.1)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
            >
              -0.1
            </button>
            <button
              onClick={() => addWeight(-0.01)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
            >
              -0.01
            </button>
            <button
              onClick={() => setWeight('')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={() => addWeight(0.01)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
            >
              +0.01
            </button>
            <button
              onClick={() => addWeight(0.1)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
            >
              +0.1
            </button>
          </div>
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
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  )
}