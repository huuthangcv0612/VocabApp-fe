import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { ClassStudent } from '../../../types/interactiveClass'

interface ClassStudentsTabProps {
  classId: string
  isTeacher?: boolean
}

export const ClassStudentsTab = ({ classId, isTeacher = false }: ClassStudentsTabProps) => {
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
      toast.error('Không thể tải danh sách học viên.')
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleRemove = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Xóa học viên "${studentName}" khỏi lớp học này?`)) {
      return
    }

    setRemovingId(studentId)
    try {
      await interactiveClassService.removeStudent(classId, studentId)
      toast.success(`Đã xóa học viên ${studentName} khỏi lớp`)
      setStudents((prev) => prev.filter((s) => (s._id || s.id || s.student_id) !== studentId))
    } catch (err: unknown) {
      console.error('Error removing student:', err)
      const errorObj = err as { response?: { data?: { message?: string } } }
      toast.error(errorObj?.response?.data?.message || 'Lỗi khi xóa học viên.')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
        <p>Đang tải danh sách học viên...</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="ic-empty-state">
        <div className="ic-empty-icon">👥</div>
        <h3>Chưa có học viên nào tham gia</h3>
        <p>
          {isTeacher
            ? 'Hãy gửi mã lớp hoặc liên kết mời cho học viên để họ tham gia lớp học này.'
            : 'Lớp học hiện tại chưa có thêm học viên nào.'}
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
              <th style={{ padding: '12px 16px' }}>HỌC VIÊN</th>
              <th style={{ padding: '12px 16px' }}>EMAIL</th>
              <th style={{ padding: '12px 16px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 16px' }}>NGÀY THAM GIA</th>
              {isTeacher && <th style={{ padding: '12px 16px', textAlign: 'right' }}>THAO TÁC</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const sId = student._id || student.id || student.student_id || `s_${idx}`
              return (
                <tr
                  key={sId}
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
                        {student.name ? student.name.charAt(0).toUpperCase() : 'H'}
                      </div>
                      <span>{student.name || 'Học viên'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px', color: '#475569' }}>
                    {student.email || '—'}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span
                      className={`ic-badge ${
                        student.status === 'inactive' ? 'ic-badge-outline' : 'ic-badge-active'
                      }`}
                    >
                      {student.status || 'Active'}
                    </span>
                  </td>

                  <td style={{ padding: '16px', color: '#64748B', fontSize: '0.9rem' }}>
                    {student.joined_at
                      ? new Date(student.joined_at).toLocaleDateString('vi-VN')
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
                        onClick={() => handleRemove(sId, student.name)}
                        disabled={removingId === sId}
                      >
                        {removingId === sId ? 'Đang xóa...' : 'Xóa học viên'}
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
