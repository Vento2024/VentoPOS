import React, { useState } from 'react'
import { Invoice, InvoiceData } from '../types'
import { generateInvoiceHTML, printInvoice, downloadInvoiceHTML, downloadInvoicePDF } from '../utils/invoice'
import { shareInvoiceWhatsAppWeb } from '../services/whatsappService'

interface InvoiceOptionsProps {
  invoice: Invoice
  onClose?: () => void
  showTitle?: boolean
}

const InvoiceOptions: React.FC<InvoiceOptionsProps> = ({ 
  invoice, 
  onClose, 
  showTitle = true 
}) => {
  const [loading, setLoading] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState(invoice.customerPhone || '')

  const handlePrint = (type: 'invoice' | 'receipt') => {
    setLoading(`print-${type}`)
    
    try {
      const invoiceData: InvoiceData = {
        sale: {
          id: invoice.id,
          invoiceNumber: invoice.number,
          date: new Date(invoice.createdAt).toLocaleDateString('es-CR'),
          time: new Date(invoice.createdAt).toLocaleTimeString('es-CR'),
          cashierName: invoice.cashierName,
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          customerEmail: invoice.customerEmail,
          items: invoice.items,
          subtotalWithoutTax: invoice.subtotal,
          taxAmount: invoice.tax,
          discountAmount: invoice.discount > 0 ? invoice.discount : undefined,
          total: invoice.total,
          paymentDetails: invoice.paymentDetails || {
            method: invoice.paymentMethod,
            receivedAmount: invoice.paymentMethod === 'cash' ? invoice.paymentDetails?.receivedAmount : undefined,
            change: invoice.paymentMethod === 'cash' ? (invoice.paymentDetails?.receivedAmount || 0) - invoice.total : undefined
          },
          status: 'completed' as const,
          notes: undefined
        },
        businessInfo: {
          name: 'Minisúper El Ventolero',
          phone: '(506) 8765-6654',
          email: 'minisuperelventolero@gmail.com',
          address: undefined
        }
      }

      printInvoice(invoiceData)
      setLoading(null)
    } catch (error) {
      console.error('Error al imprimir:', error)
      alert('Error al imprimir la factura')
      setLoading(null)
    }
  }

  const handleDownloadPDF = async (type: 'invoice' | 'receipt') => {
    setLoading(`pdf-${type}`)
    
    try {
      const invoiceData: InvoiceData = {
        sale: {
          id: invoice.id,
          invoiceNumber: invoice.number,
          date: new Date(invoice.createdAt).toLocaleDateString('es-CR'),
          time: new Date(invoice.createdAt).toLocaleTimeString('es-CR'),
          cashierName: invoice.cashierName,
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          customerEmail: invoice.customerEmail,
          items: invoice.items,
          subtotalWithoutTax: invoice.subtotal,
          taxAmount: invoice.tax,
          discountAmount: invoice.discount > 0 ? invoice.discount : undefined,
          total: invoice.total,
          paymentDetails: invoice.paymentDetails || {
            method: invoice.paymentMethod,
            receivedAmount: invoice.paymentMethod === 'cash' ? invoice.paymentDetails?.receivedAmount : undefined,
            change: invoice.paymentMethod === 'cash' ? (invoice.paymentDetails?.receivedAmount || 0) - invoice.total : undefined
          },
          status: 'completed' as const,
          notes: undefined
        },
        businessInfo: {
          name: 'Minisúper El Ventolero',
          phone: '(506) 8765-6654',
          email: 'minisuperelventolero@gmail.com',
          address: undefined
        }
      }

      // Usar la nueva función para generar PDF real
      await downloadInvoicePDF(invoiceData)
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      // Si falla el PDF, usar HTML como respaldo
      try {
        const invoiceData: InvoiceData = {
          sale: {
            id: invoice.id,
            invoiceNumber: invoice.number,
            date: new Date(invoice.createdAt).toLocaleDateString('es-CR'),
            time: new Date(invoice.createdAt).toLocaleTimeString('es-CR'),
            cashierName: invoice.cashierName,
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            customerEmail: invoice.customerEmail,
            items: invoice.items,
            subtotalWithoutTax: invoice.subtotal,
            taxAmount: invoice.tax,
            discountAmount: invoice.discount > 0 ? invoice.discount : undefined,
            total: invoice.total,
            paymentDetails: invoice.paymentDetails || {
              method: invoice.paymentMethod,
              receivedAmount: invoice.paymentMethod === 'cash' ? invoice.paymentDetails?.receivedAmount : undefined,
              change: invoice.paymentMethod === 'cash' ? (invoice.paymentDetails?.receivedAmount || 0) - invoice.total : undefined
            },
            status: 'completed' as const,
            notes: undefined
          },
          businessInfo: {
            name: 'Minisúper El Ventolero',
            phone: '(506) 8765-6654',
            email: 'minisuperelventolero@gmail.com',
            address: undefined
          }
        }
        downloadInvoiceHTML(invoiceData)
        alert('No se pudo generar el PDF. Se descargó como HTML.')
      } catch (htmlError) {
        alert('Error al generar el archivo. Por favor, intenta nuevamente.')
      }
    } finally {
      setLoading(null)
    }
  }

  const handleSendEmail = async (type: 'invoice' | 'receipt') => {
    setLoading(`email-${type}`)
    
    try {
      const invoiceData: InvoiceData = {
        sale: {
          id: invoice.id,
          invoiceNumber: invoice.number,
          date: new Date(invoice.createdAt).toLocaleDateString('es-CR'),
          time: new Date(invoice.createdAt).toLocaleTimeString('es-CR'),
          cashierName: invoice.cashierName,
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          customerEmail: invoice.customerEmail || 'minisuperelventolero@gmail.com',
          items: invoice.items,
          subtotalWithoutTax: invoice.subtotal,
          taxAmount: invoice.tax,
          discountAmount: invoice.discount > 0 ? invoice.discount : undefined,
          total: invoice.total,
          paymentDetails: invoice.paymentDetails || {
            method: invoice.paymentMethod,
            receivedAmount: invoice.paymentMethod === 'cash' ? invoice.paymentDetails?.receivedAmount : undefined,
            change: invoice.paymentMethod === 'cash' ? (invoice.paymentDetails?.receivedAmount || 0) - invoice.total : undefined
          },
          status: 'completed' as const,
          notes: undefined
        },
        businessInfo: {
          name: 'Minisúper El Ventolero',
          phone: '(506) 8765-6654',
          email: 'minisuperelventolero@gmail.com',
          address: undefined
        }
      }

      // Generar el HTML de la factura
      const htmlContent = generateInvoiceHTML(invoiceData)
      
      // Crear un blob con el contenido HTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Crear un enlace temporal para descargar el archivo
      const link = document.createElement('a')
      link.href = url
      link.download = `${type === 'invoice' ? 'Factura' : 'Recibo'}_${invoice.number}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Crear el enlace mailto para abrir Outlook
      const subject = encodeURIComponent(`${type === 'invoice' ? 'Factura' : 'Recibo'} #${invoice.number} - Minisúper El Ventolero`)
      const body = encodeURIComponent(`Estimado/a ${invoice.customerName || 'Cliente'},

Adjunto encontrará su ${type === 'invoice' ? 'factura' : 'recibo'} #${invoice.number}.

Detalles:
- Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-CR')}
- Total: ₡${invoice.total.toLocaleString('es-CR')}

Gracias por su compra.

Saludos cordiales,
Minisúper El Ventolero
Teléfono: (506) 8765-6654`)

      const mailtoLink = `mailto:?subject=${subject}&body=${body}`
      window.open(mailtoLink, '_self')
      
    } catch (error) {
      console.error('Error preparando email:', error)
      alert('Error al preparar el email. Por favor, intenta nuevamente.')
    } finally {
      setLoading(null)
    }
  }

  const handleSendWhatsApp = async (type: 'invoice' | 'receipt') => {
    if (!phoneNumber.trim()) {
      alert('Por favor ingrese un número de teléfono')
      return
    }

    setLoading(`whatsapp-${type}`)
    
    try {
      const invoiceData: InvoiceData = {
        sale: {
          id: invoice.id,
          invoiceNumber: invoice.number,
          date: new Date(invoice.createdAt).toLocaleDateString('es-CR'),
          time: new Date(invoice.createdAt).toLocaleTimeString('es-CR'),
          cashierName: invoice.cashierName,
          customerName: invoice.customerName,
          customerPhone: phoneNumber,
          customerEmail: invoice.customerEmail,
          items: invoice.items,
          subtotalWithoutTax: invoice.subtotal,
          taxAmount: invoice.tax,
          discountAmount: invoice.discount > 0 ? invoice.discount : undefined,
          total: invoice.total,
          paymentDetails: invoice.paymentDetails || {
            method: invoice.paymentMethod,
            receivedAmount: invoice.paymentMethod === 'cash' ? invoice.paymentDetails?.receivedAmount : undefined,
            change: invoice.paymentMethod === 'cash' ? (invoice.paymentDetails?.receivedAmount || 0) - invoice.total : undefined
          },
          status: 'completed' as const,
          notes: undefined
        },
        businessInfo: {
          name: 'Minisúper El Ventolero',
          phone: '(506) 8765-6654',
          email: 'minisuperelventolero@gmail.com',
          address: undefined
        }
      }

      // Generar el HTML de la factura para WhatsApp
      const htmlContent = generateInvoiceHTML(invoiceData)
      
      // Crear un blob con el contenido HTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Crear un enlace temporal para descargar el archivo
      const link = document.createElement('a')
      link.href = url
      link.download = `${type === 'invoice' ? 'Factura' : 'Recibo'}_${invoice.number}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Crear mensaje para WhatsApp
      const message = `Hola ${invoice.customerName || 'estimado cliente'}! 👋

Aquí tienes tu ${type === 'invoice' ? 'factura' : 'recibo'} #${invoice.number} de Minisúper El Ventolero.

📄 *Detalles de la compra:*
📅 Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-CR')}
💰 Total: ₡${invoice.total.toLocaleString('es-CR')}

Gracias por tu compra! 🛒✨

_Minisúper El Ventolero_
📞 (506) 8765-6654`

      // Limpiar el número de teléfono (remover espacios, guiones, etc.)
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      
      // Crear URL de WhatsApp
      const whatsappUrl = `https://wa.me/506${cleanPhone}?text=${encodeURIComponent(message)}`
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank')
      
    } catch (error) {
      console.error('Error enviando WhatsApp:', error)
      alert('Error al preparar el mensaje de WhatsApp. Por favor, intenta nuevamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div 
        style={{ 
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}
      >
      {showTitle && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>Opciones de Factura</h3>
        </div>
      )}
      
      <div style={{ padding: '16px' }}>
        {/* Botones de impresión y PDF - más compactos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => handlePrint('invoice')}
            disabled={loading === 'print-invoice'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading === 'print-invoice' ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading === 'print-invoice' ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading === 'print-invoice' ? (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid white', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
            ) : (
              <>
                🖨️ Factura
              </>
            )}
          </button>

          <button
            onClick={() => handlePrint('receipt')}
            disabled={loading === 'print-receipt'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading === 'print-receipt' ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading === 'print-receipt' ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading === 'print-receipt' ? (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid white', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
            ) : (
              <>
                🧾 Recibo
              </>
            )}
          </button>

          <button
              onClick={() => handleDownloadPDF('invoice')}
              disabled={loading === 'pdf-invoice'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'pdf-invoice' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'pdf-invoice' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'pdf-invoice' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  📄 PDF Factura
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadPDF('receipt')}
              disabled={loading === 'pdf-receipt'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'pdf-receipt' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'pdf-receipt' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'pdf-receipt' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  📋 PDF Recibo
                </>
              )}
            </button>
        </div>

        {/* Sección de Email */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Enviar por Email</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleSendEmail('invoice')}
              disabled={loading === 'email-invoice'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'email-invoice' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'email-invoice' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'email-invoice' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  📧 Factura
                </>
              )}
            </button>

            <button
              onClick={() => handleSendEmail('receipt')}
              disabled={loading === 'email-receipt'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'email-receipt' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'email-receipt' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'email-receipt' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  📧 Recibo
                </>
              )}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Se descargará el archivo y se abrirá tu aplicación de correo
          </p>
        </div>

        {/* Sección de WhatsApp */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Enviar por WhatsApp</span>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="8765-6654"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000000',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleSendWhatsApp('invoice')}
              disabled={loading === 'whatsapp-invoice'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'whatsapp-invoice' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'whatsapp-invoice' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'whatsapp-invoice' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  💬 Factura
                </>
              )}
            </button>

            <button
              onClick={() => handleSendWhatsApp('receipt')}
              disabled={loading === 'whatsapp-receipt'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading === 'whatsapp-receipt' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading === 'whatsapp-receipt' ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading === 'whatsapp-receipt' ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
              ) : (
                <>
                  💬 Recibo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {onClose && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  )
}

 export default InvoiceOptions