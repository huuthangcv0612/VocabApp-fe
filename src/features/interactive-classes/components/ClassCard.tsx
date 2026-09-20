import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import type { ClassItem } from '../../../types/interactiveClass'

interface ClassCardProps {
  cls: ClassItem
  isTeacher?: boolean
  canManage?: boolean
  onDelete?: (classId: string) => void
}

export const ClassCard = ({
  cls,
  isTeacher = false,
  canManage,
  onDelete,
}: ClassCardProps) => {
  const navigate = useNavigate()
  const isManager = canManage !== undefined ? canManage : isTeacher
  const classId = cls._id || cls.id || ''
  const code = cls.class_code || cls.code || ''

  const teacherName =
    cls.teacher_name ||
    (typeof cls.teacher_id === 'object' && cls.teacher_id !== null
      ? cls.teacher_id.name
      : 'Giáo viên')

  const studentsCount =
    typeof cls.students_count === 'number'
      ? cls.students_count
      : Array.isArray(cls.students)
      ? cls.students.length
      : 0

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (code) {
      navigator.clipboard.writeText(code)
      toast.success(`Đã chép mã lớp: ${code}`)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${cls.name}"?`)) {
      onDelete?.(classId)
    }
  }

  const hasActiveSession = Boolean(cls.active_session_id)

  return (
    <div className="ic-class-card" onClick={() => navigate(`/interactive-room/classes/${classId}`)}>
      <div>
        <div className="ic-class-card-header">
          <h3 className="ic-class-card-title">{cls.name}</h3>
          {hasActiveSession ? (
            <span className="ic-badge ic-badge-live">● ĐANG LIVE</span>
          ) : (
            <span className="ic-badge ic-badge-active">Hoạt động</span>
          )}
        </div>

        {cls.description && <p className="ic-class-card-desc">{cls.description}</p>}

        <div className="ic-class-card-meta">
          <div className="ic-class-card-meta-item">
            <span>👨‍🏫</span>
            <span>{teacherName}</span>
          </div>

          <div className="ic-class-card-meta-item">
            <span>👥</span>
            <span>{studentsCount} học viên</span>
          </div>

          {code && (
            <div
              className="ic-class-card-meta-item"
              onClick={handleCopyCode}
              style={{ cursor: 'pointer' }}
              title="Click để sao chép mã"
            >
              <span>🔑</span>
              <span className="ic-badge ic-badge-code">{code}</span>
            </div>
          )}
        </div>
      </div>

      <div className="ic-class-card-actions">
        {hasActiveSession && (
          <button
            type="button"
            className="ic-btn ic-btn-danger ic-btn-sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/interactive-room/session/${cls.active_session_id}`)
            }}
          >
            🔴 Vào phòng Live
          </button>
        )}

        <button
          type="button"
          className="ic-btn ic-btn-secondary ic-btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/interactive-room/classes/${classId}`)
          }}
        >
          {isManager ? 'Quản lý lớp' : 'Vào lớp'}
        </button>

        {isManager && onDelete && (
          <button
            type="button"
            className="ic-btn ic-btn-outline ic-btn-sm"
            style={{ color: '#EF4444', borderColor: '#FECACA' }}
            onClick={handleDelete}
            title="Xóa lớp học"
          >
            🗑️ Xóa
          </button>
        )}
      </div>
    </div>
  )
}
