import { useTranslation } from 'react-i18next'
import { SpeakerButton } from '../../../components/SpeakerButton'
import type { VocabularyItem } from '../../../types/vocabulary'

interface LiveFlashcardStudentProps {
  currentCard: VocabularyItem | null
  currentIndex: number
  totalCards: number
  showAnswer: boolean
}

export const LiveFlashcardStudent = ({
  currentCard,
  currentIndex,
  totalCards,
  showAnswer,
}: LiveFlashcardStudentProps) => {
  const { t } = useTranslation('interactive')

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗂️</div>
        <h3>{t('interactiveRoom.flashcard.waitingTeacher')}</h3>
      </div>
    )
  }

  const wordDisplay = currentCard.article
    ? `${currentCard.article} ${currentCard.word}`
    : currentCard.word

  return (
    <div style={{ width: '100%', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '16px' }}>
        {t('interactiveRoom.flashcard.card', {
          current: currentIndex + 1,
          total: totalCards || 1,
        })}{' '}
        • {t('interactiveRoom.flashcard.controlledByTeacher')}
      </div>

      <div className="ic-live-card">
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <SpeakerButton word={currentCard.word} />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
          {showAnswer
            ? t('interactiveRoom.flashcard.meaning')
            : t('interactiveRoom.flashcard.word')}
        </div>

        <div className="ic-live-card-word" style={{ marginTop: '16px' }}>
          {wordDisplay}
        </div>

        {currentCard.pronunciation && (
          <div style={{ color: '#64748B', fontStyle: 'italic', marginBottom: '12px' }}>
            /{currentCard.pronunciation}/
          </div>
        )}

        {showAnswer ? (
          <div style={{ animation: 'modalIn 0.3s ease-out' }}>
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
          <div
            style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              marginTop: '24px',
              fontStyle: 'italic',
            }}
          >
            {t('interactiveRoom.flashcard.waitingFlipHint')}
          </div>
        )}
      </div>
    </div>
  )
}
