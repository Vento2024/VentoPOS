import React, { useRef } from 'react'
import html2canvas from 'html2canvas'
import { formatCRC } from '../utils/format'
import { Copy, Download, FileImage } from 'lucide-react'
import Button from './Button'

interface CashClosingReportProps {
  cashierName: string
  date: string
  startTime: string
  endTime: string
  initialAmount: number
  totalSales: number
  cashSales: number
  cardSales: number
  sinpeSales: number
  creditSales: number
  transactionCount: number
  physicalCount: number
  physicalDetailedCount?: {
    colones: { [key: string]: number }
    usd: { [key: string]: number }
  }
  generalCashCount?: number
  generalDetailedCount?: {
    colones: { [key: string]: number }
    usd: { [key: string]: number }
  }
  remainingCashCount?: number
  remainingDetailedCount?: {
    colones: { [key: string]: number }
    usd: { [key: string]: number }
  }
  expectedAmount: number
  difference: number
  notes?: string
}

export const CashClosingReport: React.FC<CashClosingReportProps> = ({
  cashierName,
  date,
  startTime,
  endTime,
  initialAmount,
  totalSales,
  cashSales,
  cardSales,
  sinpeSales,
  creditSales,
  transactionCount,
  physicalCount,
  physicalDetailedCount,
  generalCashCount,
  generalDetailedCount,
  remainingCashCount,
  remainingDetailedCount,
  expectedAmount,
  difference,
  notes
}) => {
  
  const reportRef = useRef<HTMLDivElement>(null)

  const generateImage = async () => {
    if (!reportRef.current) return null

    try {
      // Obtener las dimensiones reales del contenido
      const element = reportRef.current
      
      // Pequeña pausa para asegurar que el DOM esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        removeContainer: true
      })
      return canvas
    } catch (error) {
      console.error('Error generando imagen:', error)
      return null
    }
  }

  const copyToClipboard = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([item])
          alert('Imagen copiada al portapapeles')
        }
      })
    } catch (error) {
      console.error('Error copiando al portapapeles:', error)
      alert('Error al copiar la imagen')
    }
  }

  const downloadImage = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `cierre-caja-${date}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600'
    if (diff < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDifferenceText = (diff: number) => {
    if (diff > 0) return `Sobrante: ${formatCRC(diff)}`
    if (diff < 0) return `Faltante: ${formatCRC(Math.abs(diff))}`
    return 'Cuadra exacto'
  }

  const renderDenominationBreakdown = (title: string, counts: { colones: { [key: string]: number }, usd: { [key: string]: number } }, isRemainingCash = false) => {
    // Asegurar que counts no sea null o undefined
    if (!counts || (!counts.colones && !counts.usd)) {
      return null
    }
    
    const colonesData = counts.colones || {}
    const usdData = counts.usd || {}
    
    const hasColones = Object.values(colonesData).some(count => count > 0)
    const hasUsd = Object.values(usdData).some(count => count > 0)
    
    if (!hasColones && !hasUsd) {
      return null
    }
    
    // Denominaciones de colones ordenadas de mayor a menor
    const colonesDenominations = ['20000', '10000', '5000', '2000', '1000', '500', '100', '50', '25']
    // Denominaciones de dólares ordenadas de mayor a menor
    const usdDenominations = ['100', '50', '20', '10', '5', '1']
    
    const calculateTotal = (data: { [key: string]: number }) => {
      return Object.entries(data).reduce((total, [denomination, count]) => {
        return total + (parseFloat(denomination) * count)
      }, 0)
    }
    
    const colonesTotal = calculateTotal(colonesData)
    const usdTotal = calculateTotal(usdData)
    
    return (
      <div className={`mb-6 p-4 border rounded-lg shadow-sm ${isRemainingCash ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 border-b pb-2 ${isRemainingCash ? 'text-yellow-800 border-yellow-200' : 'text-gray-800 border-gray-200'}`}>
          {title}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección de Colones */}
          {hasColones && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-md font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">₡</span>
                Colones
                <span className="ml-auto text-sm font-normal bg-green-100 px-2 py-1 rounded">
                  Total: {formatCRC(colonesTotal)}
                </span>
              </h5>
              <div className="space-y-2">
                {colonesDenominations.map(denomination => {
                  const count = colonesData[denomination] || 0
                  if (count === 0) return null
                  const value = parseFloat(denomination)
                  const subtotal = value * count
                  return (
                    <div key={denomination} className="flex justify-between items-center py-1 px-2 bg-white rounded border border-green-100">
                      <span className="text-sm font-medium text-gray-700">
                        ₡{value.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {count}
                        </span>
                        <span className="text-sm font-semibold text-green-700">
                          = ₡{subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Sección de Dólares */}
          {hasUsd && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-md font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">$</span>
                Dólares
                <span className="ml-auto text-sm font-normal bg-blue-100 px-2 py-1 rounded">
                  Total: ${usdTotal.toFixed(2)}
                </span>
              </h5>
              <div className="space-y-2">
                {usdDenominations.map(denomination => {
                  const count = usdData[denomination] || 0
                  if (count === 0) return null
                  const value = parseFloat(denomination)
                  const subtotal = value * count
                  return (
                    <div key={denomination} className="flex justify-between items-center py-1 px-2 bg-white rounded border border-blue-100">
                      <span className="text-sm font-medium text-gray-700">
                        ${value.toFixed(0)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {count}
                        </span>
                        <span className="text-sm font-semibold text-blue-700">
                          = ${subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Total combinado si hay ambas monedas */}
        {hasColones && hasUsd && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total del {title}:</span>
              <div className="text-right">
                <div className="text-sm text-gray-600">₡{colonesTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-600">${usdTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Botones de acción */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copiar Imagen
        </Button>
        <Button
          onClick={downloadImage}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar
        </Button>
      </div>

      {/* Reporte para generar imagen */}
      <div
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-lg mx-auto"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          width: '800px',
          minHeight: 'auto'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">VentoPOS</h1>
          <h2 className="text-xl font-semibold text-gray-700">Reporte de Cierre de Caja</h2>
          <div className="text-sm text-gray-600 mt-2">
            <p>Fecha: {new Date(date).toLocaleDateString('es-CR')}</p>
            <p>Cajero: {cashierName}</p>
          </div>
        </div>

        {/* Información del turno */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Información del Turno
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Hora inicio:</span>
              <span className="ml-2 text-gray-800">{startTime}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Hora cierre:</span>
              <span className="ml-2 text-gray-800">{endTime}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Monto inicial:</span>
              <span className="ml-2 text-gray-800">{formatCRC(initialAmount)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Transacciones:</span>
              <span className="ml-2 text-gray-800">{transactionCount}</span>
            </div>
          </div>
        </div>

        {/* Resumen de ventas */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Resumen de Ventas
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ventas en efectivo:</span>
              <span className="text-gray-800">{formatCRC(cashSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ventas con tarjeta:</span>
              <span className="text-gray-800">{formatCRC(cardSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ventas SINPE:</span>
              <span className="text-gray-800">{formatCRC(sinpeSales)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Ventas a crédito:</span>
              <span className="text-gray-800">{formatCRC(creditSales)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <span className="text-gray-700">Total ventas:</span>
              <span className="text-gray-800">{formatCRC(totalSales)}</span>
            </div>
          </div>
        </div>

        {/* Conteo de efectivo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Conteo de Efectivo
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Efectivo esperado:</span>
              <span className="text-gray-800">{formatCRC(expectedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Caja de cambio:</span>
              <span className="text-gray-800">{formatCRC(physicalCount)}</span>
            </div>
            
            {/* Desglose de caja de cambio */}
            {physicalDetailedCount && renderDenominationBreakdown("Desglose Caja de Cambio", physicalDetailedCount)}
            
            {generalCashCount !== undefined && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Caja general:</span>
                <span className="text-gray-800">{formatCRC(generalCashCount)}</span>
              </div>
            )}
            
            {/* Desglose de caja general */}
            {generalDetailedCount && renderDenominationBreakdown("Desglose Caja General", generalDetailedCount)}
            
            {/* Conteo de monedas que quedan en caja (efectivo para día siguiente) */}
            {remainingDetailedCount && renderDenominationBreakdown("Conteo de Monedas - Queda en Caja", remainingDetailedCount, true)}
            
            {remainingCashCount !== undefined && (
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-600">Total en caja siguiente día:</span>
                <span className="text-gray-800 font-semibold">{formatCRC(remainingCashCount)}</span>
              </div>
            )}
            
            {generalCashCount !== undefined && (
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-600">Total efectivo contado:</span>
                <span className="text-gray-800 font-semibold">{formatCRC(physicalCount + generalCashCount)}</span>
              </div>
            )}
            <div className={`flex justify-between border-t border-gray-200 pt-2 font-semibold ${getDifferenceColor(difference)}`}>
              <span>Diferencia:</span>
              <span>{getDifferenceText(difference)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Observaciones
            </h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
              {notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>Reporte generado automáticamente por VentoPOS</p>
          <p>{new Date().toLocaleString('es-CR')}</p>
        </div>
      </div>
    </div>
  )
}