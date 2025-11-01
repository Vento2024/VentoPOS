import { InvoiceData } from '../types';
import { generateInvoiceHTML } from '../utils/invoice';

// Declarar EmailJS global (viene del CDN)
declare global {
  interface Window {
    emailjs: {
      init: (publicKey: string) => void;
      send: (serviceId: string, templateId: string, templateParams: any) => Promise<any>;
    };
  }
}

// Configuración EmailJS - ¡CONFIGURADO Y LISTO!
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'Le0VqDyb8AWpdkfzm',     // ✅ Public Key configurado
  SERVICE_ID: 'service_mokcrhb',       // ✅ Gmail service configurado
  TEMPLATE_ID: 'template_7mpl65j'      // ✅ Order Confirmation template
};

// Inicializar EmailJS con retry
export const initEmailJS = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const tryInit = () => {
      if (typeof window !== 'undefined' && window.emailjs) {
        try {
          window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
          console.log('✅ EmailJS inicializado correctamente');
          resolve(true);
        } catch (error) {
          console.error('❌ Error al inicializar EmailJS:', error);
          resolve(false);
        }
      } else {
        // Retry after a short delay
        setTimeout(tryInit, 100);
      }
    };
    
    tryInit();
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (typeof window === 'undefined' || !window.emailjs) {
        console.error('❌ EmailJS no está disponible después de 5 segundos. Verifica que el CDN esté cargado.');
        resolve(false);
      }
    }, 5000);
  });
};

// Función para enviar email real usando EmailJS
export const sendRealInvoiceEmail = async (data: InvoiceData, testEmail?: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    console.log('🔍 Iniciando proceso de envío de email...');
    
    // Verificar que EmailJS esté disponible con retry
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      if (typeof window !== 'undefined' && window.emailjs) {
        break;
      }
      
      console.log(`⏳ Esperando EmailJS... intento ${retries + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
    
    if (typeof window === 'undefined' || !window.emailjs) {
      console.error('❌ EmailJS no está disponible después de reintentos');
      throw new Error('EmailJS no está cargado. Verifica la conexión a internet y recarga la página.');
    }

    console.log('✅ EmailJS está disponible');

    const targetEmail = testEmail || data.sale.customerEmail;
    
    if (!targetEmail) {
      throw new Error('No se ha especificado email de destino');
    }

    console.log('📧 Email de destino:', targetEmail);

    // Asegurar que EmailJS esté inicializado
    try {
      console.log('🔧 Inicializando EmailJS...');
      window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('✅ EmailJS inicializado correctamente');
    } catch (initError) {
      console.error('❌ Error al inicializar EmailJS:', initError);
      throw new Error('Error al inicializar EmailJS');
    }

    // Preparar datos simples para el template
    const templateParams = {
      to_email: targetEmail,
      to_name: data.sale.customerName || 'Cliente',
      from_name: 'Minisúper El Ventolero',
      message: `Factura ${data.sale.invoiceNumber} por un total de ₡${data.sale.total.toLocaleString()}`,
      invoice_number: data.sale.invoiceNumber,
      total_amount: `₡${data.sale.total.toLocaleString()}`
    };

    console.log('📋 Parámetros del template:', templateParams);
    console.log('🚀 Enviando con:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID
    });

    // Enviar email usando EmailJS con timeout
    const sendPromise = window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );

    // Agregar timeout de 30 segundos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: El envío de email tardó demasiado')), 30000);
    });

    const response = await Promise.race([sendPromise, timeoutPromise]);

    console.log('✅ Email enviado exitosamente:', response);

    return {
      success: true,
      message: `✅ Factura enviada exitosamente a ${targetEmail}`
    };

  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error text:', error.text);
    console.error('❌ Error status:', error.status);
    
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error.text) {
      errorMessage = `EmailJS Error: ${error.text}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: 'Error al enviar el email',
      error: errorMessage
    };
  }
};

// Función para verificar configuración
export const checkEmailJSConfig = (): {
  isConfigured: boolean;
  missingFields: string[];
  message: string;
} => {
  const missingFields: string[] = [];
  
  if (EMAILJS_CONFIG.PUBLIC_KEY === 'TU_PUBLIC_KEY_AQUI') {
    missingFields.push('PUBLIC_KEY');
  }
  if (EMAILJS_CONFIG.SERVICE_ID === 'TU_SERVICE_ID_AQUI') {
    missingFields.push('SERVICE_ID');
  }
  if (EMAILJS_CONFIG.TEMPLATE_ID === 'TU_TEMPLATE_ID_AQUI') {
    missingFields.push('TEMPLATE_ID');
  }

  const isConfigured = missingFields.length === 0;
  
  return {
    isConfigured,
    missingFields,
    message: isConfigured 
      ? '✅ EmailJS configurado correctamente'
      : `❌ Faltan configurar: ${missingFields.join(', ')}`
  };
};

// Función para obtener instrucciones de configuración
export const getEmailJSInstructions = (): string => {
  return `
🔧 INSTRUCCIONES PARA CONFIGURAR EMAILJS:

1. Ve a https://www.emailjs.com y crea una cuenta GRATIS
2. Crea un nuevo servicio (Gmail)
3. Crea un template de email
4. Copia los siguientes valores:
   - Public Key (Account > API Keys)
   - Service ID (Email Services)
   - Template ID (Email Templates)

5. Actualiza el archivo: src/services/emailjsService.ts
   - Reemplaza 'TU_PUBLIC_KEY_AQUI' con tu Public Key
   - Reemplaza 'TU_SERVICE_ID_AQUI' con tu Service ID  
   - Reemplaza 'TU_TEMPLATE_ID_AQUI' con tu Template ID

¡Es súper fácil y gratis hasta 200 emails/mes!
  `;
};

export default {
  initEmailJS,
  sendRealInvoiceEmail,
  checkEmailJSConfig,
  getEmailJSInstructions
};