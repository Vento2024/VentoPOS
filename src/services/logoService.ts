export interface LogoData {
  url: string;
  fileName: string;
  uploadDate: string;
}

class LogoService {
  private readonly LOGO_KEY = 'business_logo';
  private readonly DEFAULT_LOGO = '/logo-minisuperelventolero.svg';

  /**
   * Sube un archivo de logo y lo almacena localmente
   */
  async uploadLogo(file: File): Promise<LogoData> {
    return new Promise((resolve, reject) => {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, SVG, WEBP'));
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error('El archivo es demasiado grande. Máximo 5MB'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const logoData: LogoData = {
            url: result,
            fileName: file.name,
            uploadDate: new Date().toISOString()
          };

          // Guardar en localStorage
          localStorage.setItem(this.LOGO_KEY, JSON.stringify(logoData));
          resolve(logoData);
        } catch (error) {
          reject(new Error('Error al procesar el archivo'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Obtiene el logo actual (subido o por defecto)
   */
  getCurrentLogo(): LogoData | null {
    try {
      const stored = localStorage.getItem(this.LOGO_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener el logo:', error);
      return null;
    }
  }

  /**
   * Obtiene la URL del logo actual
   */
  getCurrentLogoUrl(): string {
    const logoData = this.getCurrentLogo();
    return logoData ? logoData.url : this.DEFAULT_LOGO;
  }

  /**
   * Elimina el logo personalizado y vuelve al por defecto
   */
  removeLogo(): void {
    localStorage.removeItem(this.LOGO_KEY);
  }

  /**
   * Verifica si hay un logo personalizado
   */
  hasCustomLogo(): boolean {
    return this.getCurrentLogo() !== null;
  }

  /**
   * Obtiene información del logo actual
   */
  getLogoInfo(): { isCustom: boolean; fileName?: string; uploadDate?: string } {
    const logoData = this.getCurrentLogo();
    if (logoData) {
      return {
        isCustom: true,
        fileName: logoData.fileName,
        uploadDate: logoData.uploadDate
      };
    }
    return { isCustom: false };
  }
}

export const logoService = new LogoService();