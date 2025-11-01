import { formatCRC } from '../../utils/format'

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  height?: number
  showValues?: boolean
  formatValue?: (value: number) => string
}

export default function BarChart({ 
  data, 
  title, 
  height = 300, 
  showValues = true,
  formatValue = formatCRC 
}: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 60) : 0
            const color = item.color || defaultColors[index % defaultColors.length]
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 max-w-20">
                {/* Value label */}
                {showValues && item.value > 0 && (
                  <div className="text-xs font-medium text-gray-700 mb-1 text-center">
                    {formatValue(item.value)}
                  </div>
                )}
                
                {/* Bar */}
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-full max-w-12 rounded-t transition-all duration-500 ease-out"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: color,
                      minHeight: item.value > 0 ? '4px' : '0px'
                    }}
                  />
                </div>
                
                {/* Label */}
                <div className="text-xs text-gray-600 mt-2 text-center break-words">
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Y-axis line */}
        <div className="absolute left-0 bottom-8 w-full h-px bg-gray-200" />
      </div>
    </div>
  )
}