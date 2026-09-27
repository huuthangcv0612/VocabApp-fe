import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { InteractiveVocabulary } from '../../../types/vocabulary'

interface CreateVocabularyModalProps {
  isOpen: boolean
  initialWord?: string
  initialLevel?: string
  onClose: () => void
  onSuccess: (newVocab: InteractiveVocabulary) => void
}

export const CreateVocabularyModal = ({
  isOpen,
  initialWord = '',
  initialLevel = 'A1.1',
  onClose,
  onSuccess,
}: CreateVocabularyModalProps) => {
  const { t } = useTranslation('interactive')
  const [word, setWord] = useState('')
  const [article, setArticle] = useState<'der' | 'die' | 'das' | ''>('')
  const [plural, setPlural] = useState('')
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
      setPlural('')
      setArticle('')
      setMeaning('')
      setPronunciation('')
      setExampleDe('')
      setExampleVi('')
      setPartOfSpeech('noun')
      setLevel(initialLevel || 'A1.1')
    }
  }, [isOpen, initialWord, initialLevel])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !meaning.trim()) {
      toast.error(t('vocabulary.requiredField', 'Vui lòng nhập từ vựng và nghĩa tiếng Việt'))
      return
    }

    setLoading(true)
    try {
      // Backend automatically retrieves teacher_id from authenticated session.
      // Do NOT send teacher_id in payload.
      const created = await interactiveClassService.createTeacherVocabulary({
        word: word.trim(),
        article: article || undefined,
        plural: plural.trim() || undefined,
        meaning: meaning.trim(),
        level,
        pronunciation: pronunciation.trim() || undefined,
        partOfSpeech,
        example: exampleDe.trim() || undefined,
        exampleMeaning: exampleVi.trim() || undefined,
      })

      toast.success(
        t('vocabulary.createSuccess', {
          word: created.word,
          defaultValue: `Đã tạo từ vựng "${created.word}" thành công!`,
        }),
      )
      onSuccess({
        ...created,
        source: 'teacher',
      })
      onClose()
    } catch (err: unknown) {
      console.error('Error creating teacher vocabulary:', err)
      const errorObj = err as {
        response?: {
          status?: number
          data?: {
            message?: string
            source?: 'system' | 'teacher'
            vocabulary?: InteractiveVocabulary
            data?: InteractiveVocabulary
          }
        }
      }
      const status = errorObj?.response?.status
      const resData = errorObj?.response?.data
      const errorMsg = resData?.message || ''

      if (status === 409) {
        const isSystem =
          resData?.source === 'system' ||
          errorMsg.toLowerCase().includes('hệ thống') ||
          errorMsg.toLowerCase().includes('system') ||
          errorMsg.toLowerCase().includes('master')

        const duplicateText = isSystem
          ? t('vocabulary.alreadyExistsSystem', 'Từ này đã tồn tại trong kho từ vựng hệ thống.')
          : t('vocabulary.alreadyExistsTeacher', 'Từ này đã có trong kho từ vựng của bạn.')

        toast.error(duplicateText)

        // If backend returned the existing vocabulary in response, auto-select it immediately
        const existingVocab = resData?.vocabulary || resData?.data
        if (existingVocab && existingVocab.word) {
          const normalized: InteractiveVocabulary = {
            ...existingVocab,
            _id: String(existingVocab._id || existingVocab.id || ''),
            id: String(existingVocab._id || existingVocab.id || ''),
            source: isSystem ? 'system' : 'teacher',
          }
          onSuccess(normalized)
          onClose()
          return
        }
      } else {
        toast.error(
          errorMsg ||
            t('vocabulary.createError', 'Lỗi khi tạo từ vựng. Vui lòng thử lại!'),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ic-modal-overlay" onClick={onClose}>
      <div className="ic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ic-modal-header">
          <h2 className="ic-modal-title">
            {t('vocabulary.modalTitle', 'Tạo mới từ vựng')}
          </h2>
          <button type="button" className="ic-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px' }}>
            <div className="ic-form-group">
              <label className="ic-label">{t('vocabulary.article', 'Quán từ')}</label>
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
                {t('vocabulary.word', 'Từ vựng (Tiếng Đức)')}{' '}
                <span style={{ color: '#D90000' }}>*</span>
              </label>
              <input
                type="text"
                className="ic-input"
                placeholder={t('vocabulary.wordPlaceholder', 'VD: Wanderschuhe, Mutter...')}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ic-form-group">
              <label className="ic-label">{t('vocabulary.plural', 'Dạng số nhiều')}</label>
              <input
                type="text"
                className="ic-input"
                placeholder={t('vocabulary.pluralPlaceholder', 'VD: die Wanderschuhe')}
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
              />
            </div>

            <div className="ic-form-group">
              <label className="ic-label">
                {t('vocabulary.meaning', 'Nghĩa tiếng Việt')}{' '}
                <span style={{ color: '#D90000' }}>*</span>
              </label>
              <input
                type="text"
                className="ic-input"
                placeholder={t('vocabulary.meaningPlaceholder', 'VD: giày đi bộ đường dài')}
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="ic-form-group">
              <label className="ic-label">{t('vocabulary.level', 'Cấp độ (Level)')}</label>
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
              <label className="ic-label">{t('vocabulary.partOfSpeech', 'Loại từ')}</label>
              <select
                className="ic-select"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
              >
                <option value="noun">{t('vocabulary.partOfSpeechNoun', 'Danh từ (Noun)')}</option>
                <option value="verb">{t('vocabulary.partOfSpeechVerb', 'Động từ (Verb)')}</option>
                <option value="adjective">{t('vocabulary.partOfSpeechAdjective', 'Tính từ (Adjective)')}</option>
                <option value="adverb">{t('vocabulary.partOfSpeechAdverb', 'Phó từ (Adverb)')}</option>
                <option value="phrase">{t('vocabulary.partOfSpeechPhrase', 'Cụm từ (Phrase)')}</option>
              </select>
            </div>
          </div>

          <div className="ic-form-group">
            <label className="ic-label">{t('vocabulary.pronunciation', 'Phiên âm (Pronunciation)')}</label>
            <input
              type="text"
              className="ic-input"
              placeholder={t('vocabulary.pronunciationPlaceholder', 'VD: [ˈvandɐˌʃuːə]')}
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </div>

          <div className="ic-form-group">
            <label className="ic-label">{t('vocabulary.example', 'Ví dụ câu (Tiếng Đức)')}</label>
            <input
              type="text"
              className="ic-input"
              placeholder={t('vocabulary.examplePlaceholder', 'VD: Ich brauche neue Wanderschuhe.')}
              value={exampleDe}
              onChange={(e) => setExampleDe(e.target.value)}
            />
          </div>

          <div className="ic-form-group">
            <label className="ic-label">{t('vocabulary.exampleMeaning', 'Dịch nghĩa câu ví dụ')}</label>
            <input
              type="text"
              className="ic-input"
              placeholder={t('vocabulary.exampleMeaningPlaceholder', 'VD: Tôi cần một đôi giày đi bộ đường dài mới.')}
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
              {t('vocabulary.cancel', 'Hủy')}
            </button>
            <button
              type="submit"
              className="ic-btn ic-btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading
                ? t('vocabulary.saving', 'Đang tạo...')
                : t('vocabulary.saveBtn', 'Lưu từ vựng')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
