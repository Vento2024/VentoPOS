import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image, Check, AlertCircle } from 'lucide-react';
import { logoService, LogoData } from '../services/logoService';

interface LogoUploadProps {
  onLogoChange?: (logoUrl: string) => void;
  className?: string;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, className = '' }) => {
  const [currentLogo, setCurrentLogo] = useState<LogoData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cargar logo actual al montar el componente
    const logo = logoService.getCurrentLogo();
    setCurrentLogo(logo);
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setMessage(null);

    try {
      const logoData = await logoService.uploadLogo(file);
      setCurrentLogo(logoData);
      onLogoChange?.(logoData.url);
      showMessage('success', 'Logo subido exitosamente');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error al subir el logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveLogo = () => {
    logoService.removeLogo();
    setCurrentLogo(null);
    onLogoChange?.(logoService.getCurrentLogoUrl());
    showMessage('success', 'Logo eliminado. Se usará el logo por defecto');
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const logoInfo = logoService.getLogoInfo();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Logo del Negocio</h3>
        <p className="text-sm text-gray-600">
          Sube el logo de tu negocio para personalizarlo en todo el sistema
        </p>
      </div>

      {/* Vista previa del logo actual */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {currentLogo ? (
              <img 
                src={currentLogo.url} 
                alt="Logo actual" 
                className="w-full h-full object-contain"
              />
            ) : (
              <Image className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            {logoInfo.isCustom ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{logoInfo.fileName}</p>
                <p className="text-xs text-gray-500">
                  Subido el {new Date(logoInfo.uploadDate!).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Logo por defecto</p>
            )}
          </div>
          {logoInfo.isCustom && (
            <button
              onClick={handleRemoveLogo}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar logo personalizado"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Área de subida */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-8 h-8 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isUploading ? 'Subiendo...' : 'Haz clic o arrastra tu logo aquí'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, SVG o WEBP (máx. 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`
          mt-4 p-3 rounded-lg flex items-center space-x-2
          ${message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
          }
        `}>
          {message.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• El logo se aplicará automáticamente en todas las páginas del sistema</p>
        <p>• Se recomienda usar imágenes cuadradas o con fondo transparente</p>
        <p>• El logo se almacena localmente en tu navegador</p>
      </div>
    </div>
  );
};