import { useState, useMemo, type KeyboardEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { SpeakerButton } from '../components/SpeakerButton'
import { useVocabulary } from '../hooks/useApi'
import { progressApi } from '../services/api'
import '../styles/pages/quiz.css'

interface QuizQuestion {
  id: string
  word: string
  meaning: string
}

export default function Quiz() {
  const { t } = useTranslation(['learning', 'common'])
  const { lektionId, lessonId } = useParams<{ lektionId?: string; lessonId?: string }>()
  const activeLessonId = lessonId || lektionId || ''
  const { vocabulary, loading, error } = useVocabulary(activeLessonId)

  const shuffledQuestions = useMemo<QuizQuestion[]>(() => {
    return [...vocabulary]
      .map((item) => ({ id: item._id, word: item.word, meaning: item.meaning }))
      .sort(() => Math.random() - 0.5)
  }, [vocabulary])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const currentQuestion = shuffledQuestions[currentIndex]
  const progress = shuffledQuestions.length > 0 ? ((currentIndex + 1) / shuffledQuestions.length) * 100 : 0

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')

  const handleSubmit = async () => {
    if (!currentQuestion) return

    const submittedAnswer = normalizeText(answer)
    const answerOptions = currentQuestion.meaning
      .split('/')
      .map((option) => normalizeText(option))
      .filter(Boolean)

    const isCorrect = answerOptions.some((option) => option === submittedAnswer)

    if (submittedAnswer.length === 0) {
      setFeedback('incorrect')
    } else if (isCorrect) {
      setFeedback('correct')
      setScore((prev) => prev + 1)
      if (activeLessonId) {
        try {
          await progressApi.startLesson(activeLessonId)
        } catch (err) {
          console.error('Error recording word progress:', err)
        }
      }
    } else {
      setFeedback('incorrect')
    }

    setAnswered(true)
  }

  const handleNext = async () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setAnswer('')
      setFeedback(null)
      setAnswered(false)
    } else {
      setCompleted(true)
      if (activeLessonId && score >= Math.ceil(shuffledQuestions.length * 0.7)) {
        try {
          await progressApi.completeLesson(activeLessonId)
        } catch (err) {
          console.error('Error completing lesson:', err)
        }
      }
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setAnswer('')
    setFeedback(null)
    setAnswered(false)
    setScore(0)
    setCompleted(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !answered) {
      handleSubmit()
    } else if (e.key === 'Enter' && answered) {
      handleNext()
    }
  }

  return (
    <div className="quiz-page">
      <Header />

      <div className="quiz-container">
        {loading && <p>{t('flashcard.loading')}</p>}
        {error && <p className="status-text error">{t('common.states.error')}: {error}</p>}

        {!loading && !error && shuffledQuestions.length === 0 && (
          <div className="quiz-empty">
            <p>{t('quiz.empty')}</p>
            <Link to={`/lessons/${activeLessonId}`} className="back-button">
              {t('flashcard.backToLesson')}
            </Link>
          </div>
        )}

        {!loading && !error && shuffledQuestions.length > 0 && (
          <>
            {!completed ? (
              <>
                <div className="quiz-header">
                  <span className="question-counter">
                    {t('quiz.question', { current: currentIndex + 1, total: shuffledQuestions.length })}
                  </span>
                  <span className="quiz-badge">QUIZ</span>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="quiz-content">
                  <div className="quiz-question-row">
                    <h2 className="quiz-question">
                      {t('quiz.prompt', { word: currentQuestion.word })}
                    </h2>
                    <SpeakerButton word={currentQuestion.word} />
                  </div>

                  <div className="quiz-input-wrapper">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('quiz.placeholder')}
                      className={`quiz-input ${feedback ? feedback : ''}`}
                      disabled={answered}
                      autoFocus
                    />
                    {feedback && (
                      <div className={`feedback-icon ${feedback}`}>
                        {feedback === 'correct' ? '✓' : '✗'}
                      </div>
                    )}
                  </div>

                  {feedback && (
                    <div className={`feedback-message ${feedback}`}>
                      {feedback === 'correct' ? (
                        <>
                          <span className="feedback-text">{t('quiz.correct')}</span>
                          <span className="correct-answer">{currentQuestion.meaning}</span>
                        </>
                      ) : (
                        <>
                          <span className="feedback-text">{t('quiz.incorrect')}</span>
                          <span className="correct-answer">{t('quiz.correctAnswer')} {currentQuestion.meaning}</span>
                        </>
                      )}
                    </div>
                  )}

                  {!answered ? (
                    <button onClick={handleSubmit} className="submit-button">
                      {t('quiz.check')}
                    </button>
                  ) : (
                    <button onClick={handleNext} className="next-button">
                      {currentIndex === shuffledQuestions.length - 1 ? t('quiz.viewResult') : t('quiz.next')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="quiz-summary">
                <div className="quiz-summary-card">
                  <h2>{t('quiz.resultTitle')}</h2>
                  <p className="summary-score">
                    {t('quiz.score')} <strong>{score}</strong> / {shuffledQuestions.length}
                  </p>
                  <p className="summary-text">
                    {t('quiz.summary')}
                  </p>
                  <div className="summary-actions">
                    <button onClick={handleRestart} className="submit-button">
                      {t('quiz.retake')}
                    </button>
                    <Link to={`/lessons/${activeLessonId}`} className="next-button">
                      {t('flashcard.backToLesson')}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="quiz-info">
              <span className="info-icon">📝</span>
              <span>Quick Quiz</span>
            </div>
          </>
        )}

        {!loading && !error && shuffledQuestions.length > 0 && (
          <Link to={`/lessons/${activeLessonId}`} className="back-button">
            {t('common.actions.back')}
          </Link>
        )}
      </div>

      <Footer />
    </div>
  )
}
