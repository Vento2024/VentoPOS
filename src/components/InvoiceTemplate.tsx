import React from 'react'
import { Invoice, CartItem } from '../types'

interface InvoiceTemplateProps {
  invoice: Invoice
  type: 'invoice' | 'receipt'
  className?: string
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, type, className = '' }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isReceipt = type === 'receipt'

  return (
    <div className={`invoice-template ${className}`} style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: isReceipt ? '300px' : '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black',
      fontSize: isReceipt ? '12px' : '14px',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #333',
        paddingBottom: '15px'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: isReceipt ? '16px' : '24px',
          fontWeight: 'bold'
        }}>
          Minisúper El Ventolero
        </h1>
        <p style={{ margin: '5px 0', fontSize: isReceipt ? '10px' : '12px' }}>
          Teléfono: (506) 8765-6654<br />
          Email: info@elventolero.com
        </p>
        <h2 style={{
          margin: '10px 0 0 0',
          fontSize: isReceipt ? '14px' : '18px',
          fontWeight: 'bold'
        }}>
          {isReceipt ? 'RECIBO' : 'FACTURA'}
        </h2>
      </div>

      {/* Invoice Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexDirection: isReceipt ? 'column' : 'row'
      }}>
        <div>
          <p style={{ margin: '5px 0' }}>
            <strong>Número:</strong> {invoice.number}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Fecha:</strong> {formatDate(invoice.createdAt)}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Cajero:</strong> {invoice.cashierName}
          </p>
        </div>
        {invoice.customerName && (
          <div style={{ marginTop: isReceipt ? '10px' : '0' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Cliente:</strong> {invoice.customerName}
            </p>
            {invoice.customerPhone && (
              <p style={{ margin: '5px 0' }}>
                <strong>Teléfono:</strong> {invoice.customerPhone}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: isReceipt ? '10px' : '12px'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '8px 4px' }}>Producto</th>
              <th style={{ textAlign: 'center', padding: '8px 4px' }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '8px 4px' }}>Precio</th>
              <th style={{ textAlign: 'right', padding: '8px 4px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: CartItem, index: number) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 4px' }}>
                  {item.name}
                  {item.weight && (
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      Peso: {item.weight}kg
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 4px' }}>
                  {formatCurrency(item.price)}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 4px' }}>
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{
        borderTop: '2px solid #333',
        paddingTop: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '5px 0'
        }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        
        {invoice.discount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: '5px 0',
            color: '#d32f2f'
          }}>
            <span>Descuento:</span>
            <span>-{formatCurrency(invoice.discount)}</span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '5px 0'
        }}>
          <span>IVA (13%):</span>
          <span>{formatCurrency(invoice.tax)}</span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '10px 0',
          fontSize: isReceipt ? '14px' : '16px',
          fontWeight: 'bold',
          borderTop: '1px solid #333',
          paddingTop: '10px'
        }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '5px 0' }}>
          <strong>Método de Pago:</strong> {
            invoice.paymentMethod === 'cash' ? 'Efectivo' :
            invoice.paymentMethod === 'card' ? 'Tarjeta' :
            invoice.paymentMethod === 'transfer' ? 'Transferencia' :
            invoice.paymentMethod === 'credit' ? 'Crédito' : 'Otro'
          }
        </p>
        
        {invoice.paymentMethod === 'cash' && invoice.paymentDetails?.receivedAmount && (
          <>
            <p style={{ margin: '5px 0' }}>
              <strong>Recibido:</strong> {formatCurrency(invoice.paymentDetails.receivedAmount)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Cambio:</strong> {formatCurrency(invoice.paymentDetails.receivedAmount - invoice.total)}
            </p>
          </>
        )}
        
        {invoice.isCredit && invoice.creditDueDate && (
          <p style={{ margin: '5px 0', color: '#d32f2f' }}>
            <strong>Vencimiento Crédito:</strong> {formatDate(invoice.creditDueDate)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        borderTop: '1px solid #333',
        paddingTop: '15px',
        fontSize: isReceipt ? '10px' : '12px',
        color: '#666'
      }}>
        <p style={{ margin: '5px 0' }}>
          ¡Gracias por su compra!
        </p>
        <p style={{ margin: '5px 0' }}>
          Conserve este {isReceipt ? 'recibo' : 'comprobante'} para cualquier reclamo
        </p>
        {!isReceipt && (
          <p style={{ margin: '10px 0 0 0', fontSize: '10px' }}>
            Factura generada electrónicamente - {formatDate(new Date().toISOString())}
          </p>
        )}
      </div>
    </div>
  )
}

export default InvoiceTemplate