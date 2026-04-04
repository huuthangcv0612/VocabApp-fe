import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import { vocabularyApi } from '../services/api'
import '../styles/pages/spinwheel.css'

interface WindowWithWebAudio extends Window {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    }
  }

  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [`M ${x} ${y}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ')
}

const SpinWheel = () => {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)
  const [rotating, setRotating] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [pointerColor, setPointerColor] = useState<string>('#ffc924')
  const [showSentenceCard, setShowSentenceCard] = useState(false)
  const [sentence, setSentence] = useState('')
  const [grammarFeedback, setGrammarFeedback] = useState<string | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const wheelRef = useRef<SVGSVGElement | null>(null)

  const segmentColors = ['#1e7f34', '#fbbf24', '#ef4444']
  const angle = vocabulary.length > 0 ? 360 / vocabulary.length : 0

  const playSpinSound = () => {
    const win = window as WindowWithWebAudio
    const AudioCtx = win.AudioContext || win.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(220, ctx.currentTime)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.5)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)

    oscillator.stop(ctx.currentTime + 1.5)
  }

  const handleSpin = useCallback(() => {
    if (rotating || vocabulary.length === 0) return

    setResult(null)
    setPointerColor('#ffc924')
    playSpinSound()

    const randomIndex = Math.floor(Math.random() * vocabulary.length)
    const centerAngle = randomIndex * angle + angle / 2
    const offset = (Math.random() - 0.5) * angle * 0.8
    const targetDegree = 90 - centerAngle + offset
    const extraTurns = 360 * (4 + Math.floor(Math.random() * 3))
    const extraRotation = Math.random() * 360
    const final = rotation + extraTurns + extraRotation + targetDegree

    setRotating(true)
    setRotation(final)

    setTimeout(() => {
      setRotating(false)
      const normalized = ((final % 360) + 360) % 360
      const pointerAngle = 90
      const pointerInitialAngle = ((pointerAngle - normalized) + 360) % 360
      const selectedIndex = Math.floor(pointerInitialAngle / angle) % vocabulary.length
      const selected = vocabulary[selectedIndex]
      setResult(selected.word)
      setPointerColor(segmentColors[selectedIndex % segmentColors.length])
      setSentence('')
      setGrammarFeedback(null)
      setShowSentenceCard(true)
    }, 4500)
  }, [rotating, rotation, angle, vocabulary, segmentColors])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        handleSpin()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSpin])

  return (
    <div className="spinwheel-page">
      <Header />

      <main className="spinwheel-main">
        <h1>Vòng Quay Từ Vựng</h1>
        <p>Quay vòng và nhận từ vựng ngẫu nhiên. Ai đến ô nào là người chiến thắng!</p>

        {loading && <p>Đang tải từ vựng...</p>}
        {error && <p className="status-text error">Lỗi: {error}</p>}
        {!loading && !error && vocabulary.length === 0 && (
          <p className="status-text">Không có từ vựng cho vòng quay này.</p>
        )}

        <div className={`wheel-stage ${showSentenceCard ? 'wheel-disabled' : ''}`} onClick={handleSpin} role="button" tabIndex={0} aria-label="Quay vòng" onKeyDown={(e) => { if (e.key === 'Enter') handleSpin() }}>
          <div className="wheel-area">
            <div className="wheel-pointer" style={{ borderRightColor: pointerColor }} />
            <svg
              ref={wheelRef}
              className="wheel-svg"
              viewBox="0 0 500 500"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {vocabulary.map((vocab, index) => {
                const start = index * angle
                const end = start + angle
                const path = describeArc(250, 250, 230, start, end)
                const middleAngle = start + angle / 2
                const textRadius = 225
                const textX = 250 + textRadius * Math.cos(((middleAngle - 90) * Math.PI) / 180)
                const textY = 250 + textRadius * Math.sin(((middleAngle - 90) * Math.PI) / 180)
                const rotateText = middleAngle + 90

                return (
                  <g key={vocab._id}>
                    <path
                      d={path}
                      fill={segmentColors[index % segmentColors.length]}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontWeight="400"
                      fontSize={8}
                      transform={`rotate(${rotateText}, ${textX}, ${textY})`}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {vocab.word}
                    </text>
                  </g>
                )
              })}

            </svg>
          </div>

          {rotating && <div className="spin-status">Đang quay...</div>}
        </div>

        {showSentenceCard && result && (
          <div className="sentence-card">
            <div className="sentence-header">
              <h2>Từ vựng của bạn là:</h2>
              <h3>{result}</h3>
              <p>Hãy đặt một câu tiếng Đức với từ này:</p>
            </div>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={`Ví dụ: Ich habe eine ${result} ...`}
            />
            <div className="sentence-actions">
              <button
                onClick={async () => {
                  if (!sentence.trim()) {
                    setGrammarFeedback('Vui lòng nhập một câu hợp lệ.')
                    return
                  }

                  setFeedbackLoading(true)
                  setGrammarFeedback(null)

                  try {
                    console.log('Calling OpenAI feedback API with:', { word: result, sentence })
                    const feedback = await vocabularyApi.getSentenceFeedback(result!, sentence)
                    console.log('Received feedback:', feedback)
                    setGrammarFeedback(feedback)
                  } catch (error: any) {
                    console.error('Error getting feedback:', error)
                    let errorMessage = 'Không thể nhận xét câu này. Vui lòng thử lại.'

                    if (error.response?.status === 404) {
                      errorMessage = 'Tính năng nhận xét AI chưa được kích hoạt. Vui lòng liên hệ quản trị viên.'
                    } else if (error.response?.status >= 500) {
                      errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.'
                    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('timeout')) {
                      errorMessage = 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.'
                    }

                    setGrammarFeedback(errorMessage)
                  } finally {
                    setFeedbackLoading(false)
                  }
                }}
                disabled={feedbackLoading}
              >
                {feedbackLoading ? 'Đang nhận xét...' : 'Nhận xét từ AI'}
              </button>
              <button
                onClick={() => {
                  setShowSentenceCard(false)
                  setResult(null)
                  setSentence('')
                  setGrammarFeedback(null)
                  setFeedbackLoading(false)
                }}
              >
                Hoàn thành
              </button>
            </div>
            {grammarFeedback && <div className="grammar-feedback">{grammarFeedback}</div>}
          </div>
        )}

        {!showSentenceCard && (
          <Link to={`/lektion/${lektionId}`} className="back-button">
            ← Quay lại trang bài học
          </Link>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default SpinWheel
