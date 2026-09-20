import { useState, useEffect } from 'react'
import { SpeakerButton } from '../../../components/SpeakerButton'

interface LiveQuizStudentProps {
  currentQuestion: {
    questionText: string
    word?: string
    options: string[]
    correctAnswer?: string
    currentIndex: number
    totalQuestions: number
  } | null
  showAnswer: boolean
  onSubmitAnswer: (answer: string) => void
}

export const LiveQuizStudent = ({
  currentQuestion,
  showAnswer,
  onSubmitAnswer,
}: LiveQuizStudentProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Reset state on question change
  useEffect(() => {
    setSelectedOption(null)
    setHasSubmitted(false)
  }, [currentQuestion?.currentIndex, currentQuestion?.questionText])

  if (!currentQuestion) {
    return (
      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❓</div>
        <h3>Đang chờ giáo viên bắt đầu câu hỏi...</h3>
      </div>
    )
  }

  const optionLetters = ['A', 'B', 'C', 'D']

  const handleSelect = (option: string) => {
    if (hasSubmitted || showAnswer) return
    setSelectedOption(option)
    setHasSubmitted(true)
    onSubmitAnswer(option)
  }

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '16px' }}>
        Câu hỏi <strong>{currentQuestion.currentIndex + 1}</strong> / {currentQuestion.totalQuestions}
      </div>

      {/* Question Card */}
      <div
        style={{
          background: '#1E293B',
          borderRadius: '24px',
          padding: '28px 24px',
          border: '2px solid #334155',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '1.15rem', color: '#CBD5E1', marginBottom: '10px' }}>
          {currentQuestion.questionText}
        </div>

        {currentQuestion.word && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'Oswald',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#FFCC00',
              }}
            >
              {currentQuestion.word}
            </span>
            <SpeakerButton word={currentQuestion.word} />
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="ic-quiz-options-grid">
        {currentQuestion.options.map((opt, idx) => {
          const letter = optionLetters[idx] || String(idx + 1)
          const isSelected = selectedOption === opt
          const isCorrect = showAnswer && opt === currentQuestion.correctAnswer
          const isIncorrect = showAnswer && isSelected && opt !== currentQuestion.correctAnswer

          let btnClass = 'ic-quiz-btn'
          if (isCorrect) {
            btnClass += ' correct'
          } else if (isIncorrect) {
            btnClass += ' incorrect'
          } else if (isSelected) {
            btnClass += ' selected'
          }

          return (
            <button
              key={idx}
              type="button"
              className={btnClass}
              onClick={() => handleSelect(opt)}
              disabled={hasSubmitted || showAnswer}
              style={{
                width: '100%',
                cursor: hasSubmitted || showAnswer ? 'default' : 'pointer',
              }}
            >
              <div className="ic-quiz-badge">{letter}</div>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Status banner */}
      <div style={{ marginTop: '20px', fontSize: '0.95rem' }}>
        {hasSubmitted && !showAnswer && (
          <div
            style={{
              color: '#38BDF8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '10px 16px',
              borderRadius: '999px',
              display: 'inline-block',
            }}
          >
            ✓ Đã gửi câu trả lời. Chờ giáo viên công bố kết quả...
          </div>
        )}

        {showAnswer && (
          <div
            style={{
              color: selectedOption === currentQuestion.correctAnswer ? '#4ADE80' : '#F87171',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginTop: '8px',
            }}
          >
            {selectedOption === currentQuestion.correctAnswer
              ? '🎉 Chính xác! Bạn làm rất tốt!'
              : `Đáp án đúng là: ${currentQuestion.correctAnswer}`}
          </div>
        )}
      </div>
    </div>
  )
}
