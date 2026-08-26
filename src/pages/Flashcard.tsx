import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { SpeakerButton } from '../components/SpeakerButton'
import { useVocabulary } from '../hooks/useApi'
import { progressApi } from '../services/api'
import '../styles/pages/flashcard.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/effect-cards'

const Flashcard = () => {
  const { lektionId, lessonId } = useParams<{ lektionId?: string; lessonId?: string }>()
  const activeLessonId = lessonId || lektionId || ''
  const { vocabulary, loading, error } = useVocabulary(activeLessonId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learned, setLearned] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setLearned([])
    setIsCompleted(false)
  }, [activeLessonId])

  const currentCard = vocabulary[currentIndex]
  const learnedCount = learned.length
  const totalCount = vocabulary.length
  const calculatedPercentage = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      swiperRef.current?.slideNext()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      swiperRef.current?.slidePrev()
      setIsFlipped(false)
    }
  }

  const handleMarkLearned = async () => {
    if (!currentCard || !activeLessonId) return
    const cardId = currentCard._id
    
    let updatedLearned = learned
    if (!learned.includes(cardId)) {
      updatedLearned = [...learned, cardId]
      setLearned(updatedLearned)

      try {
        await progressApi.startLesson(activeLessonId)
      } catch (err) {
        console.error('Error starting/updating lesson progress:', err)
      }
    }

    if (updatedLearned.length >= totalCount && totalCount > 0 && !isCompleted) {
      setIsCompleted(true)
      try {
        await progressApi.completeLesson(activeLessonId)
        toast.success('Chúc mừng! Bạn đã hoàn thành Bài Học này! 🎉')
      } catch (err) {
        console.error('Error completing lesson:', err)
      }
    }

    handleNext()
  }

  return (
    <div className="flashcard-page">
      <Header />

      <main className="flashcard-main">
        <Link to={`/lessons/${activeLessonId}`} className="back-button">
          ← Quay lại bài học
        </Link>

        <div className="flashcard-container">
          {loading && <p>Đang tải từ vựng...</p>}
          {error && <p className="error">Lỗi: {error}</p>}
          {!loading && !error && vocabulary.length === 0 && (
            <p className="status-text">Không tìm thấy từ vựng cho bài học này.</p>
          )}

          {vocabulary.length > 0 && currentCard && (
            <>
              {/* Bước 4: Progress Indicator */}
              <div className="progress-section">
                <div className="progress-text" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Thẻ {currentIndex + 1} / {vocabulary.length} ({learnedCount} / {vocabulary.length} đã học)
                  </span>
                  <span>{calculatedPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${calculatedPercentage === 100 ? 'completed' : ''}`}
                    style={{ width: `${calculatedPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flashcard-area">
                <Swiper
                  effect="cards"
                  grabCursor={true}
                  modules={[EffectCards]}
                  slidesPerView={1}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper
                  }}
                  onSlideChange={(swiper) => {
                    setCurrentIndex(swiper.activeIndex)
                    setIsFlipped(false)
                  }}
                  className="flashcard-swiper"
                >
                  {vocabulary.map((card, index) => (
                    <SwiperSlide key={card._id}>
                      <div
                        className={`flashcard ${isFlipped && index === currentIndex ? 'flipped' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <div className="flashcard-front">
                          <span className="card-label">WORT</span>
                          <div className="card-content-row">
                            <div className="card-content">{card.word}</div>
                            <SpeakerButton word={card.word} />
                          </div>
                        </div>

                        <div className="flashcard-back">
                          <span className="card-label">BEDEUTUNG</span>
                          <div className="card-meaning">{card.meaning}</div>
                          <div className="card-example">
                            {typeof card.example === 'string'
                              ? card.example
                              : card.example
                              ? `${card.example.de || ''}${card.example.de && card.example.vi ? ' / ' : ''}${card.example.vi || ''}`
                              : 'Không có ví dụ'}
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="flashcard-navigation">
                <button
                  className="nav-button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  ← Zurück
                </button>

                <button className="learned-button" onClick={handleMarkLearned}>
                  {learned.includes(currentCard._id) ? "✓ Gelernt" : "Als gelernt markieren"}
                </button>

                <button
                  className="nav-button"
                  onClick={handleNext}
                  disabled={currentIndex === vocabulary.length - 1}
                >
                  Weiter →
                </button>
              </div>

              <div className="learned-count" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                <span>Đã ôn: {learned.length} / {vocabulary.length}</span>
                {isCompleted && (
                  <span style={{ color: '#00C853', fontWeight: 'bold' }}>✓ Hoàn thành 100%</span>
                )}
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
