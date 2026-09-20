import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { VocabularyItem } from '../../../types/vocabulary'

interface CreateVocabularyModalProps {
  isOpen: boolean
  initialWord?: string
  initialLevel?: string
  onClose: () => void
  onSuccess: (newVocab: VocabularyItem) => void
}

export const CreateVocabularyModal = ({
  isOpen,
  initialWord = '',
  initialLevel = 'A1.1',
  onClose,
  onSuccess,
}: CreateVocabularyModalProps) => {
  const [word, setWord] = useState('')
  const [article, setArticle] = useState<'der' | 'die' | 'das' | ''>('')
  const [meaning, setMeaning] = useState('')
  const [level, setLevel] = useState('A1.1')
  const [pronunciation, setPronunciation] = useState('')
  const [exampleDe, setExampleDe] = useState('')
  const [exampleVi, setExampleVi] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('noun')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setWord(initialWord)
      setLevel(initialLevel || 'A1.1')
    }
  }, [isOpen, initialWord, initialLevel])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !meaning.trim()) {
      toast.error('Vui lòng nhập từ vựng và nghĩa tiếng Việt')
      return
    }

    setLoading(true)
    try {
      const created = await interactiveClassService.createVocabulary({
        word: word.trim(),
        article: article || undefined,
        meaning: meaning.trim(),
        level,
        pronunciation: pronunciation.trim() || undefined,
        part_of_speech: partOfSpeech,
        example: exampleDe.trim() || undefined,
        example_translation: exampleVi.trim() || undefined,
      })

      toast.success(`Đã tạo từ vựng "${created.word}" thành công!`)
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      console.error('Error creating vocabulary:', err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || 'Lỗi khi tạo từ vựng. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ic-modal-overlay" onClick={onClose}>
      <div className="ic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ic-modal-header">
          <h2 className="ic-modal-title">Tạo mới từ vựng</h2>
          <button type="button" className="ic-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <div className="ic-form-group">
              <label className="ic-label">Quán từ</label>
              <select
                className="ic-select"
                value={article}
                onChange={(e) => setArticle(e.target.value as 'der' | 'die' | 'das' | '')}
              >
                <option value="">—</option>
                <option value="der">der</option>
                <option value="die">die</option>
                <option value="das">das</option>
              </select>
            </div>

            <div className="ic-form-group">
              <label className="ic-label">
                Từ vựng (Tiếng Đức) <span style={{ color: '#D90000' }}>*</span>
              </label>
              <input
                type="text"
                className="ic-input"
                placeholder="VD: Mutter, Buch..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="ic-form-group">
            <label className="ic-label">
              Nghĩa tiếng Việt <span style={{ color: '#D90000' }}>*</span>
            </label>
            <input
              type="text"
              className="ic-input"
              placeholder="VD: Người mẹ"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ic-form-group">
              <label className="ic-label">Cấp độ (Level)</label>
              <select
                className="ic-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="A1.1">A1.1</option>
                <option value="A1.2">A1.2</option>
                <option value="A2.1">A2.1</option>
                <option value="A2.2">A2.2</option>
                <option value="B1.1">B1.1</option>
                <option value="B1.2">B1.2</option>
              </select>
            </div>

            <div className="ic-form-group">
              <label className="ic-label">Loại từ</label>
              <select
                className="ic-select"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
              >
                <option value="noun">Danh từ (Noun)</option>
                <option value="verb">Động từ (Verb)</option>
                <option value="adjective">Tính từ (Adjective)</option>
                <option value="adverb">Phó từ (Adverb)</option>
                <option value="phrase">Cụm từ (Phrase)</option>
              </select>
            </div>
          </div>

          <div className="ic-form-group">
            <label className="ic-label">Phiên âm (Pronunciation)</label>
            <input
              type="text"
              className="ic-input"
              placeholder="VD: [ˈmʊtɐ]"
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div className="ic-form-group">
            <label className="ic-label">Ví dụ câu (Tiếng Đức)</label>
            <input
              type="text"
              className="ic-input"
              placeholder="VD: Meine Mutter kocht sehr gut."
              value={exampleDe}
              onChange={(e) => setExampleDe(e.target.value)}
            />
          </div>

          <div className="ic-form-group">
            <label className="ic-label">Dịch nghĩa câu ví dụ</label>
            <input
              type="text"
              className="ic-input"
              placeholder="VD: Mẹ tôi nấu ăn rất ngon."
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="ic-btn ic-btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Lưu từ vựng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
