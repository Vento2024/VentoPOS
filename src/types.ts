export type Unit = 'unit' | 'kg' | 'g' | 'lb'

export type Product = {
  id: number | string
  name: string
  description?: string
  price: number
  costPrice?: number
  cost?: number // Alias para costPrice
  taxRate?: number
  tax?: number // Alias para taxRate
  stock: number
  minStock?: number
  maxStock?: number
  category?: string
  barcode?: string
  code?: string // Código del producto
  sku?: string // SKU del producto
  imageUrl?: string
  image?: string // Alias para imageUrl
  isActive?: boolean
  active?: boolean // Alias para isActive
  unit?: Unit
  isWeightBased?: boolean
  isPorPeso?: boolean
  createdAt?: string
  updatedAt?: string
  // Nuevas propiedades
  profitMargin?: number // Porcentaje de ganancia
  isTaxInclusivePrice?: boolean // Precio incluye impuesto
  isPriceChangeAllowed?: boolean // Permitir cambio de precio
  isUsingDefaultQuantity?: boolean // Usar cantidad por defecto
  isService?: boolean // Es servicio
  isEnabled?: boolean // Habilitado
  quantity?: number // Cantidad por defecto
}

export type CartItem = {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type OrderPayload = {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: CartItem[]
  subtotalWithoutTax: number
  taxAmount: number
  total: number
}

export type PaymentMethod = 'cash' | 'card' | 'sinpe' | 'credit' | 'mixed'

export type PaymentDetails = {
  method: PaymentMethod
  cashAmount?: number
  cardAmount?: number
  sinpeAmount?: number
  creditAmount?: number
  receivedAmount?: number
  changeAmount?: number
  creditDueDate?: string
}

export type Sale = {
  id: string
  invoiceNumber: string
  date: string
  time: string
  cashierName: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items: CartItem[]
  subtotalWithoutTax: number
  taxAmount: number
  discountAmount?: number
  total: number
  paymentDetails: PaymentDetails
  status: 'completed' | 'cancelled' | 'refunded' | 'hold'
  notes?: string
}

export type HoldSale = {
  id: string
  cashierName: string
  customerName?: string
  customerPhone?: string
  items: CartItem[]
  subtotalWithoutTax: number
  taxAmount: number
  discountAmount?: number
  total: number
  createdAt: string
  notes?: string
}

export type CashClosing = {
  id: string
  date: string
  cashierName: string
  startTime: string
  endTime: string
  initialAmount: number
  totalSales: number
  cashSales: number
  cardSales: number
  sinpeSales: number
  creditSales: number
  transactionCount: number
  physicalCashCount: number
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
  expectedCash: number
  difference: number
  notes?: string
  status: 'open' | 'closed'
}

export type InvoiceData = {
  sale: Sale
  businessInfo: {
    name: string
    phone: string
    address?: string
    email?: string
  }
}

export type SalesFilter = {
  startDate?: string
  endDate?: string
  cashier?: string
  paymentMethod?: PaymentMethod
  customer?: string
}

// Customer and Credit Types
export type Customer = {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  balance: number // Saldo actual del cliente
  creditLimit?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreditSale = {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  invoiceNumber: string
  amount: number
  dueDate: string
  isPaid: boolean
  paidAt?: string
  paidAmount?: number
  createdAt: string
  updatedAt: string
}

export type CustomerPayment = {
  id: string
  customerId: string
  amount: number
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
  createdAt: string
  cashierId: string
}

// Invoice Types
export type Invoice = {
  id: string
  number: string // Número secuencial único
  customerId?: string
  customerName?: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  paymentDetails?: PaymentDetails
  isCredit: boolean
  creditDueDate?: string
  status: 'active' | 'cancelled' | 'refunded'
  cashierId: string
  cashierName: string
  createdAt: string
  cancelledAt?: string
  cancelReason?: string
}

// Authentication Types
export type UserRole = 'admin' | 'cashier'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  name: string
  email: string
  password: string
  role: UserRole
}

export type AuthResponse = {
  user: User
  token: string
  expiresAt: string
}