import { z } from 'zod'

// Customer Schema
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9\-\+\(\)\s]+$/, 'Formato de teléfono inválido'),
  email: z
    .string()
    .email('Ingrese un email válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
})

// Cart Item Schema
export const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  quantity: z
    .number()
    .positive('La cantidad debe ser mayor a 0')
    .max(9999, 'La cantidad no puede exceder 9999'),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
})

// Payment Details Schema
export const paymentDetailsSchema = z.object({
  method: z.enum(['cash', 'card', 'sinpe', 'credit', 'mixed']),
  cashAmount: z.number().min(0).optional(),
  cardAmount: z.number().min(0).optional(),
  sinpeAmount: z.number().min(0).optional(),
  creditAmount: z.number().min(0).optional(),
  receivedAmount: z.number().min(0).optional(),
  changeAmount: z.number().min(0).optional(),
  creditDueDate: z.string().optional(),
}).refine((data) => {
  // Validate that at least one payment amount is provided
  const hasPayment = data.cashAmount || data.cardAmount || data.sinpeAmount || data.creditAmount
  return hasPayment && hasPayment > 0
}, {
  message: 'Debe especificar al menos un método de pago',
  path: ['method'],
})

// Order Schema
export const orderSchema = z.object({
  orderNumber: z.string().min(1),
  customerName: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  customerPhone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9\-\+\(\)\s]+$/, 'Formato de teléfono inválido'),
  customerEmail: z
    .string()
    .email('Ingrese un email válido')
    .optional()
    .or(z.literal('')),
  items: z
    .array(cartItemSchema)
    .min(1, 'Debe agregar al menos un producto'),
  subtotalWithoutTax: z.number().min(0),
  taxAmount: z.number().min(0),
  total: z.number().positive('El total debe ser mayor a 0'),
})

// Cash Closing Schema
export const cashClosingSchema = z.object({
  initialAmount: z
    .number()
    .min(0, 'El monto inicial no puede ser negativo'),
  physicalCashCount: z
    .number()
    .min(0, 'El conteo físico no puede ser negativo'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
})

// Sales Filter Schema
export const salesFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  cashier: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'sinpe', 'credit', 'mixed']).optional(),
  customer: z.string().optional(),
}).refine((data) => {
  // If both dates are provided, start date should be before end date
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate'],
})

// Refund Schema
export const refundSchema = z.object({
  saleId: z.string().min(1),
  reason: z
    .string()
    .min(1, 'La razón del reembolso es requerida')
    .max(200, 'La razón no puede exceder 200 caracteres'),
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0'),
  refundMethod: z.enum(['cash', 'card', 'credit']),
})

// Export types
export type CustomerFormData = z.infer<typeof customerSchema>
export type CartItemFormData = z.infer<typeof cartItemSchema>
export type PaymentDetailsFormData = z.infer<typeof paymentDetailsSchema>
export type OrderFormData = z.infer<typeof orderSchema>
export type CashClosingFormData = z.infer<typeof cashClosingSchema>
export type SalesFilterFormData = z.infer<typeof salesFilterSchema>
export type RefundFormData = z.infer<typeof refundSchema>