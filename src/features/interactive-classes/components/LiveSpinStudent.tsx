import { useState, useEffect } from 'react'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { VocabularyItem } from '../../../types/vocabulary'

interface SpinResultData {
  word?: string
  vocabulary?: { word?: string }
  meaning?: string
  [key: string]: unknown
}

interface LiveSpinStudentProps {
  vocabularyList: VocabularyItem[]
  spinResult?: SpinResultData | VocabularyItem | string | null
}

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    }
  }

  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${x} ${y}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

const SEGMENT_COLORS = ['#2A63E8', '#D90000', '#FFCC00', '#16A34A', '#9333EA', '#EA580C']

export const LiveSpinStudent = ({
  vocabularyList,
  spinResult,
}: LiveSpinStudentProps) => {
  const [rotation, setRotation] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null)

  const items = vocabularyList.length > 0 ? vocabularyList : []
  const angle = items.length > 0 ? 360 / items.length : 360

  const playSpinAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(240, ctx.currentTime)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2)
      osc.stop(ctx.currentTime + 1.2)
    } catch {
      // Audio playback safely ignored
    }
  }

  // When teacher spins, spinResult event arrives from socket: session:spun
  useEffect(() => {
    if (spinResult) {
      setAnimating(true)
      setSelectedWord(null)
      playSpinAudio()

      const spinObj = typeof spinResult === 'object' && spinResult !== null ? (spinResult as SpinResultData) : null
      const wordText =
        typeof spinResult === 'string'
          ? spinResult
          : spinObj?.word || spinObj?.vocabulary?.word || ''

      const currentItems = vocabularyList.length > 0 ? vocabularyList : []
      const currentAngle = currentItems.length > 0 ? 360 / currentItems.length : 360

      const foundIdx = currentItems.findIndex(
        (v) => v.word.toLowerCase() === wordText.toLowerCase(),
      )
      const targetIdx = foundIdx >= 0 ? foundIdx : Math.floor(Math.random() * Math.max(1, currentItems.length))

      const centerAngle = targetIdx * currentAngle + currentAngle / 2
      const targetDegree = 90 - centerAngle
      const extraTurns = 360 * 5

      setRotation((prev) => prev + extraTurns + targetDegree)

      const timer = setTimeout(() => {
        setAnimating(false)
        const found = currentItems[targetIdx] || (spinObj ? (spinObj as unknown as VocabularyItem) : ({ word: wordText, meaning: '' } as VocabularyItem))
        setSelectedWord(found)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [spinResult, vocabularyList])

  return (
    <div style={{ width: '100%', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
        Vòng quay từ vựng • Giáo viên điều khiển quay
      </div>

      {/* Wheel SVG */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '24px solid #FFCC00',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }}
        />

        <svg
          viewBox="0 0 320 320"
          width="280"
          height="280"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: animating ? 'transform 3s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            borderRadius: '50%',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
          }}
        >
          <circle cx="160" cy="160" r="158" fill="#1E293B" stroke="#334155" strokeWidth="4" />

          {items.map((item, idx) => {
            const startA = idx * angle
            const endA = (idx + 1) * angle
            const pathD = describeArc(160, 160, 154, startA, endA)
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length]

            const midA = ((startA + endA) / 2 - 90) * (Math.PI / 180)
            const textRadius = 105
            const tx = 160 + textRadius * Math.cos(midA)
            const ty = 160 + textRadius * Math.sin(midA)
            const textAngle = (startA + endA) / 2

            return (
              <g key={item._id || idx}>
                <path d={pathD} fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                <text
                  x={tx}
                  y={ty}
                  fill="#FFFFFF"
                  fontSize={items.length > 12 ? '9' : '11'}
                  fontWeight="700"
                  fontFamily="Oswald"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                >
                  {item.word.length > 12 ? `${item.word.slice(0, 10)}...` : item.word}
                </text>
              </g>
            )
          })}

          <circle cx="160" cy="160" r="26" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
          <text
            x="160"
            y="160"
            fill="#0F172A"
            fontSize="14"
            fontWeight="800"
            fontFamily="Oswald"
            textAnchor="middle"
            dominantBaseline="central"
          >
            SPIN
          </text>
        </svg>
      </div>

      {/* Result Display */}
      {selectedWord && !animating && (
        <div
          style={{
            marginTop: '24px',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            color: '#0F172A',
            boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            animation: 'modalIn 0.3s ease-out',
            maxWidth: '440px',
            margin: '24px auto 0',
          }}
        >
          <div style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            🎉 TỪ VỰNG ĐƯỢC CHỌN
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              margin: '6px 0',
            }}
          >
            <h2
              style={{
                fontFamily: 'Oswald',
                fontSize: '2.2rem',
                margin: 0,
                color: '#D90000',
              }}
            >
              {selectedWord.article ? `${selectedWord.article} ` : ''}
              {selectedWord.word}
            </h2>
            <SpeakerButton word={selectedWord.word} />
          </div>

          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E293B', margin: '4px 0 10px' }}>
            {selectedWord.meaning}
          </p>

          {selectedWord.example && (
            <div
              style={{
                background: '#F8FAFC',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#475569',
                borderLeft: '4px solid #2A63E8',
                textAlign: 'left',
              }}
            >
              &ldquo;{selectedWord.example}&rdquo;
            </div>
          )}
        </div>
      )}

      {animating && (
        <div style={{ marginTop: '20px', color: '#FFCC00', fontWeight: 700, fontSize: '1.1rem' }}>
          🎡 Giáo viên đang quay vòng quay...
        </div>
      )}

      {!animating && !selectedWord && (
        <div style={{ marginTop: '20px', color: '#94A3B8', fontStyle: 'italic', fontSize: '0.9rem' }}>
          Chờ giáo viên bấm quay từ vựng tiếp theo...
        </div>
      )}
    </div>
  )
}
