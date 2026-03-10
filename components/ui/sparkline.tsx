"use client"

interface SparkLineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  strokeWidth?: number
  className?: string
}

export function SparkLine({ 
  data, 
  width = 80, 
  height = 28,
  color = "#3b82f6",
  fillColor,
  strokeWidth = 1.5,
  className = ""
}: SparkLineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Padding to avoid clipping the stroke
  const padY = 3
  const padX = 1
  const innerWidth = width - padX * 2
  const innerHeight = height - padY * 2

  // Build the SVG path
  const points = data.map((val, i) => {
    const x = padX + (i / (data.length - 1)) * innerWidth
    const y = padY + innerHeight - ((val - min) / range) * innerHeight
    return { x, y }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  // Fill area beneath curve
  const fillD = fillColor
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
    : undefined

  // Determine if the trend is up or down for the end-dot color
  const lastVal = data[data.length - 1]
  const prevVal = data[data.length - 2]
  const trendUp = lastVal > prevVal

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Gradient fill under curve */}
      {fillColor && (
        <>
          <defs>
            <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path 
            d={fillD} 
            fill={`url(#spark-fill-${color.replace('#', '')})`}
          />
        </>
      )}
      {/* Line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Last point dot */}
      <circle 
        cx={points[points.length - 1].x} 
        cy={points[points.length - 1].y} 
        r={2.5} 
        fill={trendUp ? "#ef4444" : "#22c55e"} 
        stroke="white" 
        strokeWidth={1}
      />
    </svg>
  )
}
