import { useTranslation } from 'react-i18next'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { SessionResponseRecord, SessionConnectedStudent } from '../../../types/interactiveClass'

interface LiveQuizTeacherProps {
  currentQuestion: {
    questionText: string
    word?: string
    options: string[]
    correctAnswer?: string
    currentIndex: number
    totalQuestions: number
  } | null
  showAnswer: boolean
  responses: SessionResponseRecord[]
  connectedStudents: SessionConnectedStudent[]
  onShowAnswer: () => void
  onNext: () => void
}

export const LiveQuizTeacher = ({
  currentQuestion,
  showAnswer,
  responses,
  connectedStudents,
  onShowAnswer,
  onNext,
}: LiveQuizTeacherProps) => {
  const { t } = useTranslation('interactive')

  if (!currentQuestion) {
    return (
      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
        <h3>{t('interactiveRoom.quiz.noQuestion')}</h3>
      </div>
    )
  }

  const optionLetters = ['A', 'B', 'C', 'D']
  const responseCount = responses.length
  const totalStudents = connectedStudents.length

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#94A3B8',
          fontSize: '0.95rem',
          marginBottom: '16px',
        }}
      >
        <span>
          {t('interactiveRoom.quiz.questionNumber', {
            current: currentQuestion.currentIndex + 1,
            total: currentQuestion.totalQuestions,
          })}
        </span>
        <span>
          {t('interactiveRoom.quiz.submittedCount', {
            submitted: responseCount,
            total: totalStudents,
          })}
        </span>
      </div>

      {/* Question Card */}
      <div
        style={{
          background: '#1E293B',
          borderRadius: '24px',
          padding: '32px',
          border: '2px solid #334155',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.25rem', color: '#CBD5E1', marginBottom: '12px' }}>
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
                fontSize: '2.8rem',
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
          const isCorrect = showAnswer && opt === currentQuestion.correctAnswer
          const letter = optionLetters[idx] || String(idx + 1)

          // Count how many students chose this option
          const selectedByCount = responses.filter((r) => r.answer === opt || r.answer === letter).length

          return (
            <div
              key={idx}
              className={`ic-quiz-btn ${isCorrect ? 'correct' : ''}`}
              style={{
                cursor: 'default',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="ic-quiz-badge">{letter}</div>
                <span>{opt}</span>
              </div>

              {selectedByCount > 0 && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {t('interactiveRoom.quiz.selectedBy', { count: selectedByCount })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Realtime Student Responses List */}
      <div
        style={{
          marginTop: '24px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #334155',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600, marginBottom: '10px' }}>
          {t('interactiveRoom.quiz.respondedList', { count: responses.length })}
        </div>
        {responses.length === 0 ? (
          <div style={{ color: '#64748B', fontStyle: 'italic', fontSize: '0.9rem' }}>
            {t('interactiveRoom.quiz.waitingStudentAnswers')}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {responses.map((resp, rIdx) => (
              <span
                key={rIdx}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: '#334155',
                  fontSize: '0.85rem',
                  color: '#F8FAFC',
                }}
              >
                👤 {resp.student_name || `${t('interactiveRoom.quiz.student')} ${rIdx + 1}`}:{' '}
                <strong>{String(resp.answer)}</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="ic-btn ic-btn-secondary"
          onClick={onShowAnswer}
          disabled={showAnswer}
        >
          {showAnswer
            ? t('interactiveRoom.quiz.answerShown')
            : t('interactiveRoom.quiz.showAnswerToStudents')}
        </button>

        <button
          type="button"
          className="ic-btn ic-btn-primary"
          onClick={onNext}
          disabled={currentQuestion.currentIndex >= currentQuestion.totalQuestions - 1}
        >
          {t('interactiveRoom.quiz.nextQuestion')}
        </button>
      </div>
    </div>
  )
}
