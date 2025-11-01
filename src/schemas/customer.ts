import { z } from 'zod'

// Customer Schema
export const customerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[0-9\-\+\(\)\s]+$/, 'Formato de teléfono inválido'),
  email: z
    .string()
    .email('Ingrese un email válido')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  creditLimit: z
    .number()
    .min(0, 'El límite de crédito no puede ser negativo')
    .max(10000000, 'El límite de crédito es muy alto')
    .optional()
})

// Credit Sale Schema
export const creditSaleSchema = z.object({
  customerName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  customerPhone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos'),
  dueDate: z
    .string()
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'La fecha de vencimiento debe ser hoy o posterior'),
  amount: z
    .number()
    .min(1, 'El monto debe ser mayor a 0')
    .max(10000000, 'El monto es muy alto')
})

// Customer Payment Schema
export const customerPaymentSchema = z.object({
  customerId: z
    .string()
    .min(1, 'Debe seleccionar un cliente'),
  amount: z
    .number()
    .min(1, 'El monto debe ser mayor a 0')
    .max(10000000, 'El monto es muy alto'),
  paymentMethod: z.enum(['efectivo', 'tarjeta', 'transferencia'], {
    errorMap: () => ({ message: 'Seleccione un método de pago válido' })
  }),
  reference: z
    .string()
    .max(50, 'La referencia no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(200, 'Las notas no pueden exceder 200 caracteres')
    .optional()
    .or(z.literal(''))
})

// Invoice Cancel Schema
export const invoiceCancelSchema = z.object({
  reason: z
    .string()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(200, 'La razón no puede exceder 200 caracteres')
})

// Discount Validation Schema
export const discountSchema = z.object({
  subtotal: z.number().min(0),
  discount: z.number().min(0)
}).refine((data) => {
  const maxDiscount = data.subtotal * 0.5 // 50% máximo
  return data.discount <= maxDiscount
}, {
  message: 'El descuento no puede exceder el 50% del subtotal',
  path: ['discount']
})

// Export types
export type CustomerFormData = z.infer<typeof customerSchema>
export type CreditSaleFormData = z.infer<typeof creditSaleSchema>
export type CustomerPaymentFormData = z.infer<typeof customerPaymentSchema>
export type InvoiceCancelFormData = z.infer<typeof invoiceCancelSchema>
export type DiscountFormData = z.infer<typeof discountSchema>