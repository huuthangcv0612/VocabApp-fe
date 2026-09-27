import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { ClassStudent } from '../../../types/interactiveClass'

interface ClassStudentsTabProps {
  classId: string
  isTeacher?: boolean
}

export const ClassStudentsTab = ({ classId, isTeacher = false }: ClassStudentsTabProps) => {
  const { t } = useTranslation('interactive')
  const [students, setStudents] = useState<ClassStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const list = await interactiveClassService.getClassStudents(classId)
      setStudents(list)
    } catch (err: unknown) {
      console.error('Error fetching students:', err)
      toast.error(t('classes.studentsTab.loadError', 'Không thể tải danh sách học viên.'))
    } finally {
      setLoading(false)
    }
  }, [classId, t])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleRemove = async (student: ClassStudent) => {
    const studentUser = (student.user as Record<string, unknown>) || {}
    const removalId = String(
      student.student_id ??
      student._id ??
      student.id ??
      student.membership_id ??
      studentUser._id ??
      studentUser.id ??
      ''
    ).trim()

    if (!removalId) {
      toast.error(t('classes.studentsTab.notFoundId', 'Không tìm thấy ID học viên để xóa.'))
      return
    }

    const studentName = (student.name || (studentUser.name as string) || '').trim() || t('interactiveRoom.quiz.student', 'Học viên')
    if (!window.confirm(t('classes.studentsTab.removeConfirm', { name: studentName, defaultValue: `Xóa học viên "${studentName}" khỏi lớp học này?` }))) {
      return
    }

    setRemovingId(removalId)
    try {
      await interactiveClassService.removeStudent(classId, removalId)
      toast.success(t('classes.studentsTab.removeSuccess', { name: studentName, defaultValue: `Đã xóa học viên ${studentName} khỏi lớp` }))
      setStudents((prev) =>
        prev.filter((s) => {
          const u = (s.user as Record<string, unknown>) || {}
          const id = String(s.student_id ?? s._id ?? s.id ?? s.membership_id ?? u._id ?? u.id ?? '').trim()
          return id !== removalId
        }),
      )
    } catch (err: unknown) {
      console.error('Error removing student:', err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || t('classes.studentsTab.removeError', 'Lỗi khi xóa học viên.'))
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
        <p>{t('classes.studentsTab.loadingList', 'Đang tải danh sách học viên...')}</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="ic-empty-state">
        <div className="ic-empty-icon">👥</div>
        <h3>{t('classes.studentsTab.emptyTitle', 'Chưa có học viên nào tham gia')}</h3>
        <p>
          {isTeacher
            ? t('classes.studentsTab.emptyTeacher', 'Hãy gửi mã lớp hoặc liên kết mời cho học viên để họ tham gia lớp học này.')
            : t('classes.studentsTab.emptyStudent', 'Lớp học hiện tại chưa có thêm học viên nào.')}
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
          }}
        >
          <thead>
            <tr style={{ color: '#64748B', textAlign: 'left', fontSize: '0.9rem' }}>
              <th style={{ padding: '12px 16px' }}>{t('classes.studentsTab.colStudent', 'HỌC VIÊN')}</th>
              <th style={{ padding: '12px 16px' }}>{t('classes.studentsTab.colEmail', 'EMAIL')}</th>
              <th style={{ padding: '12px 16px' }}>{t('classes.studentsTab.colStatus', 'TRẠNG THÁI')}</th>
              <th style={{ padding: '12px 16px' }}>{t('classes.studentsTab.colJoined', 'NGÀY THAM GIA')}</th>
              {isTeacher && <th style={{ padding: '12px 16px', textAlign: 'right' }}>{t('classes.studentsTab.colAction', 'THAO TÁC')}</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const studentUser = (student.user as Record<string, unknown>) || {}
              const studentName = (student.name || (studentUser.name as string) || '').trim() || t('interactiveRoom.quiz.student', 'Học viên')
              const studentEmail = (student.email || (studentUser.email as string) || '').trim() || '—'
              const studentAvatar = student.avatar || (studentUser.avatar as string)
              const studentJoinedAt = student.joined_at || (studentUser.joined_at as string) || (studentUser.created_at as string)
              const studentStatus = student.status || (studentUser.status as string) || 'Active'

              const sId = String(
                student.student_id ??
                student._id ??
                student.id ??
                student.membership_id ??
                studentUser._id ??
                studentUser.id ??
                ''
              ).trim()

              const rowKey = sId || `student_row_${idx}`

              return (
                <tr
                  key={rowKey}
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    borderRadius: '12px',
                  }}
                >
                  <td
                    style={{
                      padding: '16px',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {studentAvatar ? (
                        <img
                          src={studentAvatar}
                          alt={studentName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#E0E7FF',
                            color: '#4338CA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{studentName}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px', color: '#475569' }}>
                    {studentEmail}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span
                      className={`ic-badge ${
                        studentStatus.toLowerCase() === 'inactive' ? 'ic-badge-outline' : 'ic-badge-active'
                      }`}
                    >
                      {studentStatus}
                    </span>
                  </td>

                  <td style={{ padding: '16px', color: '#64748B', fontSize: '0.9rem' }}>
                    {studentJoinedAt
                      ? new Date(studentJoinedAt).toLocaleDateString('vi-VN')
                      : '—'}
                  </td>

                  {isTeacher && (
                    <td
                      style={{
                        padding: '16px',
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                        textAlign: 'right',
                      }}
                    >
                      <button
                        type="button"
                        className="ic-btn ic-btn-outline ic-btn-sm"
                        style={{ color: '#EF4444', borderColor: '#FECACA' }}
                        onClick={() => handleRemove(student)}
                        disabled={removingId === sId}
                      >
                        {removingId === sId ? t('classes.studentsTab.removing', 'Đang xóa...') : t('classes.studentsTab.removeStudent', 'Xóa học viên')}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
