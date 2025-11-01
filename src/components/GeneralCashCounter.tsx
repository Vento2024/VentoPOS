import React, { useState, useEffect } from 'react'
import { Settings, Calculator, DollarSign, Coins, Banknote, Building2 } from 'lucide-react'
import { formatCRC } from '../utils/format'

interface GeneralCashCounterProps {
  onTotalChange: (total: number) => void
  onDetailedCountChange?: (detailedCount: { colones: CoinBillCount, usd: CoinBillCount }) => void
  initialTotal?: number
  title?: string
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

export default function GeneralCashCounter({ 
  onTotalChange, 
  onDetailedCountChange,
  initialTotal = 0, 
  title = "Conteo de Caja General" 
}: GeneralCashCounterProps) {
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
      <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-green-600" />
            {title}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExchangeConfig(!showExchangeConfig)}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-lg transition-colors"
              title="Configurar tipo de cambio"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={resetCounts}
              className="px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-200 rounded-lg transition-colors font-medium"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Rate Configuration */}
      {showExchangeConfig && (
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-green-800">
              Tipo de cambio USD → CRC:
            </label>
            <input
              type="number"
              value={tempExchangeRate}
              onChange={(e) => setTempExchangeRate(e.target.value)}
              className="w-24 px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="500"
            />
            <button
              onClick={handleExchangeRateUpdate}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Colones Section */}
        <div>
          <div className="flex items-center mb-4">
            <Coins className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-base font-semibold text-neutral-800">Colones (CRC)</h4>
            <div className="ml-auto text-lg font-bold text-green-600">
              {formatCRC(colonesTotal)}
            </div>
          </div>

          {/* Monedas */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-neutral-600 mb-2 flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              Monedas
            </h5>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COLONES_DENOMINATIONS.coins.map(denomination => (
                <div key={denomination} className="text-center">
                  <div className="text-xs font-medium text-neutral-600 mb-1">
                    ₡{denomination}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={colonesCount[denomination] || ''}
                    onChange={(e) => handleColonesCountChange(denomination, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {formatCRC((colonesCount[denomination] || 0) * denomination)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billetes */}
          <div>
            <h5 className="text-sm font-medium text-neutral-600 mb-2 flex items-center">
              <Banknote className="h-4 w-4 mr-1" />
              Billetes
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {COLONES_DENOMINATIONS.bills.map(denomination => (
                <div key={denomination} className="text-center">
                  <div className="text-xs font-medium text-neutral-600 mb-1">
                    ₡{denomination.toLocaleString()}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={colonesCount[denomination] || ''}
                    onChange={(e) => handleColonesCountChange(denomination, e.target.value)}
                    className="w-full px-2 py-1.5 text-sm text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {formatCRC((colonesCount[denomination] || 0) * denomination)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* USD Section */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-base font-semibold text-neutral-800">Dólares (USD)</h4>
            <div className="ml-auto">
              <div className="text-sm text-neutral-600">
                ${usdTotalInUsd.toFixed(2)} USD
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatCRC(usdTotalInColones)}
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-500 mb-3">
            Tipo de cambio: $1 USD = ₡{exchangeRate.usdToColones.toLocaleString()}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {USD_DENOMINATIONS.map(denomination => (
              <div key={denomination} className="text-center">
                <div className="text-xs font-medium text-neutral-600 mb-1">
                  ${denomination}
                </div>
                <input
                  type="number"
                  min="0"
                  value={usdCount[denomination] || ''}
                  onChange={(e) => handleUsdCountChange(denomination, e.target.value)}
                  className="w-full px-2 py-1.5 text-sm text-center border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                <div className="text-xs text-neutral-500 mt-1">
                  {formatCRC((usdCount[denomination] || 0) * denomination * exchangeRate.usdToColones)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Section */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-green-800">
                Total General:
              </span>
              <span className="text-xl font-bold text-green-600">
                {formatCRC(grandTotal)}
              </span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              Colones: {formatCRC(colonesTotal)} + USD: {formatCRC(usdTotalInColones)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}