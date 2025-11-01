import { useState, useEffect } from 'react';
import { logoService } from '../services/logoService';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>(logoService.getCurrentLogoUrl());
  const [isCustomLogo, setIsCustomLogo] = useState<boolean>(logoService.hasCustomLogo());

  useEffect(() => {
    // Función para actualizar el estado del logo
    const updateLogo = () => {
      setLogoUrl(logoService.getCurrentLogoUrl());
      setIsCustomLogo(logoService.hasCustomLogo());
    };

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'business_logo') {
        updateLogo();
      }
    };

    // Escuchar eventos personalizados para cambios de logo
    const handleLogoChange = () => {
      updateLogo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logoChanged', handleLogoChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logoChanged', handleLogoChange);
    };
  }, []);

  // Función para notificar cambios de logo
  const notifyLogoChange = () => {
    window.dispatchEvent(new CustomEvent('logoChanged'));
  };

  return {
    logoUrl,
    isCustomLogo,
    refreshLogo: () => {
      setLogoUrl(logoService.getCurrentLogoUrl());
      setIsCustomLogo(logoService.hasCustomLogo());
    },
    notifyLogoChange
  };
};