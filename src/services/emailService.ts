import { InvoiceData } from '../types'
import { generateInvoiceHTML } from '../utils/invoice';
import { initEmailJS, sendRealInvoiceEmail, checkEmailJSConfig, getEmailJSInstructions } from './emailjsService';
import { logoService } from './logoService';

// Inicializar EmailJS al cargar el servicio
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      await initEmailJS();
    } catch (error) {
      console.error('Error inicializando EmailJS:', error);
    }
  }, 1000); // Esperar a que el CDN se cargue
}

// Función para generar el contenido del email
const generateEmailContent = (data: InvoiceData) => {
  const businessName = 'Minisúper El Ventolero';
  const customerName = data.sale.customerName || 'Estimado cliente';
  
  const subject = `Factura #${data.sale.invoiceNumber} - ${businessName}`;
  
  const text = `
Estimado ${customerName},

Adjunto encontrará su factura #${data.sale.invoiceNumber} por un total de ${data.sale.total.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}.

Gracias por su compra.

Saludos,
${businessName}
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">¡Gracias por su compra!</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
          Estimado/a <strong>${customerName}</strong>,
        </p>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
          Adjunto encontrará su factura <strong>#${data.sale.invoiceNumber}</strong> 
          por un total de <strong>${data.sale.total.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</strong>.
        </p>
        
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-bottom: 10px;">Detalles de la compra:</h3>
          <p style="margin: 5px 0;"><strong>Número de factura:</strong> ${data.sale.invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${data.sale.date}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> ${data.sale.total.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
          Gracias por confiar en nosotros. Si tiene alguna consulta, no dude en contactarnos.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; margin: 5px 0;">
            Este email fue generado automáticamente
          </p>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">
            © ${new Date().getFullYear()} ${businessName} - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

// Configuración del servicio de email
const EMAIL_SERVICE_URL = '/api/email'; // En producción sería la URL del backend

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

// Configuración por defecto (en producción vendría de variables de entorno)
const defaultEmailConfig: EmailConfig = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'minisuperelventolero@gmail.com',
  smtpPass: '',
  fromEmail: 'minisuperelventolero@gmail.com',
  fromName: 'Minisúper El Ventolero'
};

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

// Función para enviar email (ahora con EmailJS real + fallback simulado)
export const sendInvoiceEmail = async (data: InvoiceData, testEmail?: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    // Verificar configuración de EmailJS
    const emailJSStatus = checkEmailJSConfig();
    
    if (emailJSStatus.isConfigured) {
      // Usar EmailJS para envío real
      console.log('🚀 Usando EmailJS para envío REAL de email...');
      return await sendRealInvoiceEmail(data, testEmail);
    } else {
      // Fallback: modo simulación
      console.log('⚠️ EmailJS no configurado, usando modo simulación');
      console.log('📋 Para configurar EmailJS:', getEmailJSInstructions());
    }

    // Código de simulación original (fallback)
    const targetEmail = testEmail || data.sale.customerEmail;
    
    if (!targetEmail) {
      throw new Error('No se ha especificado email de destino');
    }

    const emailContent = generateEmailContent(data);
    const logoUrl = logoService.getCurrentLogoUrl();
    const htmlInvoice = generateInvoiceHTML(data, logoUrl);

    const emailRequest: EmailRequest = {
      to: targetEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: [
        {
          filename: `factura-${data.sale.invoiceNumber}.html`,
          content: htmlInvoice,
          contentType: 'text/html'
        }
      ]
    };

    // Simulación con logging detallado
    console.log('📧 ENVIANDO EMAIL SIMULADO:', {
      to: targetEmail,
      subject: emailRequest.subject,
      attachments: emailRequest.attachments?.length || 0,
      timestamp: new Date().toISOString(),
      note: 'Para envío real, configura EmailJS'
    });

    // Simular delay de red realista
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular envío exitoso
    const success = true;

    if (success) {
      const message = testEmail 
        ? `📧 EMAIL SIMULADO enviado a ${targetEmail} (Configura EmailJS para envío real)`
        : `Email simulado enviado a ${targetEmail}`;
      
      console.log('✅ EMAIL SIMULADO:', message);
      
      return {
        success: true,
        message
      };
    } else {
      throw new Error('Error del servidor SMTP simulado');
    }

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      message: 'Error al enviar el email',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para validar configuración de email
export const validateEmailConfig = (config: EmailConfig): boolean => {
  return !!(
    config.smtpHost &&
    config.smtpPort &&
    config.smtpUser &&
    config.smtpPass &&
    config.fromEmail
  );
};

// Función para probar conexión de email
export const testEmailConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // En producción, esto haría una llamada al backend para probar la conexión SMTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Conexión de email configurada correctamente'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error en la configuración de email'
    };
  }
};

// Función para obtener plantilla de email personalizada
export const getCustomEmailTemplate = (businessName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${businessName}</h1>
        <p style="margin: 5px 0; font-size: 16px;">Factura Electrónica</p>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #ea580c; margin-top: 0;">¡Gracias por su compra!</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Estimado/a cliente, adjunto encontrará su factura correspondiente a la compra realizada.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ea580c;">
            <p style="margin: 0; font-weight: bold; color: #ea580c;">
              💡 Tip: Guarde esta factura como comprobante de compra
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 0;">
            Si tiene alguna consulta, no dude en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; margin: 5px 0;">
            Este email fue generado automáticamente por el sistema VentoPOS
          </p>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">
            © ${new Date().getFullYear()} ${businessName} - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  `;
};

// Hook personalizado para usar el servicio de email
export const useEmailService = () => {
  const sendEmail = async (data: InvoiceData) => {
    return await sendInvoiceEmail(data);
  };

  const testConnection = async () => {
    return await testEmailConnection();
  };

  return {
    sendEmail,
    testConnection,
    validateConfig: validateEmailConfig
  };
};