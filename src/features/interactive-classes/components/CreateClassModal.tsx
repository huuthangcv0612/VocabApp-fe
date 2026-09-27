import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { ClassItem } from '../../../types/interactiveClass'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newClass: ClassItem) => void
}

export const CreateClassModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateClassModalProps) => {
  const { t } = useTranslation('interactive')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdClass, setCreatedClass] = useState<ClassItem | null>(null)

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('classes.modals.nameRequired', 'Vui lòng nhập tên lớp học'))
      return
    }

    setLoading(true)
    try {
      const cls = await interactiveClassService.createClass({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setCreatedClass(cls)
      toast.success(t('classes.modals.successCreated', 'Tạo lớp học thành công!'))
      onSuccess(cls)
    } catch (err: unknown) {
      console.error('Error creating class:', err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || t('classes.modals.createError', 'Lỗi tạo lớp học. Vui lòng thử lại!'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    const code = createdClass?.class_code || createdClass?.code || ''
    if (code) {
      navigator.clipboard.writeText(code)
      toast.success(t('classes.copyCodeSuccess', { code, defaultValue: 'Đã sao chép mã lớp!' }))
    }
  }

  const handleCopyLink = () => {
    const code = createdClass?.class_code || createdClass?.code || ''
    const link = `${window.location.origin}/interactive-room?joinCode=${encodeURIComponent(code)}`
    navigator.clipboard.writeText(link)
    toast.success(t('classes.copyLinkSuccess', 'Đã sao chép liên kết mời!'))
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setCreatedClass(null)
    onClose()
  }

  return (
    <div className="ic-modal-overlay" onClick={handleClose}>
      <div className="ic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ic-modal-header">
          <h2 className="ic-modal-title">
            {createdClass ? t('classes.modals.createdTitle', 'Lớp học đã tạo') : t('classes.modals.createTitle', 'Tạo lớp học mới')}
          </h2>
          <button type="button" className="ic-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {createdClass ? (
          <div>
            <p style={{ color: '#475569', marginBottom: '8px' }}>
              {t('classes.modals.createdShareDesc', { name: createdClass.name, defaultValue: `Lớp ${createdClass.name} đã được khởi tạo thành công. Hãy chia sẻ mã lớp hoặc liên kết mời cho học viên của bạn:` })}
            </p>

            <div className="ic-code-card">
              <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                {t('classes.classCode', 'MÃ LỚP HỌC (CLASS CODE)')}
              </div>
              <div className="ic-code-display">
                {createdClass.class_code || createdClass.code}
              </div>
              <div className="ic-code-actions">
                <button
                  type="button"
                  className="ic-btn ic-btn-secondary ic-btn-sm"
                  onClick={handleCopyCode}
                >
                  📋 {t('classes.copyCode', 'Sao chép mã')}
                </button>
                <button
                  type="button"
                  className="ic-btn ic-btn-outline ic-btn-sm"
                  onClick={handleCopyLink}
                >
                  🔗 {t('classes.inviteLink', 'Sao chép liên kết')}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="ic-btn ic-btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={handleClose}
            >
              {t('classes.modals.done', 'Hoàn tất')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate}>
            <div className="ic-form-group">
              <label className="ic-label" htmlFor="className">
                {t('classes.modals.className', 'Tên lớp học')} <span style={{ color: '#D90000' }}>*</span>
              </label>
              <input
                id="className"
                type="text"
                className="ic-input"
                placeholder={t('classes.modals.classNamePlaceholder', 'Ví dụ: Tiếng Đức Giao Tiếp A1.1')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="ic-form-group">
              <label className="ic-label" htmlFor="classDesc">
                {t('classes.modals.classDesc', 'Mô tả lớp học')}
              </label>
              <textarea
                id="classDesc"
                className="ic-textarea"
                placeholder={t('classes.modals.classDescPlaceholder', 'Nhập mục tiêu, lộ trình hoặc lưu ý cho học viên...')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="ic-btn ic-btn-outline"
                style={{ flex: 1 }}
                onClick={handleClose}
                disabled={loading}
              >
                {t('editor.cancel', 'Hủy')}
              </button>
              <button
                type="submit"
                className="ic-btn ic-btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? t('classes.modals.creating', 'Đang tạo...') : t('classes.modals.createBtn', 'Tạo lớp')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
