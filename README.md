[README.md](https://github.com/user-attachments/files/23286134/README.md)
# 🛒 VentoPOS

**Sistema de Punto de Venta Moderno y Completo**

VentoPOS es una aplicación web moderna diseñada para pequeñas y medianas empresas que necesitan un sistema de punto de venta eficiente, intuitivo y completo.

## 🌟 Características Principales

### 💼 Gestión Comercial
- **Punto de Venta Intuitivo**: Interfaz moderna y fácil de usar
- **Gestión de Inventario**: Control completo de productos y stock
- **Facturación Electrónica**: Generación automática de facturas
- **Gestión de Clientes**: Base de datos completa de clientes
- **Ventas a Crédito**: Control de cuentas por cobrar

### 📊 Reportes y Análisis
- **Reportes de Ventas**: Análisis detallado de ventas por período
- **Control de Caja**: Arqueo y cierre de caja diario
- **Reportes de Inventario**: Control de stock y productos más vendidos
- **Análisis de Clientes**: Seguimiento de clientes morosos y activos

### 🔧 Características Técnicas
- **PWA (Progressive Web App)**: Funciona offline y se puede instalar
- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **Multiplataforma**: Disponible como aplicación web, móvil y desktop
- **Exportación de Datos**: Excel, PDF y otros formatos
- **Integración WhatsApp**: Envío automático de facturas

## 🚀 Acceso a la Aplicación

### 🌐 Versión Web
Accede directamente desde tu navegador:
**[https://vento2024.github.io/VentoPOS/](https://vento2024.github.io/VentoPOS/)**

### 📱 Instalación como PWA
1. Abre la aplicación web en tu navegador
2. Busca el ícono de "Instalar" en la barra de direcciones
3. Haz clic en "Instalar" para agregar a tu dispositivo

## 🛠️ Instalación para Desarrollo

### Prerrequisitos
- Node.js 18 o superior
- npm o yarn

### Pasos de Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Vento2024/VentoPOS.git

# Navegar al directorio
cd VentoPOS

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📋 Uso Básico

### Primer Acceso
1. **Usuario**: `admin`
2. **Contraseña**: `admin123`

### Funciones Principales
- **Catálogo**: Gestiona tu inventario de productos
- **Ventas**: Procesa ventas rápidamente
- **Clientes**: Administra tu base de clientes
- **Reportes**: Analiza el rendimiento de tu negocio
- **Administración**: Configura usuarios y permisos

## 🏗️ Estructura del Proyecto

```
VentoPOS/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── services/      # Servicios y APIs
│   ├── store/         # Estado global (Zustand)
│   ├── types.ts       # Definiciones de tipos
│   └── utils/         # Utilidades
├── public/            # Archivos estáticos
├── dist/             # Build de producción
└── .github/          # Workflows de CI/CD
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Estado**: Zustand
- **Routing**: React Router
- **Build**: Vite
- **PWA**: Vite PWA Plugin
- **UI Components**: Headless UI
- **Icons**: Lucide React

## 📦 Aplicaciones Nativas

### Android APK
Genera tu aplicación Android usando Capacitor:
```bash
npm run build:android
```

### Aplicación Desktop
Crea aplicaciones para Windows, Mac y Linux:
```bash
npm run build:electron
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

¿Necesitas ayuda? Contáctanos:
- **Email**: soporte@ventopos.com
- **GitHub Issues**: [Reportar un problema](https://github.com/Vento2024/VentoPOS/issues)

## 🎯 Roadmap

- [ ] Integración con APIs de facturación electrónica
- [ ] Módulo de compras y proveedores
- [ ] Dashboard avanzado con gráficos
- [ ] Integración con sistemas de pago
- [ ] Módulo de empleados y turnos
- [ ] Sincronización en la nube

---

**Desarrollado con ❤️ para pequeñas y medianas empresas**

*VentoPOS - Tu socio en el crecimiento del negocio*
