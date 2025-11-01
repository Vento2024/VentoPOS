import type { Sale } from '../types'

export class SalesValidationService {
  // Validar si una venta puede ser eliminada
  static canDeleteSale(sale: Sale): { canDelete: boolean; reason?: string } {
    // Regla 1: No se pueden eliminar ventas después de 24 horas
    const saleDateTime = new Date(`${sale.date} ${sale.time}`)
    const now = new Date()
    const hoursDifference = (now.getTime() - saleDateTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursDifference > 24) {
      return {
        canDelete: false,
        reason: 'No se pueden eliminar ventas después de 24 horas'
      }
    }

    // Regla 2: No se pueden eliminar ventas a crédito con pagos parciales
    if (sale.paymentDetails.method === 'credit') {
      return {
        canDelete: false,
        reason: 'No se pueden eliminar ventas a crédito. Use anulación en su lugar.'
      }
    }

    // Regla 3: No se pueden eliminar ventas con descuentos mayores al 30%
    if (sale.discountAmount && sale.discountAmount > 0) {
      const discountPercentage = (sale.discountAmount / sale.subtotalWithoutTax) * 100
      if (discountPercentage > 30) {
        return {
          canDelete: false,
          reason: 'No se pueden eliminar ventas con descuentos superiores al 30%'
        }
      }
    }

    return { canDelete: true }
  }

  // Validar descuento máximo (50% del subtotal)
  static validateDiscount(subtotal: number, discount: number): { isValid: boolean; reason?: string } {
    const maxDiscount = subtotal * 0.5 // 50% máximo
    
    if (discount > maxDiscount) {
      return {
        isValid: false,
        reason: `El descuento no puede exceder ${((maxDiscount / subtotal) * 100).toFixed(0)}% del subtotal`
      }
    }

    return { isValid: true }
  }

  // Validar si se requiere autorización para un descuento
  static requiresDiscountAuthorization(subtotal: number, discount: number): boolean {
    const discountPercentage = (discount / subtotal) * 100
    return discountPercentage > 20 // Requiere autorización para descuentos > 20%
  }

  // Validar modificaciones de venta
  static canModifySale(sale: Sale): { canModify: boolean; reason?: string } {
    // No se pueden modificar ventas después de 2 horas
    const saleDateTime = new Date(`${sale.date} ${sale.time}`)
    const now = new Date()
    const hoursDifference = (now.getTime() - saleDateTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursDifference > 2) {
      return {
        canModify: false,
        reason: 'No se pueden modificar ventas después de 2 horas'
      }
    }

    // No se pueden modificar ventas a crédito
    if (sale.paymentDetails.method === 'credit') {
      return {
        canModify: false,
        reason: 'No se pueden modificar ventas a crédito'
      }
    }

    return { canModify: true }
  }

  // Obtener nivel de riesgo de una venta
  static getSaleRiskLevel(sale: Sale): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // Descuento alto aumenta el riesgo
    if (sale.discountAmount && sale.discountAmount > 0) {
      const discountPercentage = (sale.discountAmount / sale.subtotalWithoutTax) * 100
      if (discountPercentage > 30) riskScore += 3
      else if (discountPercentage > 15) riskScore += 2
      else if (discountPercentage > 5) riskScore += 1
    }

    // Venta a crédito aumenta el riesgo
    if (sale.paymentDetails.method === 'credit') {
      riskScore += 2
    }

    // Monto alto aumenta el riesgo
    if (sale.total > 500000) riskScore += 2 // > ₡500,000
    else if (sale.total > 200000) riskScore += 1 // > ₡200,000

    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  // Validar límites de efectivo
  static validateCashLimits(cashAmount: number): { isValid: boolean; reason?: string } {
    const maxCashTransaction = 1000000 // ₡1,000,000 máximo en efectivo
    
    if (cashAmount > maxCashTransaction) {
      return {
        isValid: false,
        reason: `Las transacciones en efectivo no pueden exceder ${maxCashTransaction.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}`
      }
    }

    return { isValid: true }
  }
}