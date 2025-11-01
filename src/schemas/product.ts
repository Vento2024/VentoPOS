import { z } from 'zod'

// Product Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del producto es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  price: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio no puede exceder ₡999,999.99'),
  costPrice: z
    .number()
    .min(0, 'El precio de costo no puede ser negativo')
    .max(999999.99, 'El precio de costo no puede exceder ₡999,999.99'),
  taxRate: z
    .number()
    .min(0, 'La tasa de impuesto no puede ser negativa')
    .max(100, 'La tasa de impuesto no puede exceder 100%')
    .optional(),
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  category: z
    .string()
    .max(50, 'La categoría no puede exceder 50 caracteres')
    .optional(),
  barcode: z
    .string()
    .max(50, 'El código de barras no puede exceder 50 caracteres')
    .regex(/^[0-9A-Za-z\-]*$/, 'El código de barras solo puede contener números, letras y guiones')
    .optional(),
  imageUrl: z
    .string()
    .url('Ingrese una URL válida')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
  unit: z.enum(['unit', 'kg', 'g', 'lb']).default('unit'),
  isWeightBased: z.boolean().default(false),
}).refine((data) => data.price > data.costPrice, {
  message: 'El precio de venta debe ser mayor al precio de costo',
  path: ['price'],
})

// Stock Update Schema
export const stockUpdateSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero'),
  type: z.enum(['add', 'subtract', 'set']),
  reason: z
    .string()
    .min(1, 'La razón es requerida')
    .max(200, 'La razón no puede exceder 200 caracteres'),
})

// Barcode Search Schema
export const barcodeSearchSchema = z.object({
  barcode: z
    .string()
    .min(1, 'El código de barras es requerido')
    .max(50, 'El código de barras no puede exceder 50 caracteres')
    .regex(/^[0-9A-Za-z\-]+$/, 'Código de barras inválido'),
})

// Category Schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la categoría es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  description: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional(),
})

// Export types
export type ProductFormData = z.infer<typeof productSchema>
export type StockUpdateFormData = z.infer<typeof stockUpdateSchema>
export type BarcodeSearchFormData = z.infer<typeof barcodeSearchSchema>
export type CategoryFormData = z.infer<typeof categorySchema>