import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  className?: string
  render?: (value: any, row: any) => ReactNode
}

interface ResponsiveTableProps {
  columns: Column[]
  data: any[]
  keyField: string
  onRowClick?: (row: any) => void
  loading?: boolean
  emptyMessage?: string
}

export default function ResponsiveTable({
  columns,
  data,
  keyField,
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos disponibles'
}: ResponsiveTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-neutral-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 font-medium text-neutral-700 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`py-3 px-4 ${column.className || ''}`}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-lg border border-neutral-200 p-4 shadow-soft ${
              onRowClick ? 'cursor-pointer hover:shadow-medium transition-shadow duration-200' : ''
            }`}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start py-1">
                <span className="text-sm font-medium text-neutral-600 min-w-0 flex-1">
                  {column.label}:
                </span>
                <span className="text-sm text-neutral-900 ml-2 text-right">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}