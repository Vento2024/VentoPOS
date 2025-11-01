import { create } from 'zustand'
import type { Sale, CashClosing, SalesFilter, PaymentMethod, HoldSale } from '../types'
import { invoiceService } from '../services/invoiceService'

// Mock data for development
const mockSales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    time: '10:30:00',
    cashierName: 'María González',
    customerName: 'Juan Pérez',
    customerPhone: '8765-4321',
    customerEmail: 'juan@email.com',
    items: [
      {
        productId: 1,
        productName: 'Arroz Tío Pelón 1kg',
        quantity: 2,
        unitPrice: 1200,
        totalPrice: 2400
      },
      {
        productId: 2,
        productName: 'Frijoles Negros 500g',
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800
      }
    ],
    subtotalWithoutTax: 2831.86,
    taxAmount: 368.14,
    total: 3200,
    paymentDetails: {
      method: 'cash',
      cashAmount: 3200,
      receivedAmount: 5000,
      changeAmount: 1800
    },
    status: 'completed'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-01-15',
    time: '11:45:00',
    cashierName: 'Carlos Rodríguez',
    customerName: 'Ana López',
    customerPhone: '8888-9999',
    items: [
      {
        productId: 3,
        productName: 'Aceite Capri 1L',
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500
      }
    ],
    subtotalWithoutTax: 2212.39,
    taxAmount: 287.61,
    total: 2500,
    paymentDetails: {
      method: 'card',
      cardAmount: 2500
    },
    status: 'completed'
  }
]

const mockCashClosings: CashClosing[] = [
  {
    id: '1',
    date: '2024-01-15',
    cashierName: 'María González',
    startTime: '08:00:00',
    endTime: '16:00:00',
    initialAmount: 50000,
    totalSales: 125000,
    cashSales: 75000,
    cardSales: 30000,
    sinpeSales: 15000,
    creditSales: 5000,
    transactionCount: 45,
    physicalCashCount: 124500,
    expectedCash: 125000,
    difference: -500,
    notes: 'Faltante de ₡500 en efectivo',
    status: 'closed'
  }
]

type SalesState = {
  sales: Sale[]
  holdSales: HoldSale[]
  cashClosings: CashClosing[]
  currentCashClosing: CashClosing | null
  filters: SalesFilter
  
  // Sales actions
  addSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber'>) => Promise<Sale>
  getSaleById: (id: string) => Sale | undefined
  getFilteredSales: () => Sale[]
  setFilters: (filters: Partial<SalesFilter>) => void
  
  // Hold sales actions
  saveHoldSale: (holdSaleData: Omit<HoldSale, 'id' | 'createdAt'>) => string
  getHoldSales: () => HoldSale[]
  getHoldSaleById: (id: string) => HoldSale | undefined
  deleteHoldSale: (id: string) => void
  convertHoldSaleToSale: (holdSaleId: string, paymentDetails: any) => Promise<Sale>
  
  // Cash closing actions
  startCashClosing: (cashierName: string, initialAmount: number) => void
  updateCashClosing: (updates: Partial<CashClosing>) => void
  finalizeCashClosing: (physicalCount: number, notes?: string) => void
  getCashClosingById: (id: string) => CashClosing | undefined
  
  // Utility functions
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[]
  getSalesByCashier: (cashierName: string) => Sale[]
  getSalesByPaymentMethod: (method: PaymentMethod) => Sale[]
  getTodaysSales: () => Sale[]
  calculateDailySummary: (date: string) => {
    totalSales: number
    cashSales: number
    cardSales: number
    sinpeSales: number
    creditSales: number
    transactionCount: number
  }
}

export const useSales = create<SalesState>((set, get) => ({
  sales: mockSales,
  holdSales: [],
  cashClosings: mockCashClosings,
  currentCashClosing: null,
  filters: {},

  addSale: async (saleData) => {
    try {
      // Crear la factura usando el servicio
      const invoice = await invoiceService.createInvoice(saleData)
      
      // Agregar la venta al estado
      set((state) => ({
        sales: [invoice, ...state.sales]
      }))
      
      return invoice
    } catch (error) {
      console.error('Error al crear la venta:', error)
      throw error
    }
  },

  getSaleById: (id) => {
    const { sales } = get()
    return sales.find(sale => sale.id === id)
  },

  getFilteredSales: () => {
    const { sales, filters } = get()
    let filtered = [...sales]

    if (filters.startDate) {
      filtered = filtered.filter(sale => sale.date >= filters.startDate!)
    }
    if (filters.endDate) {
      filtered = filtered.filter(sale => sale.date <= filters.endDate!)
    }
    if (filters.cashier) {
      filtered = filtered.filter(sale => 
        sale.cashierName.toLowerCase().includes(filters.cashier!.toLowerCase())
      )
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(sale => sale.paymentDetails.method === filters.paymentMethod)
    }
    if (filters.customer) {
      filtered = filtered.filter(sale => 
        sale.customerName?.toLowerCase().includes(filters.customer!.toLowerCase()) ||
        sale.customerPhone?.includes(filters.customer!)
      )
    }

    return filtered.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Hold sales functions
  saveHoldSale: (holdSaleData) => {
    const id = Date.now().toString()
    const holdSale: HoldSale = {
      ...holdSaleData,
      id,
      createdAt: new Date().toISOString()
    }
    
    set((state) => ({
      holdSales: [...state.holdSales, holdSale]
    }))
    
    return id
  },

  getHoldSales: () => {
    const { holdSales } = get()
    return holdSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getHoldSaleById: (id) => {
    const { holdSales } = get()
    return holdSales.find(holdSale => holdSale.id === id)
  },

  deleteHoldSale: (id) => set((state) => ({
    holdSales: state.holdSales.filter(holdSale => holdSale.id !== id)
  })),

  convertHoldSaleToSale: async (holdSaleId, paymentDetails) => {
    const { holdSales, addSale, deleteHoldSale } = get()
    const holdSale = holdSales.find(h => h.id === holdSaleId)
    
    if (!holdSale) {
      throw new Error('Venta guardada no encontrada')
    }

    const saleData = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      cashierName: holdSale.cashierName,
      customerName: holdSale.customerName,
      customerPhone: holdSale.customerPhone,
      items: holdSale.items,
      subtotalWithoutTax: holdSale.subtotalWithoutTax,
      taxAmount: holdSale.taxAmount,
      discountAmount: holdSale.discountAmount,
      total: holdSale.total,
      paymentDetails,
      status: 'completed' as const,
      notes: holdSale.notes
    }

    const sale = await addSale(saleData)
    deleteHoldSale(holdSaleId)
    return sale
  },

  startCashClosing: (cashierName, initialAmount) => {
    const now = new Date()
    const newClosing: CashClosing = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      cashierName,
      startTime: now.toTimeString().split(' ')[0],
      endTime: '',
      initialAmount,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      sinpeSales: 0,
      creditSales: 0,
      transactionCount: 0,
      physicalCashCount: 0,
      expectedCash: initialAmount,
      difference: 0,
      status: 'open'
    }
    set({ currentCashClosing: newClosing })
  },

  updateCashClosing: (updates) => set((state) => ({
    currentCashClosing: state.currentCashClosing 
      ? { ...state.currentCashClosing, ...updates }
      : null
  })),

  finalizeCashClosing: (physicalCount, notes) => set((state) => {
    if (!state.currentCashClosing) return state

    const now = new Date()
    const summary = get().calculateDailySummary(state.currentCashClosing.date)
    
    const finalizedClosing: CashClosing = {
      ...state.currentCashClosing,
      endTime: now.toTimeString().split(' ')[0],
      totalSales: summary.totalSales,
      cashSales: summary.cashSales,
      cardSales: summary.cardSales,
      sinpeSales: summary.sinpeSales,
      creditSales: summary.creditSales,
      transactionCount: summary.transactionCount,
      physicalCashCount: physicalCount,
      expectedCash: state.currentCashClosing.initialAmount + summary.cashSales,
      difference: physicalCount - (state.currentCashClosing.initialAmount + summary.cashSales),
      notes,
      status: 'closed'
    }

    return {
      cashClosings: [finalizedClosing, ...state.cashClosings],
      currentCashClosing: null
    }
  }),

  getCashClosingById: (id) => {
    const { cashClosings } = get()
    return cashClosings.find(closing => closing.id === id)
  },

  getSalesByDateRange: (startDate, endDate) => {
    const { sales } = get()
    return sales.filter(sale => sale.date >= startDate && sale.date <= endDate)
  },

  getSalesByCashier: (cashierName) => {
    const { sales } = get()
    return sales.filter(sale => 
      sale.cashierName.toLowerCase().includes(cashierName.toLowerCase())
    )
  },

  getSalesByPaymentMethod: (method) => {
    const { sales } = get()
    return sales.filter(sale => sale.paymentDetails.method === method)
  },

  getTodaysSales: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().getSalesByDateRange(today, today)
  },

  calculateDailySummary: (date) => {
    const sales = get().getSalesByDateRange(date, date)
    
    return sales.reduce((summary, sale) => {
      summary.totalSales += sale.total
      summary.transactionCount += 1

      switch (sale.paymentDetails.method) {
        case 'cash':
          summary.cashSales += sale.paymentDetails.cashAmount || sale.total
          break
        case 'card':
          summary.cardSales += sale.paymentDetails.cardAmount || sale.total
          break
        case 'sinpe':
          summary.sinpeSales += sale.paymentDetails.sinpeAmount || sale.total
          break
        case 'credit':
          summary.creditSales += sale.paymentDetails.creditAmount || sale.total
          break
        case 'mixed':
          summary.cashSales += sale.paymentDetails.cashAmount || 0
          summary.cardSales += sale.paymentDetails.cardAmount || 0
          summary.sinpeSales += sale.paymentDetails.sinpeAmount || 0
          summary.creditSales += sale.paymentDetails.creditAmount || 0
          break
      }

      return summary
    }, {
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      sinpeSales: 0,
      creditSales: 0,
      transactionCount: 0
    })
  }
}))

// Inicializar el store con datos de localStorage
const initializeSalesStore = () => {
  const existingSales = invoiceService.getAllInvoices()
  useSales.setState({ sales: existingSales })
}

// Llamar la inicialización
initializeSalesStore()