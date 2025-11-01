import React, { useState, useEffect } from 'react'
import { Settings, Calculator, DollarSign, Coins, Banknote } from 'lucide-react'
import { formatCRC } from '../utils/format'

interface CashCounterProps {
  onTotalChange: (total: number) => void
  onDetailedCountChange?: (detailedCount: { colones: CoinBillCount, usd: CoinBillCount }) => void
  initialTotal?: number
}

interface CoinBillCount {
  [key: string]: number
}

interface ExchangeRateConfig {
  usdToColones: number
}

const COLONES_DENOMINATIONS = {
  coins: [5, 10, 25, 50, 100, 500],
  bills: [1000, 2000, 5000, 10000, 20000]
}

const USD_DENOMINATIONS = [1, 5, 10, 20, 50]

export default function CashCounter({ onTotalChange, onDetailedCountChange, initialTotal = 0 }: CashCounterProps) {
  const [colonesCount, setColonesCount] = useState<CoinBillCount>({})
  const [usdCount, setUsdCount] = useState<CoinBillCount>({})
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateConfig>({ usdToColones: 500 })
  const [showExchangeConfig, setShowExchangeConfig] = useState(false)
  const [tempExchangeRate, setTempExchangeRate] = useState('500')

  // Calcular totales
  const colonesTotal = Object.entries(colonesCount).reduce((total, [denomination, count]) => {
    return total + (parseInt(denomination) * count)
  }, 0)

  const usdTotalInUsd = Object.entries(usdCount).reduce((total, [denomination, count]) => {
    return total + (parseInt(denomination) * count)
  }, 0)

  const usdTotalInColones = usdTotalInUsd * exchangeRate.usdToColones
  const grandTotal = colonesTotal + usdTotalInColones

  // Notificar cambios al componente padre
  useEffect(() => {
    onTotalChange(grandTotal)
    if (onDetailedCountChange) {
      onDetailedCountChange({ colones: colonesCount, usd: usdCount })
    }
  }, [grandTotal, colonesCount, usdCount, onTotalChange, onDetailedCountChange])

  const handleColonesCountChange = (denomination: number, count: string) => {
    const numCount = parseInt(count) || 0
    setColonesCount(prev => ({
      ...prev,
      [denomination]: numCount
    }))
  }

  const handleUsdCountChange = (denomination: number, count: string) => {
    const numCount = parseInt(count) || 0
    setUsdCount(prev => ({
      ...prev,
      [denomination]: numCount
    }))
  }

  const handleExchangeRateUpdate = () => {
    const newRate = parseFloat(tempExchangeRate)
    if (newRate > 0) {
      setExchangeRate({ usdToColones: newRate })
      setShowExchangeConfig(false)
    }
  }

  const resetCounts = () => {
    setColonesCount({})
    setUsdCount({})
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-900 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-primary-600" />
            Conteo Detallado de Efectivo
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExchangeConfig(!showExchangeConfig)}
              className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-200 rounded-lg transition-colors"
              title="Configurar tipo de cambio"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={resetCounts}
              className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-200 rounded-lg transition-colors font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Configuración de tipo de cambio */}
        {showExchangeConfig && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Tipo de cambio USD a Colones
                </label>
                <input
                  type="number"
                  value={tempExchangeRate}
                  onChange={(e) => setTempExchangeRate(e.target.value)}
                  className="w-32 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>
              <button
                onClick={handleExchangeRateUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Actualizar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colones */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold text-sm">₡</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-800">Colones Costarricenses</h4>
            </div>
            
            {/* Monedas */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Coins className="h-4 w-4 text-neutral-600 mr-2" />
                <h5 className="text-sm font-semibold text-neutral-700">Monedas</h5>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {COLONES_DENOMINATIONS.coins.map(denomination => (
                  <div key={denomination} className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 block text-center">
                      ₡{denomination}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={colonesCount[denomination] || ''}
                      onChange={(e) => handleColonesCountChange(denomination, e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Billetes */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Banknote className="h-4 w-4 text-neutral-600 mr-2" />
                <h5 className="text-sm font-semibold text-neutral-700">Billetes</h5>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COLONES_DENOMINATIONS.bills.map(denomination => (
                  <div key={denomination} className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 block text-center">
                      ₡{denomination.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={colonesCount[denomination] || ''}
                      onChange={(e) => handleColonesCountChange(denomination, e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-1">Subtotal Colones</div>
                <div className="text-lg font-bold text-green-800">{formatCRC(colonesTotal)}</div>
              </div>
            </div>
          </div>

          {/* Dólares */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-neutral-800">Dólares Estadounidenses</h4>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="text-xs text-blue-700">Tipo de cambio</div>
                <div className="text-sm font-semibold text-blue-800">
                  $1 = ₡{exchangeRate.usdToColones.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Banknote className="h-4 w-4 text-neutral-600 mr-2" />
                <h5 className="text-sm font-semibold text-neutral-700">Billetes USD</h5>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {USD_DENOMINATIONS.map(denomination => (
                  <div key={denomination} className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600 block text-center">
                      ${denomination}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={usdCount[denomination] || ''}
                      onChange={(e) => handleUsdCountChange(denomination, e.target.value)}
                      className="w-full px-2 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center space-y-1">
                <div className="text-sm text-blue-700">Total USD: <span className="font-semibold">${usdTotalInUsd.toFixed(2)}</span></div>
                <div className="text-lg font-bold text-blue-800">En Colones: {formatCRC(usdTotalInColones)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Total General */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6">
          <div className="text-center">
            <div className="text-lg font-medium text-orange-900 mb-2">Total General:</div>
            <div className="text-3xl font-bold text-orange-900 mb-2">{formatCRC(grandTotal)}</div>
            {usdTotalInUsd > 0 && (
              <div className="text-sm text-orange-700">
                Incluye ${usdTotalInUsd.toFixed(2)} USD convertidos a {formatCRC(usdTotalInColones)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}