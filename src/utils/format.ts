export const formatCRC = (value: number) =>
  new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(value)

export const generateOrderNumber = () => {
  const now = new Date()
  const ts = now.getTime().toString().slice(-6)
  const rand = Math.floor(Math.random() * 900 + 100)
  return `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${ts}-${rand}`
}

export const makeWhatsAppMessage = (payload: {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: { quantity: number; productName: string; totalPrice: number; unitPrice: number }[]
  subtotalWithoutTax: number
  taxAmount: number
  total: number
}) => {
  const lines = [
    '🛒 *NUEVO PEDIDO - Minisúper El Ventolero*',
    `👤 *Cliente:* ${payload.customerName}`,
    `📱 *Teléfono:* ${payload.customerPhone}`,
    `📧 *Email:* ${payload.customerEmail ?? ''}`,
    '📦 *Productos:*',
    ...payload.items.map(
      (i) => `- ${i.quantity}x ${i.productName} - ${formatCRC(i.unitPrice)}`
    ),
    `💰 *Subtotal (sin IVA):* ${formatCRC(payload.subtotalWithoutTax)}`,
    `💰 *IVA (13%):* ${formatCRC(payload.taxAmount)}`,
    `💰 *TOTAL:* ${formatCRC(payload.total)}`,
    `📝 *Número de orden:* #${payload.orderNumber}`,
  ]
  return encodeURIComponent(lines.join('\n'))
}