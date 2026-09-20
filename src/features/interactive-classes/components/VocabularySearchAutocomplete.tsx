import { useState, useEffect, useRef } from 'react'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { VocabularyItem } from '../../../types/vocabulary'

interface VocabularySearchAutocompleteProps {
  onSelectVocabulary: (vocab: VocabularyItem) => void
  onOpenCreateModal: (keyword: string) => void
  existingIds?: string[]
}

export const VocabularySearchAutocomplete = ({
  onSelectVocabulary,
  onOpenCreateModal,
  existingIds = [],
}: VocabularySearchAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Debounced search
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

  const handleSelect = (vocab: VocabularyItem) => {
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
          placeholder="🔍 Tìm kiếm từ vựng (ví dụ: Mutter, Apfel, Schule...)"
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
              <span>Đang tìm kiếm từ vựng...</span>
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
                Kết quả tìm thấy ({results.length})
              </div>
              {results.map((vocab) => {
                const vId = vocab._id || (vocab as { id?: string }).id || ''
                const isAlreadyAdded = existingIds.includes(vId)
                const displayWord = vocab.article
                  ? `${vocab.article} ${vocab.word}`
                  : vocab.word

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
                    <div>
                      <div className="ic-autocomplete-word">
                        {displayWord}{' '}
                        {isAlreadyAdded && (
                          <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                            (Đã thêm)
                          </span>
                        )}
                      </div>
                      <div className="ic-autocomplete-meaning">{vocab.meaning}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                Không tìm thấy từ vựng &ldquo;<strong>{searchTerm}</strong>&rdquo;.
              </div>
              <button
                type="button"
                className="ic-btn ic-btn-primary ic-btn-sm"
                onClick={() => {
                  setIsOpen(false)
                  onOpenCreateModal(searchTerm)
                }}
              >
                + Tạo mới từ vựng &ldquo;{searchTerm}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
