import { useState } from 'react'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { VocabularyItem } from '../../../types/vocabulary'

interface LiveFlashcardTeacherProps {
  vocabularyList: VocabularyItem[]
  currentIndex: number
  showAnswer: boolean
  onNext: () => void
  onPrev: () => void
  onToggleAnswer: () => void
}

export const LiveFlashcardTeacher = ({
  vocabularyList,
  currentIndex,
  showAnswer,
  onNext,
  onPrev,
  onToggleAnswer,
}: LiveFlashcardTeacherProps) => {
  const [localFlipped, setLocalFlipped] = useState(false)
  const currentCard = vocabularyList[currentIndex]

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
        <h3>Chưa có từ vựng cho hoạt động Flashcard này.</h3>
      </div>
    )
  }

  const isRevealed = showAnswer || localFlipped
  const wordDisplay = currentCard.article
    ? `${currentCard.article} ${currentCard.word}`
    : currentCard.word

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '16px' }}>
        Thẻ <strong>{currentIndex + 1}</strong> / {vocabularyList.length}
      </div>

      <div
        className="ic-live-card"
        onClick={() => {
          setLocalFlipped(!localFlipped)
          onToggleAnswer()
        }}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <SpeakerButton word={currentCard.word} />
        </div>

        <div style={{ fontSize: '0.9rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
          {isRevealed ? 'NGHĨA & VÍ DỤ' : 'TỪ VỰNG TIẾNG ĐỨC'}
        </div>

        <div className="ic-live-card-word" style={{ marginTop: '16px' }}>
          {wordDisplay}
        </div>

        {currentCard.pronunciation && (
          <div style={{ color: '#64748B', fontStyle: 'italic', marginBottom: '12px' }}>
            /{currentCard.pronunciation}/
          </div>
        )}

        {isRevealed ? (
          <div>
            <div className="ic-live-card-meaning">{currentCard.meaning}</div>
            {currentCard.example && (
              <div className="ic-live-card-example" style={{ marginTop: '16px' }}>
                <div>&ldquo;{currentCard.example}&rdquo;</div>
                {currentCard.example_translation && (
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                    {currentCard.example_translation}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '20px' }}>
            (Chạm hoặc nhấn &ldquo;Lật thẻ / Hiện đáp án&rdquo; để mở nghĩa)
          </div>
        )}
      </div>

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
          className="ic-btn ic-btn-outline"
          onClick={onPrev}
          disabled={currentIndex <= 0}
        >
          ← Thẻ trước
        </button>

        <button
          type="button"
          className="ic-btn ic-btn-secondary"
          onClick={() => {
            setLocalFlipped(!localFlipped)
            onToggleAnswer()
          }}
        >
          🔄 {isRevealed ? 'Ẩn nghĩa' : 'Lật thẻ / Hiện đáp án'}
        </button>

        <button
          type="button"
          className="ic-btn ic-btn-primary"
          onClick={onNext}
          disabled={currentIndex >= vocabularyList.length - 1}
        >
          Thẻ tiếp theo →
        </button>
      </div>
    </div>
  )
}
