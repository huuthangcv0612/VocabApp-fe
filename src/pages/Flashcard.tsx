import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import '../styles/pages/flashcard.css'

const Flashcard = () => {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learned, setLearned] = useState<string[]>([])

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setLearned([])
  }, [lektionId])

  const currentCard = vocabulary[currentIndex]
  const progress = vocabulary.length > 0 ? ((currentIndex + 1) / vocabulary.length) * 100 : 0

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleMarkLearned = () => {
    if (!currentCard) return
    if (!learned.includes(currentCard._id)) {
      setLearned([...learned, currentCard._id])
    }
    handleNext()
  }

  return (
    <div className="flashcard-page">
      <Header />

      <main className="flashcard-main">
        <Link to={`/lektion/${lektionId}`} className="back-button">
          ← Quay lại
        </Link>

        <div className="flashcard-container">
          {loading && <p>Đang tải từ vựng...</p>}
          {error && <p className="error">Lỗi: {error}</p>}
          {!loading && !error && vocabulary.length === 0 && (
            <p className="status-text">Không tìm thấy từ vựng cho bài học này.</p>
          )}

          {vocabulary.length > 0 && currentCard && (
            <>
              <div className="progress-section">
                <div className="progress-text">
                  Thẻ {currentIndex + 1} / {vocabulary.length}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flashcard-area">
                <div
                  className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className="flashcard-front">
                    <span className="card-label">MẶT TRƯỚC</span>
                    <div className="card-content">{currentCard.word}</div>
                  </div>

                  <div className="flashcard-back">
                    <span className="card-label">MẶT SAU</span>
                    <div className="card-meaning">{currentCard.meaning}</div>
                    <div className="card-example">
                      {typeof currentCard.example === 'string'
                        ? currentCard.example
                        : currentCard.example
                        ? `${currentCard.example.de || ''}${currentCard.example.de && currentCard.example.vi ? ' / ' : ''}${currentCard.example.vi || ''}`
                        : 'Không có ví dụ'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flashcard-navigation">
                <button
                  className="nav-button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  ← Trước
                </button>

                <button className="learned-button" onClick={handleMarkLearned}>
                  ✓ Đã học {learned.includes(currentCard._id) ? '(đã đánh dấu)' : ''}
                </button>

                <button
                  className="nav-button"
                  onClick={handleNext}
                  disabled={currentIndex === vocabulary.length - 1}
                >
                  Tiếp →
                </button>
              </div>

              <div className="learned-count">
                Đã ôn: {learned.length} / {vocabulary.length}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Flashcard
