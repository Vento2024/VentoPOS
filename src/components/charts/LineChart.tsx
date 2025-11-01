import { formatCRC } from '../../utils/format'

interface LineChartData {
  label: string
  value: number
}

interface LineChartProps {
  data: LineChartData[]
  title?: string
  height?: number
  color?: string
  showPoints?: boolean
  showGrid?: boolean
  formatValue?: (value: number) => string
}

export default function LineChart({ 
  data, 
  title, 
  height = 300, 
  color = '#f97316',
  showPoints = true,
  showGrid = true,
  formatValue = formatCRC 
}: LineChartProps) {
  if (data.length === 0) {
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

  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const valueRange = maxValue - minValue || 1
  
  const chartWidth = 100 // Porcentaje
  const chartHeight = height - 80 // Espacio para labels
  
  // Calcular puntos para la línea
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth
    const y = chartHeight - ((item.value - minValue) / valueRange) * chartHeight
    return { x, y, ...item }
  })
  
  // Crear path SVG para la línea
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')
  
  // Crear path para el área bajo la línea
  const areaData = `${pathData} L ${points[points.length - 1].x} ${chartHeight} L 0 ${chartHeight} Z`
  
  // Líneas de grid horizontales
  const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
    const y = (i / 4) * chartHeight
    const value = maxValue - (i / 4) * valueRange
    return { y, value }
  }) : []

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid && gridLines.map((line, index) => (
            <g key={index}>
              <line
                x1="0"
                y1={line.y}
                x2={chartWidth}
                y2={line.y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
              <text
                x="-5"
                y={line.y + 1}
                textAnchor="end"
                className="text-xs fill-gray-500"
                fontSize="10"
              >
                {formatValue(line.value)}
              </text>
            </g>
          ))}
          
          {/* Área bajo la línea */}
          <path
            d={areaData}
            fill={color}
            fillOpacity="0.1"
          />
          
          {/* Línea principal */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Puntos */}
          {showPoints && points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="hover:r-4 transition-all cursor-pointer"
              />
              {/* Tooltip invisible para hover */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${point.label}: ${formatValue(point.value)}`}</title>
              </circle>
            </g>
          ))}
        </svg>
        
        {/* Labels del eje X */}
        <div className="flex justify-between mt-2 px-1">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="text-xs text-gray-600 text-center flex-1"
              style={{ 
                maxWidth: `${100 / data.length}%`,
                transform: data.length > 7 ? 'rotate(-45deg)' : 'none',
                transformOrigin: 'center'
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}