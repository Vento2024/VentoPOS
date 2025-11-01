import { Invoice, CartItem, PaymentMethod, PaymentDetails, Customer } from '../types'

export class InvoiceService {
  private static readonly INVOICE_KEY = 'invoices'
  private static readonly COUNTER_KEY = 'invoiceCounter'
  private static readonly CUSTOMERS_KEY = 'customers'

  // Generar número de factura único y secuencial
  static generateInvoiceNumber(): string {
    const counter = parseInt(localStorage.getItem(this.COUNTER_KEY) || '1')
    const invoiceNumber = counter.toString().padStart(8, '0')
    localStorage.setItem(this.COUNTER_KEY, (counter + 1).toString())
    return invoiceNumber
  }

  // Crear nueva factura
  static createInvoice(data: {
    items: CartItem[]
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentMethod: PaymentMethod
    paymentDetails?: PaymentDetails
    isCredit: boolean
    creditDueDate?: string
    customerId?: string
    customerName?: string
    customerPhone?: string
    cashierId: string
    cashierName: string
  }): Invoice {
    const invoiceNumber = this.generateInvoiceNumber()
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: invoiceNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount,
      total: data.total,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      isCredit: data.isCredit,
      creditDueDate: data.creditDueDate,
      status: 'active',
      cashierId: data.cashierId,
      cashierName: data.cashierName,
      createdAt: new Date().toISOString()
    }

    // Guardar factura
    this.saveInvoice(invoice)

    // Si es crédito, crear o actualizar cliente
    if (data.isCredit && data.customerName && data.customerPhone) {
      this.handleCreditSale(invoice, data.customerName, data.customerPhone)
    }

    return invoice
  }

  // Guardar factura en localStorage
  private static saveInvoice(invoice: Invoice): void {
    const invoices = this.getAllInvoices()
    invoices.push(invoice)
    localStorage.setItem(this.INVOICE_KEY, JSON.stringify(invoices))
  }

  // Obtener todas las facturas
  static getAllInvoices(): Invoice[] {
    const invoices = localStorage.getItem(this.INVOICE_KEY)
    return invoices ? JSON.parse(invoices) : []
  }

  // Obtener factura por ID
  static getInvoiceById(id: string): Invoice | null {
    const invoices = this.getAllInvoices()
    return invoices.find(inv => inv.id === id) || null
  }

  // Obtener factura por número
  static getInvoiceByNumber(number: string): Invoice | null {
    const invoices = this.getAllInvoices()
    return invoices.find(inv => inv.number === number) || null
  }

  // Anular factura (no se puede eliminar, solo anular)
  static cancelInvoice(invoiceId: string, reason: string, cashierId: string): boolean {
    const invoices = this.getAllInvoices()
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId)
    
    if (invoiceIndex === -1) {
      throw new Error('Factura no encontrada')
    }

    const invoice = invoices[invoiceIndex]
    
    if (invoice.status !== 'active') {
      throw new Error('La factura ya está anulada o reembolsada')
    }

    // Anular factura
    invoice.status = 'cancelled'
    invoice.cancelledAt = new Date().toISOString()
    invoice.cancelReason = reason

    // Si era crédito, revertir el balance del cliente
    if (invoice.isCredit && invoice.customerId) {
      this.revertCreditSale(invoice.customerId, invoice.total)
    }

    localStorage.setItem(this.INVOICE_KEY, JSON.stringify(invoices))
    return true
  }

  // Manejar venta a crédito
  private static handleCreditSale(invoice: Invoice, customerName: string, customerPhone: string): void {
    let customer = this.findOrCreateCustomer(customerName, customerPhone)
    
    // Actualizar balance del cliente
    customer.balance += invoice.total
    customer.updatedAt = new Date().toISOString()
    
    this.updateCustomer(customer)
    
    // Actualizar el customerId en la factura
    invoice.customerId = customer.id
    invoice.customerName = customer.name
  }

  // Buscar o crear cliente automáticamente
  private static findOrCreateCustomer(name: string, phone: string): Customer {
    const customers = this.getAllCustomers()
    
    // Buscar cliente existente por teléfono
    let customer = customers.find(c => c.phone === phone)
    
    if (!customer) {
      // Crear nuevo cliente
      customer = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        phone: phone,
        balance: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      customers.push(customer)
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers))
    }
    
    return customer
  }

  // Obtener todos los clientes
  static getAllCustomers(): Customer[] {
    const customers = localStorage.getItem(this.CUSTOMERS_KEY)
    return customers ? JSON.parse(customers) : []
  }

  // Actualizar cliente
  private static updateCustomer(customer: Customer): void {
    const customers = this.getAllCustomers()
    const index = customers.findIndex(c => c.id === customer.id)
    
    if (index !== -1) {
      customers[index] = customer
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers))
    }
  }

  // Revertir venta a crédito (cuando se anula)
  private static revertCreditSale(customerId: string, amount: number): void {
    const customers = this.getAllCustomers()
    const customer = customers.find(c => c.id === customerId)
    
    if (customer) {
      customer.balance -= amount
      customer.updatedAt = new Date().toISOString()
      this.updateCustomer(customer)
    }
  }

  // Obtener clientes con saldo vencido
  static getOverdueCustomers(): Customer[] {
    const customers = this.getAllCustomers()
    const invoices = this.getAllInvoices()
    
    return customers.filter(customer => {
      if (customer.balance <= 0) return false
      
      // Buscar facturas de crédito vencidas
      const overdueInvoices = invoices.filter(inv => 
        inv.customerId === customer.id &&
        inv.isCredit &&
        inv.status === 'active' &&
        inv.creditDueDate &&
        new Date(inv.creditDueDate) < new Date()
      )
      
      return overdueInvoices.length > 0
    })
  }

  // Validar descuento máximo (50%)
  static validateDiscount(subtotal: number, discount: number): boolean {
    const maxDiscount = subtotal * 0.5 // 50% máximo
    return discount <= maxDiscount
  }

  // Obtener estadísticas de facturas
  static getInvoiceStats() {
    const invoices = this.getAllInvoices()
    const today = new Date().toISOString().split('T')[0]
    
    const todayInvoices = invoices.filter(inv => 
      inv.createdAt.startsWith(today) && inv.status === 'active'
    )
    
    const totalSales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const creditSales = todayInvoices.filter(inv => inv.isCredit)
    const totalCredit = creditSales.reduce((sum, inv) => sum + inv.total, 0)
    
    return {
      totalInvoices: todayInvoices.length,
      totalSales,
      creditSales: creditSales.length,
      totalCredit,
      cashSales: totalSales - totalCredit
    }
  }

  // Guardar clientes
  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers))
  }

  // Registrar pago de cliente
  static recordPayment(customerId: string, amount: number): void {
    const customers = this.getAllCustomers()
    const customerIndex = customers.findIndex(c => c.id === customerId)
    
    if (customerIndex === -1) {
      throw new Error('Cliente no encontrado')
    }

    const customer = customers[customerIndex]
    if (amount > customer.balance) {
      throw new Error('El monto excede el saldo pendiente')
    }

    // Actualizar saldo del cliente
    customer.balance -= amount
    customer.updatedAt = new Date().toISOString()
    
    customers[customerIndex] = customer
    this.saveCustomers(customers)

    // Registrar el pago en el historial
    const payments = this.getPaymentHistory()
    const payment = {
      id: `payment-${Date.now()}`,
      customerId,
      customerName: customer.name,
      amount,
      date: new Date().toISOString(),
      type: 'credit_payment' as const
    }
    
    payments.push(payment)
    localStorage.setItem('payments', JSON.stringify(payments))
  }

  // Obtener historial de pagos
  static getPaymentHistory() {
    const payments = localStorage.getItem('payments')
    return payments ? JSON.parse(payments) : []
  }

  // Actualizar saldo de cliente
  static updateCustomerBalance(customerId: string, amount: number): void {
    const customers = this.getAllCustomers()
    const customerIndex = customers.findIndex(c => c.id === customerId)
    
    if (customerIndex === -1) {
      throw new Error('Cliente no encontrado')
    }

    customers[customerIndex].balance += amount
    customers[customerIndex].updatedAt = new Date().toISOString()
    
    this.saveCustomers(customers)
  }

  // Crear nuevo cliente manualmente
  static createCustomer(data: {
    name: string
    phone: string
    email?: string
    address?: string
    creditLimit?: number
  }): Customer {
    const customers = this.getAllCustomers()
    
    // Verificar que no exista un cliente con el mismo teléfono
    const existingCustomer = customers.find(c => c.phone === data.phone)
    if (existingCustomer) {
      throw new Error('Ya existe un cliente con este número de teléfono')
    }

    const newCustomer: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      balance: 0,
      creditLimit: data.creditLimit || 50000, // Límite por defecto de ₡50,000
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    customers.push(newCustomer)
    this.saveCustomers(customers)
    
    return newCustomer
  }
}

// Exportar instancia del servicio
export const invoiceService = InvoiceService