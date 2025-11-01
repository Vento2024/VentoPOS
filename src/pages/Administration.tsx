import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { 
  Package, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Calculator,
  Settings,
  FileText,
  TrendingUp,
  UserCheck,
  Archive,
  ChevronRight,
  Image
} from 'lucide-react'
import Header from '../components/Header'
import { LogoUpload } from '../components/LogoUpload'
import { useLogo } from '../hooks/useLogo'

interface AdminSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  path: string
  color: string
  items?: {
    title: string
    description: string
    path: string
  }[]
}

export default function Administration() {
  const [, setLocation] = useLocation()
  const { notifyLogoChange } = useLogo()

  const handleLogoChange = (logoUrl: string) => {
    // Notificar a todos los componentes que el logo ha cambiado
    notifyLogoChange()
  }

  const adminSections: AdminSection[] = [
    {
      id: 'inventory',
      title: 'Gestión de Inventario',
      description: 'Administrar productos, stock y precios',
      icon: Package,
      path: '/inventory',
      color: 'bg-blue-500',
      items: [
        {
          title: 'Ver Inventario',
          description: 'Consultar stock y productos disponibles',
          path: '/inventory'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reportes y Análisis',
      description: 'Análisis de ventas, tendencias y métricas',
      icon: BarChart3,
      path: '/reports',
      color: 'bg-green-500',
      items: [
        {
          title: 'Reportes de Ventas',
          description: 'Análisis detallado de ventas por período',
          path: '/reports'
        }
      ]
    },
    {
      id: 'customers',
      title: 'Gestión de Clientes',
      description: 'Administrar clientes y créditos',
      icon: Users,
      path: '/customers',
      color: 'bg-purple-500',
      items: [
        {
          title: 'Lista de Clientes',
          description: 'Ver y gestionar información de clientes',
          path: '/customers'
        },
        {
          title: 'Clientes Vencidos',
          description: 'Reportes de saldos vencidos y cobranza',
          path: '/overdue-customers'
        }
      ]
    },
    {
      id: 'sales',
      title: 'Gestión de Ventas',
      description: 'Historial y administración de ventas',
      icon: TrendingUp,
      path: '/sales',
      color: 'bg-orange-500',
      items: [
        {
          title: 'Historial de Ventas',
          description: 'Ver todas las ventas realizadas',
          path: '/sales'
        },
        {
          title: 'Ventas Guardadas',
          description: 'Gestionar ventas en espera',
          path: '/hold-sales'
        }
      ]
    },
    {
      id: 'cash',
      title: 'Gestión de Caja',
      description: 'Cierres de caja y control financiero',
      icon: Calculator,
      path: '/cash-closing',
      color: 'bg-red-500',
      items: [
        {
          title: 'Cierre de Caja',
          description: 'Realizar y consultar cierres de caja',
          path: '/cash-closing'
        }
      ]
    }
  ]

  const handleSectionClick = (path: string) => {
    setLocation(path)
  }

  const handleItemClick = (path: string) => {
    setLocation(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Panel de Administración" 
        subtitle="Gestión completa del sistema"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bienvenido al Panel de Administración
              </h2>
              <p className="text-gray-600">
                Accede a todas las herramientas administrativas desde un solo lugar
              </p>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon
            return (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Section Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => handleSectionClick(section.path)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 ${section.color} rounded-lg`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </div>

                {/* Section Items */}
                {section.items && section.items.length > 0 && (
                  <div className="border-t border-gray-100">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                        onClick={() => handleItemClick(item.path)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className="text-gray-300" size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acceso Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setLocation('/inventory')}
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="mx-auto text-blue-500 mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Inventario</span>
            </button>
            <button
              onClick={() => setLocation('/reports')}
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="mx-auto text-green-500 mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Reportes</span>
            </button>
            <button
              onClick={() => setLocation('/customers')}
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="mx-auto text-purple-500 mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Clientes</span>
            </button>
            <button
              onClick={() => setLocation('/cash-closing')}
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calculator className="mx-auto text-red-500 mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Caja</span>
            </button>
          </div>
        </div>

        {/* Advanced Configuration Section */}
        <div className="mt-8">
          <details className="bg-white rounded-lg shadow-sm border border-gray-200">
            <summary className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="text-gray-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configuración Avanzada
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Configuraciones del sistema que se realizan ocasionalmente
                  </p>
                </div>
              </div>
            </summary>
            <div className="border-t border-gray-100 p-6">
              <LogoUpload onLogoChange={handleLogoChange} />
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}