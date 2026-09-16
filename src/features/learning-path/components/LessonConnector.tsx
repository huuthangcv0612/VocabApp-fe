import React from 'react'

interface LessonConnectorProps {
  startX: number
  startY: number
  endX: number
  endY: number
  status: 'completed' | 'current' | 'locked'
}

export const LessonConnector: React.FC<LessonConnectorProps> = ({
  startX,
  startY,
  endX,
  endY,
  status,
}) => {
  // Generate smooth cubic bezier curve between points
  const deltaY = endY - startY
  const controlY1 = startY + deltaY * 0.5
  const controlY2 = startY + deltaY * 0.5

  const pathD = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`

  const strokeColor = status === 'completed' ? '#22c55e' : status === 'current' ? '#3b82f6' : '#94a3b8'
  const strokeDash = status === 'locked' ? '6 6' : 'none'

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={strokeDash}
        style={{
          transition: 'stroke 0.3s ease',
          opacity: status === 'locked' ? 0.4 : 0.9,
        }}
      />
    </svg>
  )
}

export default LessonConnector
