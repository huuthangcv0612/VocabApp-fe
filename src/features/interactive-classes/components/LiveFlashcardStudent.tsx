import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { VocabularyItem } from '../../../types/vocabulary'

interface LiveFlashcardStudentProps {
  currentCard: VocabularyItem | null
  currentIndex: number
  totalCards: number
  showAnswer: boolean
  onToggleAnswer?: () => void
}

export const LiveFlashcardStudent = ({
  currentCard,
  currentIndex,
  totalCards,
  showAnswer,
  onToggleAnswer,
}: LiveFlashcardStudentProps) => {
  const { t } = useTranslation('interactive')
  const [localFlipped, setLocalFlipped] = useState(false)

  // Reset local flipped when index or card changes
  useEffect(() => {
    setLocalFlipped(false)
  }, [currentIndex, currentCard?._id, (currentCard as { id?: string })?.id])

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗂️</div>
        <h3>{t('interactiveRoom.flashcard.noVocab')}</h3>
      </div>
    )
  }

  const isRevealed = showAnswer || localFlipped
  const wordDisplay = currentCard.article
    ? `${currentCard.article} ${currentCard.word}`
    : currentCard.word

  const handleCardClick = () => {
    setLocalFlipped(!localFlipped)
    onToggleAnswer?.()
  }

  return (
    <div style={{ width: '100%', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
        {t('interactiveRoom.flashcard.card', {
          current: currentIndex + 1,
          total: totalCards || 1,
        })}
      </div>

      <div
        className="ic-live-card"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <SpeakerButton word={currentCard.word} />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
          {isRevealed
            ? t('interactiveRoom.flashcard.meaningAndExample')
            : t('interactiveRoom.flashcard.germanVocab')}
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
          <div style={{ animation: 'modalIn 0.3s ease-out' }}>
            <div className="ic-live-card-meaning">{currentCard.meaning}</div>
            {currentCard.example && (
              <div className="ic-live-card-example" style={{ marginTop: '16px' }}>
                <div>&ldquo;{currentCard.example}&rdquo;</div>
                {(currentCard.example_translation || currentCard.exampleMeaning) && (
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                    {currentCard.example_translation || currentCard.exampleMeaning}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              marginTop: '24px',
              fontStyle: 'italic',
            }}
          >
            {t('interactiveRoom.flashcard.flipHint')}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          type="button"
          className="ic-btn ic-btn-secondary"
          onClick={handleCardClick}
        >
          {isRevealed
            ? t('interactiveRoom.flashcard.hideAnswer')
            : t('interactiveRoom.flashcard.flipAnswer')}
        </button>
      </div>
    </div>
  )
}
