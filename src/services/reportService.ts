import type { Sale, PaymentMethod } from '../types'
import { useSales } from '../store/sales'

export interface ReportPeriod {
  label: string
  startDate: string
  endDate: string
}

export interface SalesReportData {
  period: ReportPeriod
  totalSales: number
  totalTransactions: number
  averageTicket: number
  salesByPaymentMethod: {
    cash: number
    card: number
    sinpe: number
    credit: number
    mixed: number
  }
  transactionsByPaymentMethod: {
    cash: number
    card: number
    sinpe: number
    credit: number
    mixed: number
  }
  dailyBreakdown: Array<{
    date: string
    sales: number
    transactions: number
  }>
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export interface PaymentMethodReport {
  method: PaymentMethod
  totalSales: number
  totalTransactions: number
  percentage: number
  averageTicket: number
}

export class ReportService {
  
  /**
   * Genera períodos predefinidos para reportes
   */
  static generatePeriods(): {
    today: ReportPeriod
    yesterday: ReportPeriod
    thisWeek: ReportPeriod
    lastWeek: ReportPeriod
    thisMonth: ReportPeriod
    lastMonth: ReportPeriod
    thisYear: ReportPeriod
    lastYear: ReportPeriod
  } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Hoy
    const todayStr = today.toISOString().split('T')[0]
    
    // Ayer
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    // Esta semana (lunes a domingo)
    const thisWeekStart = new Date(today)
    const dayOfWeek = today.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    thisWeekStart.setDate(today.getDate() - daysToMonday)
    
    const thisWeekEnd = new Date(thisWeekStart)
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6)
    
    // Semana pasada
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    
    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
    
    // Este mes
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Mes pasado
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Este año
    const thisYearStart = new Date(now.getFullYear(), 0, 1)
    const thisYearEnd = new Date(now.getFullYear(), 11, 31)
    
    // Año pasado
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)
    
    return {
      today: {
        label: 'Hoy',
        startDate: todayStr,
        endDate: todayStr
      },
      yesterday: {
        label: 'Ayer',
        startDate: yesterdayStr,
        endDate: yesterdayStr
      },
      thisWeek: {
        label: 'Esta Semana',
        startDate: thisWeekStart.toISOString().split('T')[0],
        endDate: thisWeekEnd.toISOString().split('T')[0]
      },
      lastWeek: {
        label: 'Semana Pasada',
        startDate: lastWeekStart.toISOString().split('T')[0],
        endDate: lastWeekEnd.toISOString().split('T')[0]
      },
      thisMonth: {
        label: 'Este Mes',
        startDate: thisMonthStart.toISOString().split('T')[0],
        endDate: thisMonthEnd.toISOString().split('T')[0]
      },
      lastMonth: {
        label: 'Mes Pasado',
        startDate: lastMonthStart.toISOString().split('T')[0],
        endDate: lastMonthEnd.toISOString().split('T')[0]
      },
      thisYear: {
        label: 'Este Año',
        startDate: thisYearStart.toISOString().split('T')[0],
        endDate: thisYearEnd.toISOString().split('T')[0]
      },
      lastYear: {
        label: 'Año Pasado',
        startDate: lastYearStart.toISOString().split('T')[0],
        endDate: lastYearEnd.toISOString().split('T')[0]
      }
    }
  }

  /**
   * Genera un reporte de ventas para un período específico
   */
  static generateSalesReport(startDate: string, endDate: string, sales: Sale[]): SalesReportData {
    // Filtrar ventas por período
    const filteredSales = sales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    )

    // Calcular totales
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = filteredSales.length
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0

    // Ventas por método de pago
    const salesByPaymentMethod = {
      cash: 0,
      card: 0,
      sinpe: 0,
      credit: 0,
      mixed: 0
    }

    const transactionsByPaymentMethod = {
      cash: 0,
      card: 0,
      sinpe: 0,
      credit: 0,
      mixed: 0
    }

    filteredSales.forEach(sale => {
      const method = sale.paymentDetails.method
      salesByPaymentMethod[method] += sale.total
      transactionsByPaymentMethod[method] += 1
    })

    // Desglose diario
    const dailyBreakdown = this.generateDailyBreakdown(startDate, endDate, filteredSales)

    // Productos más vendidos
    const topProducts = this.generateTopProducts(filteredSales)

    return {
      period: {
        label: `${startDate} - ${endDate}`,
        startDate,
        endDate
      },
      totalSales,
      totalTransactions,
      averageTicket,
      salesByPaymentMethod,
      transactionsByPaymentMethod,
      dailyBreakdown,
      topProducts
    }
  }

  /**
   * Genera reporte por método de pago específico
   */
  static generatePaymentMethodReport(method: PaymentMethod, startDate: string, endDate: string, sales: Sale[]): PaymentMethodReport {
    const filteredSales = sales.filter(sale => 
      sale.date >= startDate && 
      sale.date <= endDate && 
      sale.paymentDetails.method === method
    )

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = filteredSales.length
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0

    // Calcular porcentaje del total
    const allSalesInPeriod = sales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    )
    const totalPeriodSales = allSalesInPeriod.reduce((sum, sale) => sum + sale.total, 0)
    const percentage = totalPeriodSales > 0 ? (totalSales / totalPeriodSales) * 100 : 0

    return {
      method,
      totalSales,
      totalTransactions,
      percentage,
      averageTicket
    }
  }

  /**
   * Genera desglose diario para un período
   */
  private static generateDailyBreakdown(startDate: string, endDate: string, sales: Sale[]): Array<{
    date: string
    sales: number
    transactions: number
  }> {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const breakdown: Array<{ date: string; sales: number; transactions: number }> = []

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const daySales = sales.filter(sale => sale.date === dateStr)
      
      breakdown.push({
        date: dateStr,
        sales: daySales.reduce((sum, sale) => sum + sale.total, 0),
        transactions: daySales.length
      })
    }

    return breakdown
  }

  /**
   * Genera lista de productos más vendidos
   */
  private static generateTopProducts(sales: Sale[]): Array<{
    name: string
    quantity: number
    revenue: number
  }> {
    const productMap = new Map<string, { quantity: number; revenue: number }>()

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 }
        productMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        })
      })
    })

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 productos
  }

  /**
   * Genera datos para gráficos de comparación
   */
  static generateComparisonData(currentPeriod: SalesReportData, previousPeriod: SalesReportData) {
    return {
      salesGrowth: previousPeriod.totalSales > 0 
        ? ((currentPeriod.totalSales - previousPeriod.totalSales) / previousPeriod.totalSales) * 100 
        : 0,
      transactionGrowth: previousPeriod.totalTransactions > 0 
        ? ((currentPeriod.totalTransactions - previousPeriod.totalTransactions) / previousPeriod.totalTransactions) * 100 
        : 0,
      averageTicketGrowth: previousPeriod.averageTicket > 0 
        ? ((currentPeriod.averageTicket - previousPeriod.averageTicket) / previousPeriod.averageTicket) * 100 
        : 0
    }
  }

  /**
   * Exporta datos de reporte a formato CSV
   */
  static exportToCSV(reportData: SalesReportData): string {
    const headers = [
      'Fecha',
      'Ventas Totales',
      'Transacciones',
      'Ticket Promedio',
      'Efectivo',
      'Tarjeta',
      'SINPE',
      'Crédito',
      'Mixto'
    ]

    const rows = reportData.dailyBreakdown.map(day => {
      const daySales = reportData.dailyBreakdown.find(d => d.date === day.date)
      return [
        day.date,
        day.sales.toString(),
        day.transactions.toString(),
        (day.transactions > 0 ? day.sales / day.transactions : 0).toString(),
        // Aquí necesitaríamos datos más detallados por día y método de pago
        '', '', '', '', ''
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    return csvContent
  }

  /**
   * Obtiene resumen ejecutivo del período
   */
  static getExecutiveSummary(reportData: SalesReportData): {
    bestDay: { date: string; sales: number }
    worstDay: { date: string; sales: number }
    mostUsedPaymentMethod: PaymentMethod
    leastUsedPaymentMethod: PaymentMethod
    trend: 'up' | 'down' | 'stable'
  } {
    const { dailyBreakdown, salesByPaymentMethod } = reportData

    // Mejor y peor día
    const bestDay = dailyBreakdown.reduce((best, day) => 
      day.sales > best.sales ? day : best
    )
    const worstDay = dailyBreakdown.reduce((worst, day) => 
      day.sales < worst.sales ? day : worst
    )

    // Método de pago más y menos usado
    const paymentMethods = Object.entries(salesByPaymentMethod) as [PaymentMethod, number][]
    const mostUsed = paymentMethods.reduce((max, [method, amount]) => 
      amount > max[1] ? [method, amount] : max
    )
    const leastUsed = paymentMethods.reduce((min, [method, amount]) => 
      amount < min[1] && amount > 0 ? [method, amount] : min
    )

    // Tendencia (simplificada - comparar primera mitad vs segunda mitad)
    const midPoint = Math.floor(dailyBreakdown.length / 2)
    const firstHalf = dailyBreakdown.slice(0, midPoint)
    const secondHalf = dailyBreakdown.slice(midPoint)
    
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.sales, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.sales, 0) / secondHalf.length
    
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (secondHalfAvg > firstHalfAvg * 1.05) trend = 'up'
    else if (secondHalfAvg < firstHalfAvg * 0.95) trend = 'down'

    return {
      bestDay: { date: bestDay.date, sales: bestDay.sales },
      worstDay: { date: worstDay.date, sales: worstDay.sales },
      mostUsedPaymentMethod: mostUsed[0],
      leastUsedPaymentMethod: leastUsed[0],
      trend
    }
  }
}