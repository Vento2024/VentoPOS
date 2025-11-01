import { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'error' | 'info'
  loading?: boolean
  icon?: ReactNode
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  loading = false,
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      iconColor: 'text-yellow-400',
      confirmVariant: 'warning' as const
    },
    error: {
      iconColor: 'text-red-400',
      confirmVariant: 'danger' as const
    },
    info: {
      iconColor: 'text-blue-400',
      confirmVariant: 'primary' as const
    }
  }

  const currentStyle = typeStyles[type]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full shadow-strong border border-gray-700">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${currentStyle.iconColor}`}>
              {icon || <AlertTriangle className="w-6 h-6" />}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="ml-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-900 rounded-b-xl flex gap-3 justify-end border-t border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={currentStyle.confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}