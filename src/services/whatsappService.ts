import { InvoiceData } from '../types';
import { generateWhatsAppInvoice } from '../utils/invoice';

export interface WhatsAppConfig {
  businessPhone: string;
  businessName: string;
  includeInvoiceLink: boolean;
  customMessage?: string;
}

// Configuración por defecto
const defaultWhatsAppConfig: WhatsAppConfig = {
  businessPhone: '50687656654', // Número del negocio
  businessName: 'Minisúper El Ventolero',
  includeInvoiceLink: true
};

// Función para limpiar número de teléfono
export const cleanPhoneNumber = (phone: string): string => {
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Si el número empieza con 506, mantenerlo
  if (cleaned.startsWith('506')) {
    return cleaned;
  }
  
  // Si el número tiene 8 dígitos, agregar código de país de Costa Rica
  if (cleaned.length === 8) {
    return `506${cleaned}`;
  }
  
  // Si el número empieza con 0, removerlo y agregar código de país
  if (cleaned.startsWith('0') && cleaned.length === 9) {
    return `506${cleaned.substring(1)}`;
  }
  
  return cleaned;
};

// Función para validar número de teléfono costarricense
export const validateCostaRicanPhone = (phone: string): boolean => {
  const cleaned = cleanPhoneNumber(phone);
  
  // Debe tener 11 dígitos (506 + 8 dígitos)
  if (cleaned.length !== 11) return false;
  
  // Debe empezar con 506
  if (!cleaned.startsWith('506')) return false;
  
  // Los siguientes dígitos deben ser válidos para Costa Rica
  const localNumber = cleaned.substring(3);
  
  // Números de celular: 6, 7, 8
  // Números fijos: 2
  const validPrefixes = ['2', '6', '7', '8'];
  
  return validPrefixes.some(prefix => localNumber.startsWith(prefix));
};

// Función para generar mensaje de WhatsApp personalizado
export const generateCustomWhatsAppMessage = (
  data: InvoiceData, 
  config: WhatsAppConfig = defaultWhatsAppConfig
): string => {
  const { sale, customer, business } = data;
  
  const baseMessage = generateWhatsAppInvoice(sale);
  
  let customMessage = baseMessage;
  
  // Agregar mensaje personalizado si existe
  if (config.customMessage) {
    customMessage = `${config.customMessage}\n\n${baseMessage}`;
  }
  
  // Agregar link de descarga si está habilitado
  if (config.includeInvoiceLink) {
    const invoiceLink = generateInvoiceDownloadLink(data);
    customMessage += `\n\n📄 *Descargar factura:*\n${invoiceLink}`;
  }
  
  // Agregar información de contacto del negocio
  customMessage += `\n\n📞 *Contacto:*\n${business.phone}`;
  
  // Agregar mensaje de seguimiento
  customMessage += `\n\n💬 *¿Necesita ayuda?*\nResponda a este mensaje y le atenderemos con gusto.`;
  
  return customMessage;
};

// Función para generar link de descarga de factura (simulado)
export const generateInvoiceDownloadLink = (data: InvoiceData): string => {
  // En producción, esto generaría un link real al servidor
  const baseUrl = window.location.origin;
  return `${baseUrl}/invoice/${data.sale.saleNumber}`;
};

// Función para abrir WhatsApp con número específico
export const openWhatsAppWithNumber = (
  data: InvoiceData, 
  phoneNumber: string,
  config: WhatsAppConfig = defaultWhatsAppConfig
): boolean => {
  try {
    const cleanedPhone = cleanPhoneNumber(phoneNumber);
    
    if (!validateCostaRicanPhone(cleanedPhone)) {
      throw new Error('Número de teléfono inválido');
    }
    
    const message = generateCustomWhatsAppMessage(data, config);
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    return true;
    
  } catch (error) {
    console.error('Error abriendo WhatsApp:', error);
    return false;
  }
};

// Función para abrir WhatsApp sin número específico
export const openWhatsAppGeneral = (
  data: InvoiceData,
  config: WhatsAppConfig = defaultWhatsAppConfig
): void => {
  const message = generateCustomWhatsAppMessage(data, config);
  const encodedMessage = encodeURIComponent(message);
  
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};

// Función para compartir factura por WhatsApp Web
export const shareInvoiceWhatsAppWeb = (
  data: InvoiceData,
  phoneNumber?: string,
  config: WhatsAppConfig = defaultWhatsAppConfig
): { success: boolean; message: string; whatsappUrl?: string } => {
  try {
    const message = generateWhatsAppInvoice(data);
    const encodedMessage = encodeURIComponent(message);
    
    let whatsappUrl: string;
    
    if (phoneNumber) {
      const cleanedPhone = cleanPhoneNumber(phoneNumber);
      
      if (!validateCostaRicanPhone(cleanedPhone)) {
        return {
          success: false,
          message: 'Número de teléfono inválido. Debe ser un número costarricense válido.'
        };
      }
      
      whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }
    
    return {
      success: true,
      message: 'Mensaje preparado para WhatsApp',
      whatsappUrl
    };
  } catch (error) {
    console.error('Error compartiendo por WhatsApp:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para generar mensaje de seguimiento post-venta
export const generateFollowUpMessage = (customerName: string, saleNumber: string): string => {
  return `👋 Hola ${customerName}!

Esperamos que esté disfrutando de su compra (Factura #${saleNumber}).

🌟 *Su opinión es importante para nosotros*
¿Cómo fue su experiencia de compra?

📝 *¿Necesita algo más?*
Estamos aquí para ayudarle con cualquier consulta.

¡Gracias por elegir Minisúper El Ventolero! 🛒`;
};

// Función para enviar mensaje de seguimiento
export const sendFollowUpMessage = (
  customerPhone: string,
  customerName: string,
  saleNumber: string
): boolean => {
  try {
    const cleanedPhone = cleanPhoneNumber(customerPhone);
    
    if (!validateCostaRicanPhone(cleanedPhone)) {
      throw new Error('Número de teléfono inválido');
    }
    
    const message = generateFollowUpMessage(customerName, saleNumber);
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    return true;
    
  } catch (error) {
    console.error('Error enviando mensaje de seguimiento:', error);
    return false;
  }
};

// Hook personalizado para usar el servicio de WhatsApp
export const useWhatsAppService = (config: WhatsAppConfig = defaultWhatsAppConfig) => {
  const sendInvoice = (data: InvoiceData, phoneNumber?: string) => {
    return shareInvoiceWhatsAppWeb(data, phoneNumber, config);
  };

  const sendFollowUp = (customerPhone: string, customerName: string, saleNumber: string) => {
    return sendFollowUpMessage(customerPhone, customerName, saleNumber);
  };

  const validatePhone = (phone: string) => {
    return validateCostaRicanPhone(phone);
  };

  const cleanPhone = (phone: string) => {
    return cleanPhoneNumber(phone);
  };

  return {
    sendInvoice,
    sendFollowUp,
    validatePhone,
    cleanPhone,
    generateMessage: (data: InvoiceData) => generateCustomWhatsAppMessage(data, config)
  };
};