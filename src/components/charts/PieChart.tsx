import { formatCRC } from '../../utils/format'

interface PieChartData {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieChartData[]
  title?: string
  size?: number
  showLegend?: boolean
  formatValue?: (value: number) => string
}

export default function PieChart({ 
  data, 
  title, 
  size = 200, 
  showLegend = true,
  formatValue = formatCRC 
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const defaultColors = [
    '#f97316', // orange-500
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
  ]

  // Filtrar datos con valor > 0
  const filteredData = data.filter(item => item.value > 0)
  
  if (total === 0 || filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-48 text-gray-500">
          No hay datos para mostrar
        </div>
      </div>
    )
  }

  // Calcular ángulos para cada segmento
  let currentAngle = 0
  const segments = filteredData.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle += angle
    
    const color = item.color || defaultColors[index % defaultColors.length]
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color
    }
  })

  // Crear path SVG para cada segmento
  const createPath = (startAngle: number, endAngle: number, radius: number) => {
    const centerX = size / 2
    const centerY = size / 2
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Gráfico circular */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPath(segment.startAngle, segment.endAngle, size / 2 - 10)}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                title={`${segment.label}: ${formatValue(segment.value)} (${segment.percentage.toFixed(1)}%)`}
              />
            ))}
          </svg>
          
          {/* Centro del gráfico con total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-gray-900">{formatValue(total)}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
        
        {/* Leyenda */}
        {showLegend && (
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {segment.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatValue(segment.value)} ({segment.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}