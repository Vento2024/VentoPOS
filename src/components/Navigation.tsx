import { Link, useLocation } from 'wouter'
import { 
  ShoppingCart, 
  History, 
  Calculator, 
  Home,
  Menu,
  X,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Archive,
  Package,
  BarChart3,
  Settings
} from 'lucide-react'
import { useState } from 'react'
import { useLogo } from '../hooks/useLogo'

const Navigation = () => {
  const [location] = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { logoUrl } = useLogo()

  const navItems = [
    {
      path: '/',
      label: 'Catálogo',
      icon: Home,
      description: 'Punto de venta'
    },
    {
      path: '/sales',
      label: 'Historial de Ventas',
      icon: History,
      description: 'Ver ventas realizadas'
    },
    {
      path: '/hold-sales',
      label: 'Ventas Guardadas',
      icon: Archive,
      description: 'Ver y recuperar ventas guardadas'
    },
    {
      path: '/administration',
      label: 'Administración',
      icon: Settings,
      description: 'Panel administrativo completo'
    },
    {
      path: '/customers',
      label: 'Clientes',
      icon: Users,
      description: 'Gestionar clientes y créditos'
    },
    {
      path: '/overdue-customers',
      label: 'Clientes Vencidos',
      icon: AlertTriangle,
      description: 'Reportes de saldos vencidos'
    },
    {
      path: '/reports',
      label: 'Reportes',
      icon: BarChart3,
      description: 'Análisis de ventas y reportes'
    },
    {
      path: '/cash-closing',
      label: 'Cierre de Caja',
      icon: Calculator,
      description: 'Gestionar cierres de caja'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/'
    }
    return location.startsWith(path)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-orange-500 text-white p-2 rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-full bg-gray-900 shadow-2xl z-40 transform transition-all duration-300 ease-in-out border-r border-gray-700
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
      `}>
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 bg-orange-600 text-white ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-white p-1 rounded-full">
            <img src={logoUrl} alt="Minisúper El Ventolero" className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-bold">Minisúper El Ventolero</h1>
              <p className="text-xs text-orange-100">Sistema de Ventas</p>
            </div>
          )}
          {/* Collapse Button - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-orange-700 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 p-3 mb-1 rounded-lg transition-all duration-200 group
                  ${active 
                    ? 'bg-orange-600 text-white border-l-4 border-orange-400' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${active ? 'text-white' : 'text-gray-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Business Info - Bottom */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
            <div className="text-center">
              <h3 className="font-semibold text-gray-200 text-sm">Minisúper El Ventolero</h3>
              <p className="text-xs text-gray-400">+506 87656654</p>
              <p className="text-xs text-gray-500">San José, Costa Rica</p>
            </div>

            {/* Quick Stats */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-green-900 p-2 rounded text-center border border-green-700">
                <div className="text-sm font-bold text-green-400">₡0</div>
                <div className="text-xs text-green-500">Ventas Hoy</div>
              </div>
              <div className="bg-orange-900 p-2 rounded text-center border border-orange-700">
                <div className="text-sm font-bold text-orange-400">0</div>
                <div className="text-xs text-orange-500">Transacciones</div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Spacer for Desktop */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`} />
    </>
  )
}

export default Navigation