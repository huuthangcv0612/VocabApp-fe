import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { ClassItem } from '../../../types/interactiveClass'

interface JoinClassModalProps {
  isOpen: boolean
  initialCode?: string
  onClose: () => void
  onSuccess: (joinedClass?: ClassItem) => void
}

export const JoinClassModal = ({
  isOpen,
  initialCode = '',
  onClose,
  onSuccess,
}: JoinClassModalProps) => {
  const [code, setCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      toast.error('Vui lòng nhập mã lớp học')
      return
    }

    setLoading(true)
    try {
      const res = await interactiveClassService.joinClass({ class_code: trimmed })
      toast.success(res.message || 'Tham gia lớp học thành công! 🎉')
      onSuccess(res.class)
      onClose()
    } catch (err: unknown) {
      console.error('Error joining class:', err)
      const errorObj = err as { response?: { data?: { message?: string; error?: string } } }
      const errorMsg =
        errorObj?.response?.data?.message ||
        errorObj?.response?.data?.error ||
        'Mã lớp không hợp lệ hoặc đã xảy ra lỗi.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ic-modal-overlay" onClick={onClose}>
      <div className="ic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ic-modal-header">
          <h2 className="ic-modal-title">Tham gia lớp học</h2>
          <button type="button" className="ic-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleJoin}>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '16px' }}>
            Nhập mã lớp học (Class Code) do giáo viên cung cấp để tham gia lớp và học trực tiếp cùng lớp.
          </p>

          <div className="ic-form-group">
            <label className="ic-label" htmlFor="joinCode">
              Mã lớp học (Class Code)
            </label>
            <input
              id="joinCode"
              type="text"
              className="ic-input"
              style={{
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                fontSize: '1.3rem',
                letterSpacing: '2px',
                textAlign: 'center',
              }}
              placeholder="VD: DEUTSCH12"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
              required
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
              className="ic-btn ic-btn-secondary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? 'Đang tham gia...' : 'Tham gia lớp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
