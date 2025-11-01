import { ReactNode } from 'react'
import { ArrowLeft, Menu } from 'lucide-react'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  onBackClick?: () => void
  showBack?: boolean
  actions?: ReactNode
  className?: string
}

export default function MobileHeader({
  title,
  subtitle,
  onMenuClick,
  onBackClick,
  showBack = false,
  actions,
  className = ''
}: MobileHeaderProps) {
  return (
    <div className={`bg-gray-900 border-b border-gray-700 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack ? (
            <button
              onClick={onBackClick}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors duration-200 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : onMenuClick ? (
            <button
              onClick={onMenuClick}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors duration-200 -ml-2 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : null}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-neutral-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-neutral-600 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 ml-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}