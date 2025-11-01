import * as XLSX from 'xlsx'
import { SalesReportData, PaymentMethodReport } from './reportService'
import { formatCRC, formatDate } from '../utils/format'

export class ExportService {
  /**
   * Exporta datos de reporte a Excel
   */
  static exportToExcel(reportData: SalesReportData, filename: string = 'reporte-ventas'): void {
    try {
      const wb = XLSX.utils.book_new()
      
      // Hoja 1: Resumen ejecutivo
      const summaryData = [
        ['REPORTE DE VENTAS'],
        [''],
        ['Período:', `${formatDate(reportData.period.startDate)} - ${formatDate(reportData.period.endDate)}`],
        ['Generado:', formatDate(new Date().toISOString())],
        [''],
        ['RESUMEN EJECUTIVO'],
        ['Total de Ventas:', formatCRC(reportData.totalSales)],
        ['Número de Transacciones:', reportData.totalTransactions.toString()],
        ['Ticket Promedio:', formatCRC(reportData.averageTicket)],
        [''],
        ['VENTAS POR MÉTODO DE PAGO'],
        ['Método', 'Total', 'Transacciones', '% del Total'],
        ...reportData.paymentMethods.map(pm => [
          this.getPaymentMethodLabel(pm.method),
          formatCRC(pm.total),
          pm.transactions.toString(),
          `${((pm.total / reportData.totalSales) * 100).toFixed(1)}%`
        ])
      ]
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen')
      
      // Hoja 2: Desglose diario
      const dailyData = [
        ['DESGLOSE DIARIO DE VENTAS'],
        [''],
        ['Fecha', 'Total Ventas', 'Transacciones', 'Ticket Promedio'],
        ...reportData.dailyBreakdown.map(day => [
          formatDate(day.date),
          formatCRC(day.total),
          day.transactions.toString(),
          formatCRC(day.averageTicket)
        ])
      ]
      
      const dailyWs = XLSX.utils.aoa_to_sheet(dailyData)
      XLSX.utils.book_append_sheet(wb, dailyWs, 'Desglose Diario')
      
      // Hoja 3: Productos más vendidos
      const productsData = [
        ['PRODUCTOS MÁS VENDIDOS'],
        [''],
        ['Producto', 'Cantidad Vendida', 'Total Ventas'],
        ...reportData.topProducts.map(product => [
          product.name,
          product.quantity.toString(),
          formatCRC(product.total)
        ])
      ]
      
      const productsWs = XLSX.utils.aoa_to_sheet(productsData)
      XLSX.utils.book_append_sheet(wb, productsWs, 'Top Productos')
      
      // Aplicar estilos básicos
      this.applyExcelStyles(summaryWs)
      this.applyExcelStyles(dailyWs)
      this.applyExcelStyles(productsWs)
      
      // Generar archivo
      const timestamp = new Date().toISOString().split('T')[0]
      const finalFilename = `${filename}_${timestamp}.xlsx`
      XLSX.writeFile(wb, finalFilename)
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      throw new Error('No se pudo exportar el reporte a Excel')
    }
  }
  
  /**
   * Exporta datos de reporte a CSV
   */
  static exportToCSV(reportData: SalesReportData, filename: string = 'reporte-ventas'): void {
    try {
      const headers = [
        'Fecha',
        'Total Ventas',
        'Transacciones',
        'Ticket Promedio',
        'Efectivo',
        'Tarjeta',
        'SINPE Móvil',
        'Crédito',
        'Mixto'
      ]
      
      const rows = reportData.dailyBreakdown.map(day => {
        // Buscar ventas por método de pago para este día
        const paymentMethods = reportData.paymentMethods.reduce((acc, pm) => {
          acc[pm.method] = pm.total // Simplificado para el ejemplo
          return acc
        }, {} as Record<string, number>)
        
        return [
          formatDate(day.date),
          formatCRC(day.total),
          day.transactions.toString(),
          formatCRC(day.averageTicket),
          formatCRC(paymentMethods.cash || 0),
          formatCRC(paymentMethods.card || 0),
          formatCRC(paymentMethods.sinpe || 0),
          formatCRC(paymentMethods.credit || 0),
          formatCRC(paymentMethods.mixed || 0)
        ]
      })
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      
      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `${filename}_${timestamp}.csv`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error al exportar a CSV:', error)
      throw new Error('No se pudo exportar el reporte a CSV')
    }
  }
  
  /**
   * Genera un reporte PDF básico (usando HTML y print)
   */
  static exportToPDF(reportData: SalesReportData, filename: string = 'reporte-ventas'): void {
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión')
      }
      
      const htmlContent = this.generatePDFHTML(reportData)
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Esperar a que se cargue el contenido antes de imprimir
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
      
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      throw new Error('No se pudo exportar el reporte a PDF')
    }
  }
  
  /**
   * Genera HTML para el PDF
   */
  private static generatePDFHTML(reportData: SalesReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Ventas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .metric { display: inline-block; margin: 10px 20px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #f97316; }
          .metric-label { font-size: 14px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Ventas</h1>
          <p>Período: ${formatDate(reportData.period.startDate)} - ${formatDate(reportData.period.endDate)}</p>
          <p>Generado: ${formatDate(new Date().toISOString())}</p>
        </div>
        
        <div class="section">
          <h2>Resumen Ejecutivo</h2>
          <div class="metric">
            <div class="metric-value">${formatCRC(reportData.totalSales)}</div>
            <div class="metric-label">Total Ventas</div>
          </div>
          <div class="metric">
            <div class="metric-value">${reportData.totalTransactions}</div>
            <div class="metric-label">Transacciones</div>
          </div>
          <div class="metric">
            <div class="metric-value">${formatCRC(reportData.averageTicket)}</div>
            <div class="metric-label">Ticket Promedio</div>
          </div>
        </div>
        
        <div class="section">
          <h2>Ventas por Método de Pago</h2>
          <table>
            <thead>
              <tr>
                <th>Método de Pago</th>
                <th>Total</th>
                <th>Transacciones</th>
                <th>% del Total</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.paymentMethods.map(pm => `
                <tr>
                  <td>${this.getPaymentMethodLabel(pm.method)}</td>
                  <td>${formatCRC(pm.total)}</td>
                  <td>${pm.transactions}</td>
                  <td>${((pm.total / reportData.totalSales) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Productos Más Vendidos</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topProducts.slice(0, 10).map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${formatCRC(product.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Aplica estilos básicos a una hoja de Excel
   */
  private static applyExcelStyles(worksheet: XLSX.WorkSheet): void {
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 20 }, // Columna A
      { wch: 15 }, // Columna B
      { wch: 15 }, // Columna C
      { wch: 15 }, // Columna D
    ]
    worksheet['!cols'] = colWidths
  }
  
  /**
   * Obtiene la etiqueta del método de pago
   */
  private static getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      sinpe: 'SINPE Móvil',
      credit: 'Crédito',
      mixed: 'Mixto'
    }
    return labels[method] || method
  }
}

export default ExportService