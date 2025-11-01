import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useSales } from '../store/sales'
import { formatCRC } from '../utils/format'
import type { CashClosing } from '../types'
import MobileHeader from '../components/MobileHeader'
import Button from '../components/Button'
import CashCounter from '../components/CashCounter'
import GeneralCashCounter from '../components/GeneralCashCounter'
import { CashClosingReport } from '../components/CashClosingReport'

export default function CashClosing() {
  const {
    currentCashClosing,
    cashClosings,
    startCashClosing,
    finalizeCashClosing,
    calculateDailySummary,
    getTodaysSales
  } = useSales()

  const [cashierName, setCashierName] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [physicalCount, setPhysicalCount] = useState('')
  const [detailedCount, setDetailedCount] = useState(0)
  const [physicalDetailedCount, setPhysicalDetailedCount] = useState<{ colones: { [key: string]: number }, usd: { [key: string]: number } }>({ colones: {}, usd: {} })
  const [useDetailedCount, setUseDetailedCount] = useState(false)
  
  // Estados para caja general
  const [generalCashCount, setGeneralCashCount] = useState('')
  const [generalDetailedCount, setGeneralDetailedCount] = useState(0)
  const [generalDetailedCountData, setGeneralDetailedCountData] = useState<{ colones: { [key: string]: number }, usd: { [key: string]: number } }>({ colones: {}, usd: {} })
  const [useGeneralDetailedCount, setUseGeneralDetailedCount] = useState(false)
  
  // Estados para efectivo que queda en caja (día siguiente)
  const [remainingCashCount, setRemainingCashCount] = useState('')
  const [remainingDetailedCount, setRemainingDetailedCount] = useState(0)
  const [remainingDetailedCountData, setRemainingDetailedCountData] = useState<{ colones: { [key: string]: number }, usd: { [key: string]: number } }>({ colones: {}, usd: {} })
  const [useRemainingDetailedCount, setUseRemainingDetailedCount] = useState(false)
  
  const [notes, setNotes] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [selectedClosing, setSelectedClosing] = useState<CashClosing | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [completedClosing, setCompletedClosing] = useState<CashClosing | null>(null)

  const todaysSales = getTodaysSales()
  const todaySummary = calculateDailySummary(new Date().toISOString().split('T')[0])

  // Calcular diferencia
  const expectedAmount = currentCashClosing ? currentCashClosing.initialAmount + todaySummary.cashSales : 0
  const actualPhysicalAmount = useDetailedCount ? detailedCount : (parseFloat(physicalCount) || 0)
  const difference = actualPhysicalAmount - expectedAmount
  const hasDifference = Math.abs(difference) > 0.01 // Tolerancia de 1 centavo

  // Función para manejar cambios en el conteo detallado
  const handleDetailedCountChange = (total: number) => {
    setDetailedCount(total)
    if (useDetailedCount) {
      setPhysicalCount(total.toString())
    }
  }

  // Función para manejar cambios en los datos detallados de caja de cambio
  const handlePhysicalDetailedCountChange = (detailedCount: { colones: { [key: string]: number }, usd: { [key: string]: number } }) => {
    setPhysicalDetailedCount(detailedCount)
  }

  // Función para manejar cambios en el conteo detallado de caja general
  const handleGeneralDetailedCountChange = (total: number) => {
    setGeneralDetailedCount(total)
    if (useGeneralDetailedCount) {
      setGeneralCashCount(total.toString())
    }
  }

  // Función para manejar cambios en los datos detallados de caja general
  const handleGeneralDetailedCountDataChange = (detailedCount: { colones: { [key: string]: number }, usd: { [key: string]: number } }) => {
    setGeneralDetailedCountData(detailedCount)
  }

  // Función para manejar cambios en el conteo detallado del efectivo que queda
  const handleRemainingDetailedCountChange = (total: number) => {
    setRemainingDetailedCount(total)
    if (useRemainingDetailedCount) {
      setRemainingCashCount(total.toString())
    }
  }

  // Función para manejar cambios en los datos detallados del efectivo que queda
  const handleRemainingDetailedCountDataChange = (detailedCount: { colones: { [key: string]: number }, usd: { [key: string]: number } }) => {
    setRemainingDetailedCountData(detailedCount)
  }

  // Validar formulario de cierre
  const validateClosing = (): string[] => {
    const errors: string[] = []
    
    if (!physicalCount || actualPhysicalAmount < 0) {
      errors.push('El conteo de caja de cambio es obligatorio y debe ser un monto válido')
    }

    // Validar caja general
    const actualGeneralAmount = useGeneralDetailedCount ? generalDetailedCount : (parseFloat(generalCashCount) || 0)
    if (!generalCashCount || actualGeneralAmount < 0) {
      errors.push('El conteo de caja general es obligatorio y debe ser un monto válido')
    }

    // Validar efectivo que queda en caja
    const actualRemainingAmount = useRemainingDetailedCount ? remainingDetailedCount : (parseFloat(remainingCashCount) || 0)
    if (!remainingCashCount || actualRemainingAmount < 0) {
      errors.push('El conteo del efectivo que queda en caja es obligatorio y debe ser un monto válido')
    }
    
    if (hasDifference && (!notes || notes.trim().length < 10)) {
      errors.push('Las notas son obligatorias cuando hay diferencias. Debe explicar la razón (mínimo 10 caracteres)')
    }
    
    if (Math.abs(difference) > 50000) { // Diferencia mayor a ₡50,000
      errors.push('La diferencia es muy alta (más de ₡50,000). Verifique el conteo y proporcione una explicación detallada')
    }
    
    return errors
  }

  const handleStartClosing = () => {
    if (cashierName && initialAmount) {
      startCashClosing(cashierName, parseFloat(initialAmount))
      setCashierName('')
      setInitialAmount('')
    }
  }

  const handleFinalizeClosing = async () => {
    setValidationErrors([])
    const errors = validateClosing()
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    // Confirmación adicional para diferencias grandes
    if (Math.abs(difference) > 10000) { // Más de ₡10,000
      const confirmed = window.confirm(
        `Hay una diferencia de ${formatCRC(Math.abs(difference))} ${difference > 0 ? 'sobrante' : 'faltante'}. ¿Está seguro de continuar con el cierre?`
      )
      if (!confirmed) return
    }

    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular procesamiento
      
      // Capturar datos del cierre antes de finalizarlo
      if (currentCashClosing) {
        const now = new Date()
        const actualGeneralAmount = useGeneralDetailedCount ? generalDetailedCount : (parseFloat(generalCashCount) || 0)
        const actualRemainingAmount = useRemainingDetailedCount ? remainingDetailedCount : (parseFloat(remainingCashCount) || 0)
        
        const closingData: CashClosing = {
          ...currentCashClosing,
          endTime: now.toTimeString().split(' ')[0],
          totalSales: todaySummary.totalSales,
          cashSales: todaySummary.cashSales,
          cardSales: todaySummary.cardSales,
          sinpeSales: todaySummary.sinpeSales,
          creditSales: todaySummary.creditSales,
          transactionCount: todaySummary.transactionCount,
          physicalCashCount: actualPhysicalAmount,
          physicalDetailedCount: physicalDetailedCount,
          generalCashCount: actualGeneralAmount,
          generalDetailedCount: generalDetailedCountData,
          remainingCashCount: actualRemainingAmount,
          remainingDetailedCount: remainingDetailedCountData,
          expectedCash: currentCashClosing.initialAmount + todaySummary.cashSales,
          difference: actualPhysicalAmount - (currentCashClosing.initialAmount + todaySummary.cashSales),
          notes: notes.trim(),
          status: 'closed'
        }
        
        setCompletedClosing(closingData)
      }
      
      finalizeCashClosing(actualPhysicalAmount, notes.trim())
      setPhysicalCount('')
      setNotes('')
      setDetailedCount(0)
      setPhysicalDetailedCount({ colones: {}, usd: {} })
      setUseDetailedCount(false)
      
      // Reset general cash states
      setGeneralCashCount('')
      setGeneralDetailedCount(0)
      setGeneralDetailedCountData({ colones: {}, usd: {} })
      setUseGeneralDetailedCount(false)
      
      // Reset remaining cash states
      setRemainingCashCount('')
      setRemainingDetailedCount(0)
      setRemainingDetailedCountData({ colones: {}, usd: {} })
      setUseRemainingDetailedCount(false)
      
      setValidationErrors([])
    } catch (error) {
      setValidationErrors(['Error al procesar el cierre. Intente nuevamente.'])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseReport = () => {
    setCompletedClosing(null)
  }

  const getDifferenceColor = (difference: number) => {
    if (difference > 0) return 'text-success-600 bg-success-100 border-success-200'
    if (difference < 0) return 'text-error-600 bg-error-100 border-error-200'
    return 'text-warning-600 bg-warning-100 border-warning-200'
  }

  const getDifferenceText = (difference: number) => {
    if (difference > 0) return `Sobrante: ${formatCRC(difference)}`
    if (difference < 0) return `Faltante: ${formatCRC(Math.abs(difference))}`
    return 'Cuadra exacto'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mostrar reporte si el cierre está completado */}
      {completedClosing ? (
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Cierre Completado</h1>
            <Button
              onClick={handleCloseReport}
              variant="outline"
            >
              Nuevo Cierre
            </Button>
          </div>
          <CashClosingReport
            cashierName={completedClosing.cashierName}
            date={completedClosing.date}
            startTime={completedClosing.startTime}
            endTime={completedClosing.endTime}
            initialAmount={completedClosing.initialAmount}
            totalSales={completedClosing.totalSales}
            cashSales={completedClosing.cashSales}
            cardSales={completedClosing.cardSales}
            sinpeSales={completedClosing.sinpeSales}
            creditSales={completedClosing.creditSales}
            transactionCount={completedClosing.transactionCount}
            physicalCount={completedClosing.physicalCashCount}
            physicalDetailedCount={completedClosing.physicalDetailedCount}
            generalCashCount={completedClosing.generalCashCount}
            generalDetailedCount={completedClosing.generalDetailedCount}
            remainingCashCount={completedClosing.remainingCashCount}
            remainingDetailedCount={completedClosing.remainingDetailedCount}
            expectedAmount={completedClosing.expectedCash}
            difference={completedClosing.difference}
            notes={completedClosing.notes}
          />
        </div>
      ) : (
        <>
          {/* Mobile Header */}
          <div className="md:hidden">
            <MobileHeader 
              title="Cierre de Caja" 
              subtitle={currentCashClosing ? `Turno: ${currentCashClosing.cashierName}` : 'Gestiona el cierre diario'}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Cierre' : 'Historial'}
                </Button>
              }
            />
          </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Cierre de Caja</h1>
            <p className="text-neutral-600">Gestiona el proceso de cierre de caja diario</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {!showHistory ? (
          <>
            {/* Current Closing Process */}
            {!currentCashClosing ? (
              <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-neutral-900">Iniciar Cierre de Caja</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nombre del Cajero
                    </label>
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="Ingrese el nombre del cajero"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Monto Inicial de Caja
                    </label>
                    <input
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <button
                  onClick={handleStartClosing}
                  disabled={!cashierName || !initialAmount}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Iniciar Cierre
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Closing Summary */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Resumen del Turno</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                      <div className="text-sm text-primary-600 font-medium">Total de Ventas</div>
                      <div className="text-2xl font-bold text-primary-900">{formatCRC(todaySummary.totalSales)}</div>
                    </div>
                    <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                      <div className="text-sm text-success-600 font-medium">Efectivo</div>
                      <div className="text-2xl font-bold text-success-900">{formatCRC(todaySummary.cashSales)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 font-medium">Tarjeta</div>
                      <div className="text-2xl font-bold text-purple-900">{formatCRC(todaySummary.cardSales)}</div>
                    </div>
                    <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                      <div className="text-sm text-warning-600 font-medium">SINPE</div>
                      <div className="text-2xl font-bold text-warning-900">{formatCRC(todaySummary.sinpeSales)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-error-50 p-4 rounded-lg border border-error-200">
                      <div className="text-sm text-error-600 font-medium">Crédito</div>
                      <div className="text-2xl font-bold text-error-900">{formatCRC(todaySummary.creditSales)}</div>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                      <div className="text-sm text-neutral-600 font-medium">Transacciones</div>
                      <div className="text-2xl font-bold text-neutral-900">{todaySummary.transactionCount}</div>
                    </div>
                  </div>
                </div>

                {/* Physical Count */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="text-sm font-medium text-red-800">Errores de Validación</h3>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Conteo Físico de Efectivo</h2>
                  
                  {/* Toggle para conteo detallado */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useDetailedCount}
                        onChange={(e) => {
                          setUseDetailedCount(e.target.checked)
                          if (e.target.checked) {
                            setPhysicalCount(detailedCount.toString())
                          }
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">
                        Usar conteo detallado por denominaciones
                      </span>
                    </label>
                  </div>

                  {useDetailedCount ? (
                    <CashCounter 
                      onTotalChange={handleDetailedCountChange}
                      onDetailedCountChange={handlePhysicalDetailedCountChange}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Efectivo Contado Físicamente
                        </label>
                        <input
                          type="number"
                          value={physicalCount}
                          onChange={(e) => setPhysicalCount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-700 mb-2">Cálculo Esperado</div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Monto inicial:</span>
                              <span>{formatCRC(currentCashClosing.initialAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>+ Ventas en efectivo:</span>
                              <span>{formatCRC(todaySummary.cashSales)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t border-neutral-300 pt-1">
                              <span>Esperado:</span>
                              <span>{formatCRC(expectedAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Difference Calculation */}
                  {physicalCount && (
                    <div className="mt-4">
                      <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <div className="text-sm font-medium text-neutral-700 mb-2">Diferencia</div>
                        <div className={`text-lg font-bold px-3 py-2 rounded-lg border ${getDifferenceColor(difference)}`}>
                          {getDifferenceText(difference)}
                        </div>
                        {Math.abs(difference) > 10000 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ Diferencia alta detectada. Se requerirá confirmación adicional.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Notas y Observaciones
                      {hasDifference && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </label>
                    {hasDifference && (
                      <p className="text-xs text-red-600 mb-2">
                        Las notas son obligatorias cuando hay diferencias en el conteo
                      </p>
                    )}
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={hasDifference 
                        ? "Explique la razón de la diferencia en el conteo (obligatorio)..." 
                        : "Ingrese cualquier observación sobre el cierre..."
                      }
                      rows={hasDifference ? 4 : 3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                        hasDifference && (!notes || notes.trim().length < 10)
                          ? 'border-red-300 bg-red-50'
                          : 'border-neutral-300'
                      }`}
                    />
                    {hasDifference && notes && notes.trim().length < 10 && (
                      <p className="text-xs text-red-600 mt-1">
                        Mínimo 10 caracteres requeridos ({notes.trim().length}/10)
                      </p>
                    )}
                  </div>
                </div>

                {/* General Cash Count */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Conteo de Caja General</h2>
                  
                  {/* Toggle para conteo detallado de caja general */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useGeneralDetailedCount}
                        onChange={(e) => {
                          setUseGeneralDetailedCount(e.target.checked)
                          if (e.target.checked) {
                            setGeneralCashCount(generalDetailedCount.toString())
                          }
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">
                        Usar conteo detallado por denominaciones
                      </span>
                    </label>
                  </div>

                  {useGeneralDetailedCount ? (
                    <GeneralCashCounter 
                      onTotalChange={handleGeneralDetailedCountChange}
                      onDetailedCountChange={handleGeneralDetailedCountDataChange}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Efectivo en Caja General
                      </label>
                      <input
                        type="number"
                        value={generalCashCount}
                        onChange={(e) => setGeneralCashCount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>
                  )}
                </div>

                {/* Remaining Cash Count */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Efectivo que Queda en Caja (Día Siguiente)</h2>
                  
                  {/* Toggle para conteo detallado del efectivo restante */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useRemainingDetailedCount}
                        onChange={(e) => {
                          setUseRemainingDetailedCount(e.target.checked)
                          if (e.target.checked) {
                            setRemainingCashCount(remainingDetailedCount.toString())
                          }
                        }}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-neutral-700">
                        Usar conteo detallado por denominaciones
                      </span>
                    </label>
                  </div>

                  {useRemainingDetailedCount ? (
                    <GeneralCashCounter 
                      onTotalChange={handleRemainingDetailedCountChange}
                      onDetailedCountChange={handleRemainingDetailedCountDataChange}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Efectivo que Queda para el Día Siguiente
                      </label>
                      <input
                        type="number"
                        value={remainingCashCount}
                        onChange={(e) => setRemainingCashCount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6">
                  <button
                    onClick={handleFinalizeClosing}
                    disabled={!physicalCount || !generalCashCount || !remainingCashCount || isProcessing}
                    className="mt-4 px-6 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Cierre'
                    )}
                  </button>
                </div>

                {/* Today's Sales */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-lg font-semibold mb-4 text-neutral-900">Ventas del Día</h2>
                  {todaysSales.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Factura</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Hora</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Cliente</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase">Método</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {todaysSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-neutral-50 transition-colors duration-200">
                              <td className="px-4 py-2 text-sm font-medium text-neutral-900">{sale.invoiceNumber}</td>
                              <td className="px-4 py-2 text-sm text-neutral-600">{sale.time}</td>
                              <td className="px-4 py-2 text-sm text-neutral-600">{sale.customerName || 'Cliente general'}</td>
                              <td className="px-4 py-2 text-sm font-medium text-neutral-900">{formatCRC(sale.total)}</td>
                              <td className="px-4 py-2 text-sm text-neutral-600">
                                {sale.paymentDetails.method === 'cash' ? 'Efectivo' :
                                 sale.paymentDetails.method === 'card' ? 'Tarjeta' :
                                 sale.paymentDetails.method === 'sinpe' ? 'SINPE' :
                                 sale.paymentDetails.method === 'credit' ? 'Crédito' : 'Mixto'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-center py-8">No hay ventas registradas hoy</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Closing History */
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Historial de Cierres</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cajero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Turno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Total Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Diferencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {cashClosings.map((closing) => (
                    <tr key={closing.id} className="hover:bg-neutral-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(closing.date).toLocaleDateString('es-CR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {closing.cashierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {closing.startTime} - {closing.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {formatCRC(closing.totalSales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getDifferenceColor(closing.difference)}`}>
                          {getDifferenceText(closing.difference)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          closing.status === 'closed' ? 'text-success-600 bg-success-100 border-success-200' : 'text-warning-600 bg-warning-100 border-warning-200'
                        }`}>
                          {closing.status === 'closed' ? 'Cerrado' : 'Abierto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedClosing(closing)}
                          className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cashClosings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-500">No hay cierres de caja registrados</p>
              </div>
            )}
          </div>
        )}

        {/* Closing Detail Modal */}
        {selectedClosing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-strong">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-neutral-900">Detalle de Cierre</h2>
                  <button
                    onClick={() => setSelectedClosing(null)}
                    className="text-neutral-500 hover:text-neutral-700 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Información General</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Fecha:</span> {new Date(selectedClosing.date).toLocaleDateString('es-CR')}</p>
                      <p><span className="font-medium">Cajero:</span> {selectedClosing.cashierName}</p>
                      <p><span className="font-medium">Turno:</span> {selectedClosing.startTime} - {selectedClosing.endTime}</p>
                      <p><span className="font-medium">Estado:</span> 
                        <span className={`ml-1 px-2 py-1 text-xs rounded-full border ${
                          selectedClosing.status === 'closed' ? 'text-success-600 bg-success-100 border-success-200' : 'text-warning-600 bg-warning-100 border-warning-200'
                        }`}>
                          {selectedClosing.status === 'closed' ? 'Cerrado' : 'Abierto'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Resumen de Ventas</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Total de ventas:</span> {formatCRC(selectedClosing.totalSales)}</p>
                      <p><span className="font-medium">Efectivo:</span> {formatCRC(selectedClosing.cashSales)}</p>
                      <p><span className="font-medium">Tarjeta:</span> {formatCRC(selectedClosing.cardSales)}</p>
                      <p><span className="font-medium">SINPE:</span> {formatCRC(selectedClosing.sinpeSales)}</p>
                      <p><span className="font-medium">Crédito:</span> {formatCRC(selectedClosing.creditSales)}</p>
                      <p><span className="font-medium">Transacciones:</span> {selectedClosing.transactionCount}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Conteo de Efectivo</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monto inicial:</span>
                      <span>{formatCRC(selectedClosing.initialAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas en efectivo:</span>
                      <span>{formatCRC(selectedClosing.cashSales)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Esperado:</span>
                      <span>{formatCRC(selectedClosing.expectedCash)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Conteo físico:</span>
                      <span>{formatCRC(selectedClosing.physicalCashCount)}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-lg border-t border-neutral-300 pt-2 ${
                      selectedClosing.difference > 0 ? 'text-success-600' :
                      selectedClosing.difference < 0 ? 'text-error-600' : 'text-warning-600'
                    }`}>
                      <span>Diferencia:</span>
                      <span>{getDifferenceText(selectedClosing.difference)}</span>
                    </div>
                  </div>
                </div>

                {selectedClosing.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-neutral-900 mb-3">Notas</h3>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-sm">
                      {selectedClosing.notes}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    Exportar a Excel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                    Imprimir Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
        </>
      )}
    </div>
  )
}