import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { InteractiveVocabulary } from '../../../types/vocabulary'

interface VocabularySearchAutocompleteProps {
  onSelectVocabulary: (vocab: InteractiveVocabulary) => void
  onOpenCreateModal: (keyword: string) => void
  existingIds?: string[]
}

export const VocabularySearchAutocomplete = ({
  onSelectVocabulary,
  onOpenCreateModal,
  existingIds = [],
}: VocabularySearchAutocompleteProps) => {
  const { t } = useTranslation('interactive')
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<InteractiveVocabulary[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Debounced search (300ms)
  useEffect(() => {
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      setHasSearched(false)
      setIsOpen(false)
      return
    }

    setLoading(true)
    setIsOpen(true)

    const timer = setTimeout(async () => {
      try {
        const list = await interactiveClassService.searchVocabulary(trimmed)
        setResults(list)
        setHasSearched(true)
      } catch (err) {
        console.error('Error searching vocabulary:', err)
        setResults([])
        setHasSearched(true)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleSelect = (vocab: InteractiveVocabulary) => {
    onSelectVocabulary(vocab)
    setSearchTerm('')
    setIsOpen(false)
    setResults([])
  }

  return (
    <div className="ic-autocomplete-container" ref={containerRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="ic-input"
          placeholder={t('vocabulary.searchPlaceholder', '🔍 Tìm kiếm từ vựng (ví dụ: Mutter, Apfel, Schule...)')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim()) setIsOpen(true)
          }}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setResults([])
              setIsOpen(false)
            }}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '4px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="ic-autocomplete-dropdown">
          {loading && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748B' }}>
              <span>{t('vocabulary.searching', 'Đang tìm kiếm từ vựng...')}</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  color: '#94A3B8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {t('vocabulary.searchResults', { count: results.length, defaultValue: `Kết quả tìm thấy (${results.length})` })}
              </div>
              {results.map((vocab) => {
                const vId = vocab._id || vocab.id || ''
                const isAlreadyAdded = existingIds.includes(vId)
                const displayWord = vocab.article
                  ? `${vocab.article} ${vocab.word}`
                  : vocab.word
                const isTeacherVocab = vocab.source === 'teacher'

                return (
                  <div
                    key={vId}
                    className="ic-autocomplete-item"
                    onClick={() => {
                      if (!isAlreadyAdded) handleSelect(vocab)
                    }}
                    style={{
                      opacity: isAlreadyAdded ? 0.5 : 1,
                      cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                      <div className="ic-autocomplete-word" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{displayWord}</span>
                        {isTeacherVocab ? (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              border: '1px solid #86EFAC',
                              padding: '1px 6px',
                              borderRadius: '6px',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {t('vocabulary.badgeTeacher', '👨‍🏫 My Vocabulary')}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              padding: '1px 6px',
                              borderRadius: '6px',
                              letterSpacing: '0.3px',
                            }}
                          >
                            {t('vocabulary.badgeSystem', '🌐 System')}
                          </span>
                        )}
                        {isAlreadyAdded && (
                          <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                            {t('vocabulary.alreadyAdded', '(Đã thêm)')}
                          </span>
                        )}
                      </div>
                      <div className="ic-autocomplete-meaning">{vocab.meaning}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {vocab.level && (
                        <span className="ic-autocomplete-level">{vocab.level}</span>
                      )}
                      {!isAlreadyAdded && (
                        <span style={{ color: '#2A63E8', fontWeight: 700, fontSize: '1.1rem' }}>
                          +
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ color: '#64748B', marginBottom: '12px' }}>
                {t('vocabulary.noResultsFound', { keyword: searchTerm, defaultValue: `Không tìm thấy từ vựng "${searchTerm}".` })}
              </div>
              <button
                type="button"
                className="ic-btn ic-btn-primary ic-btn-sm"
                onClick={() => {
                  setIsOpen(false)
                  onOpenCreateModal(searchTerm)
                }}
              >
                {t('vocabulary.createPrompt', { keyword: searchTerm, defaultValue: `+ Tạo mới từ vựng "${searchTerm}"` })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
