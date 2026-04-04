import { useState, useMemo, type KeyboardEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import '../styles/pages/quiz.css'

interface QuizQuestion {
  id: string
  word: string
  meaning: string
}

export default function Quiz() {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)

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

  const handleSubmit = () => {
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
    } else {
      setFeedback('incorrect')
    }

    setAnswered(true)
  }

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setAnswer('')
      setFeedback(null)
      setAnswered(false)
    } else {
      setCompleted(true)
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
        {loading && <p>Đang tải từ vựng...</p>}
        {error && <p className="status-text error">Lỗi: {error}</p>}

        {!loading && !error && shuffledQuestions.length === 0 && (
          <div className="quiz-empty">
            <p>Không có câu hỏi cho bài học này.</p>
            <Link to={`/lektion/${lektionId}`} className="back-button">
              ← Quay lại bài học
            </Link>
          </div>
        )}

        {!loading && !error && shuffledQuestions.length > 0 && (
          <>
            {!completed ? (
              <>
                <div className="quiz-header">
                  <span className="question-counter">Câu hỏi {currentIndex + 1}/{shuffledQuestions.length}</span>
                  <span className="quiz-badge">QUIZ</span>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="quiz-content">
                  <h2 className="quiz-question">
                    Nghĩa của từ <span className="highlight">"{currentQuestion.word}"</span> là gì?
                  </h2>

                  <div className="quiz-input-wrapper">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập đáp án"
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
                          <span className="feedback-text">Chính xác!</span>
                          <span className="correct-answer">{currentQuestion.meaning}</span>
                        </>
                      ) : (
                        <>
                          <span className="feedback-text">Sai rồi!</span>
                          <span className="correct-answer">Đáp án đúng: {currentQuestion.meaning}</span>
                        </>
                      )}
                    </div>
                  )}

                  {!answered ? (
                    <button onClick={handleSubmit} className="submit-button">
                      Kiểm Tra
                    </button>
                  ) : (
                    <button onClick={handleNext} className="next-button">
                      {currentIndex === shuffledQuestions.length - 1 ? 'Xem Kết Quả' : 'Tiếp Theo'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="quiz-summary">
                <div className="quiz-summary-card">
                  <h2>Kết quả kiểm tra nhanh</h2>
                  <p className="summary-score">
                    Điểm: <strong>{score}</strong> / {shuffledQuestions.length}
                  </p>
                  <p className="summary-text">
                    Bạn đã hoàn thành quiz. Xem lại flashcard hoặc tiếp tục ôn luyện với bài học.
                  </p>
                  <div className="summary-actions">
                    <button onClick={handleRestart} className="submit-button">
                      Làm lại Quiz
                    </button>
                    <Link to={`/lektion/${lektionId}`} className="next-button">
                      Quay lại bài học
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="quiz-info">
              <span className="info-icon">📝</span>
              <span>Kiểm Tra Nhanh (Quiz)</span>
            </div>
          </>
        )}

        {!loading && !error && shuffledQuestions.length > 0 && (
          <Link to={`/lektion/${lektionId}`} className="back-button">
            ← Quay lại
          </Link>
        )}
      </div>

      <Footer />
    </div>
  )
}
