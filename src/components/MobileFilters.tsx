import { ReactNode } from 'react'
import { X, Filter } from 'lucide-react'
import Button from './Button'

interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface MobileFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  fields: FilterField[]
  activeFiltersCount?: number
}

export default function MobileFilters({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  fields,
  activeFiltersCount = 0
}: MobileFiltersProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-strong">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Filtros</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={filters[field.key] || ''}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  >
                    <option value="">{field.placeholder || `Todos los ${field.label.toLowerCase()}`}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={filters[field.key] || ''}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-neutral-200 space-y-3">
            <Button
              variant="secondary"
              onClick={onClearFilters}
              className="w-full"
            >
              Limpiar filtros
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}