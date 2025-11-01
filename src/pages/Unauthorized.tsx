import React from 'react'
import { useLocation } from 'wouter'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'

export default function Unauthorized() {
  const [, setLocation] = useLocation()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            No tiene permisos para acceder a esta página
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Error 403 - Prohibido
            </CardTitle>
            <CardDescription className="text-center">
              Su rol actual ({user?.role === 'admin' ? 'Administrador' : 'Cajero'}) no tiene 
              los permisos necesarios para acceder a este recurso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldX className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Información de Seguridad
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Este intento de acceso ha sido registrado por motivos de seguridad.
                      Si cree que esto es un error, contacte al administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver Atrás
              </Button>
              
              <Button
                onClick={() => setLocation('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Si necesita acceso adicional, contacte al administrador del sistema
          </p>
        </div>
      </div>
    </div>
  )
}