import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { InteractiveLesson } from '../../../types/interactiveClass'

interface ClassLessonsTabProps {
  classId: string
  isTeacher?: boolean
}

export const ClassLessonsTab = ({ classId, isTeacher = false }: ClassLessonsTabProps) => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<InteractiveLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    try {
      const list = await interactiveClassService.getLessons(classId)
      setLessons(list)
    } catch (err: unknown) {
      console.error('Error fetching interactive lessons:', err)
      toast.error('Không thể tải danh sách bài học tương tác.')
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  const handleDelete = async (lessonId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài học "${title}"?`)) {
      return
    }

    try {
      await interactiveClassService.deleteLesson(lessonId)
      toast.success('Đã xóa bài học!')
      setLessons((prev) => prev.filter((l) => (l._id || l.id) !== lessonId))
    } catch (err: unknown) {
      console.error('Error deleting lesson:', err)
      toast.error('Lỗi khi xóa bài học.')
    }
  }

  const handleStartSession = async (lessonId: string) => {
    setStartingSessionId(lessonId)
    try {
      const session = await interactiveClassService.createSession({
        class_id: classId,
        lesson_id: lessonId,
      })
      toast.success('Đã tạo phòng học Live! Đang chuyển hướng... 🚀')
      const sessId = session._id || session.id
      navigate(`/interactive-room/session/${sessId}`)
    } catch (err: unknown) {
      console.error('Error starting live session:', err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || 'Không thể bắt đầu phòng học live.')
    } finally {
      setStartingSessionId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
        <p>Đang tải danh sách bài học tương tác...</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {isTeacher && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            type="button"
            className="ic-btn ic-btn-primary"
            onClick={() => navigate(`/interactive-room/classes/${classId}/lessons/new`)}
          >
            + Tạo bài học tương tác mới
          </button>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="ic-empty-state">
          <div className="ic-empty-icon">📚</div>
          <h3>Chưa có bài học tương tác nào</h3>
          <p>
            {isTeacher
              ? 'Tạo bài học tương tác để thêm từ vựng, flashcard, trắc nghiệm và vòng quay từ vựng cho lớp.'
              : 'Giáo viên chưa tạo bài học tương tác nào cho lớp này.'}
          </p>
          {isTeacher && (
            <button
              type="button"
              className="ic-btn ic-btn-secondary"
              onClick={() => navigate(`/interactive-room/classes/${classId}/lessons/new`)}
            >
              Tạo bài học ngay
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {lessons.map((lesson) => {
            const lId = lesson._id || lesson.id || ''
            const vocabCount =
              typeof lesson.vocabulary_count === 'number'
                ? lesson.vocabulary_count
                : Array.isArray(lesson.vocabularies)
                ? lesson.vocabularies.length
                : 0

            const activityCount =
              typeof lesson.activity_count === 'number'
                ? lesson.activity_count
                : Array.isArray(lesson.activities)
                ? lesson.activities.length
                : 0

            const isPublished = lesson.status === 'published'

            return (
              <div
                key={lId}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4
                      style={{
                        margin: 0,
                        fontFamily: 'Oswald',
                        fontSize: '1.4rem',
                        color: '#0F172A',
                      }}
                    >
                      {lesson.title}
                    </h4>

                    {lesson.level && (
                      <span
                        className="ic-badge"
                        style={{ backgroundColor: '#EFF6FF', color: '#2A63E8' }}
                      >
                        {lesson.level}
                      </span>
                    )}

                    <span
                      className={`ic-badge ${
                        isPublished ? 'ic-badge-active' : 'ic-badge-code'
                      }`}
                    >
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {lesson.description && (
                    <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '0.95rem' }}>
                      {lesson.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#475569' }}>
                    <span>📖 <strong>{vocabCount}</strong> từ vựng</span>
                    <span>⚡ <strong>{activityCount}</strong> hoạt động</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {isTeacher && (
                    <>
                      <button
                        type="button"
                        className="ic-btn ic-btn-primary ic-btn-sm"
                        onClick={() => handleStartSession(lId)}
                        disabled={startingSessionId === lId}
                      >
                        {startingSessionId === lId ? 'Đang mở phòng...' : '▶ Start Class'}
                      </button>

                      <button
                        type="button"
                        className="ic-btn ic-btn-outline ic-btn-sm"
                        onClick={() =>
                          navigate(`/interactive-room/classes/${classId}/lessons/${lId}/edit`)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="ic-btn ic-btn-outline ic-btn-sm"
                        style={{ color: '#EF4444', borderColor: '#FECACA' }}
                        onClick={() => handleDelete(lId, lesson.title)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}

                  {!isTeacher && (
                    <span style={{ fontSize: '0.9rem', color: '#64748B', fontStyle: 'italic' }}>
                      Sẵn sàng cho buổi học trực tiếp cùng giáo viên
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
