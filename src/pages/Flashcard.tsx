import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import '../styles/pages/flashcard.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/effect-cards'

const Flashcard = () => {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learned, setLearned] = useState<string[]>([])
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setLearned([])
  }, [lektionId])

  const currentCard = vocabulary[currentIndex]
  const progress = vocabulary.length > 0 ? ((currentIndex + 1) / vocabulary.length) * 100 : 0

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
                          <div className="card-content">{card.word}</div>
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
