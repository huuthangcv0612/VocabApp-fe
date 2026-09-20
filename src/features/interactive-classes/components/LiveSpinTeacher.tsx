import { useState, useEffect } from 'react'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { VocabularyItem } from '../../../types/vocabulary'

interface SpinResultData {
  word?: string
  vocabulary?: { word?: string }
  meaning?: string
  [key: string]: unknown
}

interface LiveSpinTeacherProps {
  vocabularyList: VocabularyItem[]
  spinResult?: SpinResultData | VocabularyItem | string | null
  isSpinning?: boolean
  onSpin: () => void
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

export const LiveSpinTeacher = ({
  vocabularyList,
  spinResult,
  isSpinning = false,
  onSpin,
}: LiveSpinTeacherProps) => {
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
      // Audio playback safely ignored if blocked
    }
  }

  // Trigger spin animation when spinResult arrives or isSpinning is set
  useEffect(() => {
    if (spinResult) {
      setAnimating(true)
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

  const handleTriggerSpin = () => {
    if (animating || isSpinning || items.length === 0) return
    setSelectedWord(null)
    onSpin()
  }

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '16px' }}>
        Vòng quay từ vựng ngẫu nhiên • <strong>{items.length}</strong> từ
      </div>

      {/* Wheel SVG */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          height: '320px',
          margin: '0 auto',
        }}
      >
        {/* Pointer Arrow */}
        <div
          style={{
            position: 'absolute',
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '28px solid #FFCC00',
            zIndex: 10,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }}
        />

        <svg
          viewBox="0 0 320 320"
          width="320"
          height="320"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: animating ? 'transform 3s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
            borderRadius: '50%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <circle cx="160" cy="160" r="158" fill="#1E293B" stroke="#334155" strokeWidth="4" />

          {items.map((item, idx) => {
            const startA = idx * angle
            const endA = (idx + 1) * angle
            const pathD = describeArc(160, 160, 154, startA, endA)
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length]

            // Label position
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

          {/* Wheel Center Button */}
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

      {/* Selected Result Card */}
      {selectedWord && !animating && (
        <div
          style={{
            marginTop: '28px',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            color: '#0F172A',
            boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            animation: 'modalIn 0.3s ease-out',
            maxWidth: '480px',
            margin: '28px auto 0',
          }}
        >
          <div style={{ color: '#16A34A', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
            🎉 KẾT QUẢ VÒNG QUAY
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              margin: '8px 0',
            }}
          >
            <h2
              style={{
                fontFamily: 'Oswald',
                fontSize: '2.5rem',
                margin: 0,
                color: '#D90000',
              }}
            >
              {selectedWord.article ? `${selectedWord.article} ` : ''}
              {selectedWord.word}
            </h2>
            <SpeakerButton word={selectedWord.word} />
          </div>

          <p style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1E293B', margin: '4px 0 12px' }}>
            {selectedWord.meaning}
          </p>

          {selectedWord.example && (
            <div
              style={{
                background: '#F8FAFC',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.95rem',
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

      {/* Teacher Spin Action Button */}
      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          className="ic-btn ic-btn-primary"
          style={{ padding: '14px 40px', fontSize: '1.25rem' }}
          onClick={handleTriggerSpin}
          disabled={animating || isSpinning || items.length === 0}
        >
          {animating ? '🎡 Đang quay...' : '🎡 QUAY TỪ VỰNG'}
        </button>
      </div>
    </div>
  )
}
