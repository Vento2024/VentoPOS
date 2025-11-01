import { InvoiceData, Sale } from '../types';
import { formatCRC } from './format';
import { logoService } from '../services/logoService';

export const generateInvoiceHTML = (data: InvoiceData, logoUrl?: string): string => {
  const { sale, customer, businessInfo } = data;
  const defaultLogoUrl = '/logo-minisuperelventolero.svg';
  const currentLogoUrl = logoUrl || defaultLogoUrl;

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(date + ' ' + time)
    return dateObj.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPaymentMethodText = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      sinpe: 'SINPE Móvil',
      credit: 'Crédito',
      mixed: 'Mixto'
    }
    return methods[method as keyof typeof methods] || method
  }

  const renderPaymentDetails = () => {
    const { paymentDetails } = sale
    let details = ''

    if (paymentDetails.method === 'cash') {
      details = `
        Recibido: ${formatCRC(paymentDetails.receivedAmount || 0)}
        Cambio: ${formatCRC(paymentDetails.changeAmount || 0)}
      `
    } else if (paymentDetails.method === 'credit' && paymentDetails.creditDueDate) {
      const dueDate = new Date(paymentDetails.creditDueDate).toLocaleDateString('es-CR')
      details = `Vencimiento: ${dueDate}`
    } else if (paymentDetails.method === 'mixed') {
      const mixedDetails = []
      if (paymentDetails.cashAmount) mixedDetails.push(`Efectivo: ${formatCRC(paymentDetails.cashAmount)}`)
      if (paymentDetails.cardAmount) mixedDetails.push(`Tarjeta: ${formatCRC(paymentDetails.cardAmount)}`)
      if (paymentDetails.sinpeAmount) mixedDetails.push(`SINPE: ${formatCRC(paymentDetails.sinpeAmount)}`)
      if (paymentDetails.creditAmount) mixedDetails.push(`Crédito: ${formatCRC(paymentDetails.creditAmount)}`)
      details = mixedDetails.join('\n  ')
    }

    return details
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${sale.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            margin: 0;
            padding: 15px;
            background: white;
            color: #333;
        }
        .invoice {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .company-info {
            flex: 1;
        }
        .company-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
            color: #2c5530;
        }
        .company-details {
            font-size: 10px;
            line-height: 1.4;
            color: #666;
        }
        .logo {
             width: 60px;
             height: 60px;
             margin-left: 15px;
         }
         .logo img {
             width: 100%;
             height: 100%;
             object-fit: contain;
         }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .client-info {
            flex: 1;
        }
        .invoice-info {
            text-align: right;
            min-width: 120px;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .products-section {
            margin: 20px 0;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .products-table th {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 8px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
        }
        .products-table td {
            border: 1px solid #ddd;
            padding: 6px 4px;
            text-align: center;
            font-size: 10px;
        }
        .product-name {
            text-align: left !important;
            max-width: 120px;
        }
        .text-right {
            text-align: right !important;
        }
        .totals-section {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .totals-table {
            width: 100%;
            margin-left: auto;
            max-width: 200px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 11px;
        }
        .total-final {
            font-weight: bold;
            font-size: 13px;
            border-top: 1px solid #333;
            padding-top: 5px;
            margin-top: 8px;
        }
        .payment-section {
            margin: 20px 0;
            padding: 10px;
            background: #f9f9f9;
            border: 1px solid #ddd;
        }
        .payment-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .invoice { 
                max-width: none; 
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header con logo y info de empresa -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">FACTURA</div>
                <div class="company-name">${businessInfo.name}</div>
                <div class="company-details">
                    Monte Los Olivos<br>
                    50808 Tilarán<br>
                    CIF/NIF: 206570600<br>
                    Teléfono: ${businessInfo.phone}<br>
                    Email: minisuperelventolero@gmail.com
                </div>
            </div>
            <div class="logo">
                 <img src="${currentLogoUrl}" alt="Minisúper El Ventolero" />
             </div>
        </div>

        <!-- Información del cliente y factura -->
        <div class="invoice-details">
            <div class="client-info">
                <div><span class="info-label">Cliente:</span></div>
                <div>${sale.customerName || 'Unknown'}</div>
            </div>
            <div class="invoice-info">
                <div><span class="info-label">Factura N°:</span> ${sale.invoiceNumber}</div>
                <div><span class="info-label">Fecha:</span> ${formatDate(sale.date, sale.time)}</div>
                <div><span class="info-label">Vencimiento:</span> ${formatDate(sale.date, sale.time)}</div>
                <div><span class="info-label">Estado del pago:</span> Pagado</div>
            </div>
        </div>

        <!-- Tabla de productos -->
        <div class="products-section">
            <table class="products-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Descripción de artículo</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Impuesto</th>
                        <th>Descuento</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="product-name">${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td class="text-right">${formatCRC(item.unitPrice)}</td>
                            <td class="text-right">13%</td>
                            <td class="text-right">0,00%</td>
                            <td class="text-right">${formatCRC(item.totalPrice)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Totales -->
        <div class="totals-section">
            <div class="totals-table">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span>₡ ${sale.subtotalWithoutTax.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span>IVA Reducido</span>
                    <span>₡${sale.taxAmount.toLocaleString()}</span>
                </div>
                <div class="total-row total-final">
                    <span>Total</span>
                    <span>₡ ${sale.total.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <!-- Información de pago -->
        <div class="payment-section">
            <div class="payment-title">Método de pago:</div>
            <div><strong>${getPaymentMethodText(sale.paymentDetails.method)}</strong></div>
            <div class="total-row">
                <span>Cantidad pagada:</span>
                <span>₡ ${sale.total.toLocaleString()}</span>
            </div>
            <div class="total-row">
                <span>Cantidad adeudada:</span>
                <span>₡ 0,00</span>
            </div>
            ${renderPaymentDetails() ? `<div style="margin-top: 8px; font-size: 10px; white-space: pre-line;">${renderPaymentDetails()}</div>` : ''}
        </div>
    </div>
</body>
</html>
  `.trim()
}

export const printInvoice = (data: InvoiceData) => {
  const logoUrl = logoService.getCurrentLogoUrl()
  const invoiceHTML = generateInvoiceHTML(data, logoUrl)
  const printWindow = window.open('', '_blank')
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

export const downloadInvoiceHTML = (data: InvoiceData) => {
  const logoUrl = logoService.getCurrentLogoUrl()
  const invoiceHTML = generateInvoiceHTML(data, logoUrl)
  const blob = new Blob([invoiceHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `factura-${data.sale.invoiceNumber}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export const downloadInvoicePDF = async (data: InvoiceData): Promise<void> => {
  try {
    // Importar html2pdf dinámicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    const logoUrl = logoService.getCurrentLogoUrl()
    const invoiceHTML = generateInvoiceHTML(data, logoUrl);
    
    // Crear un elemento temporal para el HTML
    const element = document.createElement('div');
    element.innerHTML = invoiceHTML;
    element.style.width = '210mm'; // A4 width
    element.style.minHeight = '297mm'; // A4 height
    
    // Configuración para html2pdf
    const options = {
      margin: [10, 10, 10, 10],
      filename: `factura-${data.sale.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Generar y descargar el PDF
    await html2pdf().set(options).from(element).save();
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('No se pudo generar el PDF. Descargando como HTML...');
  }
}

export const generateInvoiceText = (data: InvoiceData): string => {
  const { sale, businessInfo } = data;
  
  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(date + ' ' + time)
    return dateObj.toLocaleString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodText = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      sinpe: 'SINPE',
      credit: 'Crédito',
      mixed: 'Mixto'
    }
    return methods[method as keyof typeof methods] || method
  }

  const renderPaymentDetails = () => {
    const { paymentDetails } = sale
    let details = ''

    if (paymentDetails.method === 'cash') {
      details = `
  Recibido: ${formatCRC(paymentDetails.receivedAmount || 0)}
  Cambio: ${formatCRC(paymentDetails.changeAmount || 0)}`
    } else if (paymentDetails.method === 'credit' && paymentDetails.creditDueDate) {
      const dueDate = new Date(paymentDetails.creditDueDate).toLocaleDateString('es-CR')
      details = `
  Vencimiento: ${dueDate}`
    } else if (paymentDetails.method === 'mixed') {
      const mixedDetails = []
      if (paymentDetails.cashAmount) mixedDetails.push(`  Efectivo: ${formatCRC(paymentDetails.cashAmount)}`)
      if (paymentDetails.cardAmount) mixedDetails.push(`  Tarjeta: ${formatCRC(paymentDetails.cardAmount)}`)
      if (paymentDetails.sinpeAmount) mixedDetails.push(`  SINPE: ${formatCRC(paymentDetails.sinpeAmount)}`)
      if (paymentDetails.creditAmount) mixedDetails.push(`  Crédito: ${formatCRC(paymentDetails.creditAmount)}`)
      details = '\n' + mixedDetails.join('\n')
    }

    return details
  }

  const productLines = sale.items.map(item => {
    const qty = `[${item.quantity}]`.padEnd(5)
    const name = item.productName.padEnd(20)
    const unitPrice = formatCRC(item.unitPrice).padStart(8)
    const total = formatCRC(item.totalPrice).padStart(8)
    return `${qty} ${name} ${unitPrice} ${total}`
  }).join('\n')

  return `
========================================
    ${businessInfo.name}
    Teléfono: ${businessInfo.phone}
========================================
Factura: #${sale.invoiceNumber}
Fecha: ${formatDate(sale.date, sale.time)}
Cajero: ${sale.cashierName}${sale.customerName ? `
Cliente: ${sale.customerName}` : ''}${sale.customerPhone ? `
Teléfono: ${sale.customerPhone}` : ''}${sale.customerEmail ? `
Email: ${sale.customerEmail}` : ''}
----------------------------------------
PRODUCTOS
----------------------------------------
Cant  Producto           P.Unit    Total
${productLines}
----------------------------------------
Subtotal (sin IVA):        ${formatCRC(sale.subtotalWithoutTax)}
IVA (13%):                 ${formatCRC(sale.taxAmount)}${sale.discountAmount ? `
Descuento:                -${formatCRC(sale.discountAmount)}` : ''}
----------------------------------------
TOTAL:                     ${formatCRC(sale.total)}
Método de pago: ${getPaymentMethodText(sale.paymentDetails.method)}${renderPaymentDetails()}
========================================
¡Gracias por su compra!
========================================
  `.trim()
}

export const generateWhatsAppInvoice = (data: InvoiceData): string => {
  const invoiceText = generateInvoiceText(data)
  return encodeURIComponent(`🧾 *FACTURA - ${data.businessInfo.name}*\n\n\`\`\`\n${invoiceText}\n\`\`\``)
}

export const generateEmailInvoice = (data: InvoiceData) => {
  const { sale, businessInfo } = data;
  const subject = `Factura ${sale.invoiceNumber} - ${businessInfo.name}`
  const logoUrl = logoService.getCurrentLogoUrl()
  const body = `
Estimado/a ${sale.customerName || 'Cliente'},

Adjunto encontrará su factura de compra:

${generateInvoiceText(data)}

Gracias por su preferencia.

Atentamente,
${businessInfo.name}
${businessInfo.phone}
  `.trim()

  return {
    subject: encodeURIComponent(subject),
    body: encodeURIComponent(body),
    html: generateInvoiceHTML(data, logoUrl)
  }
}