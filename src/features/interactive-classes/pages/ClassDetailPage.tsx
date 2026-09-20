import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAuth } from '../../../contexts/AuthContext'
import { useSubscription } from '../../../hooks/useSubscription'
import {
  checkInteractivePermissions,
  checkClassOwnership,
} from '../../../utils/interactivePermissions'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { ClassItem } from '../../../types/interactiveClass'
import { ClassStudentsTab } from '../components/ClassStudentsTab'
import { ClassLessonsTab } from '../components/ClassLessonsTab'
import '../../../styles/pages/interactive-classes.css'

export const ClassDetailPage = () => {
  const { classId = '' } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscription } = useSubscription()

  const permissions = checkInteractivePermissions(user, subscription)
  const [cls, setCls] = useState<ClassItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'lessons' | 'live'>('overview')

  const fetchClass = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    try {
      const data = await interactiveClassService.getClassById(classId)
      setCls(data)
    } catch (err: unknown) {
      console.error('Error fetching class details:', err)
      toast.error('Không tìm thấy thông tin lớp học.')
      navigate('/interactive-room')
    } finally {
      setLoading(false)
    }
  }, [classId, navigate])

  useEffect(() => {
    fetchClass()
  }, [fetchClass])

  const { canManageThisClass } = checkClassOwnership(user, cls, permissions)
  const isTeacher = canManageThisClass

  const code = cls?.class_code || cls?.code || ''

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      toast.success(`Đã sao chép mã lớp: ${code}`)
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/interactive-room?joinCode=${encodeURIComponent(code)}`
    navigator.clipboard.writeText(link)
    toast.success('Đã sao chép liên kết mời học viên!')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '4rem 0', textAlign: 'center', color: '#64748B' }}>
          <p>Đang tải thông tin lớp học...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!cls) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '4rem 0', textAlign: 'center' }}>
          <h2>Không tìm thấy lớp học</h2>
          <button
            type="button"
            className="ic-btn ic-btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/interactive-room')}
          >
            Quay lại danh sách lớp
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0 5rem', backgroundColor: '#F8FAFC' }}>
        <div className="ic-container">
          {/* Breadcrumb / Back button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={() => navigate('/interactive-room')}
            >
              ← Quay lại danh sách lớp
            </button>
          </div>

          {/* Class Header Banner */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1
                  style={{
                    fontFamily: 'Oswald',
                    fontSize: '2.4rem',
                    color: '#0F172A',
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  {cls.name}
                </h1>

                {cls.active_session_id ? (
                  <span className="ic-badge ic-badge-live">● ĐANG LIVE</span>
                ) : (
                  <span className="ic-badge ic-badge-active">Hoạt động</span>
                )}
              </div>

              {cls.description && (
                <p style={{ color: '#64748B', fontSize: '1.05rem', margin: '0 0 16px 0', maxWidth: '750px' }}>
                  {cls.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.95rem', color: '#475569' }}>
                <span>
                  👨‍🏫 Giáo viên:{' '}
                  <strong>
                    {cls.teacher_name ||
                      (typeof cls.teacher_id === 'object' && cls.teacher_id !== null
                        ? cls.teacher_id.name
                        : 'Giáo viên')}
                  </strong>
                </span>
                <span>
                  👥 Học viên:{' '}
                  <strong>
                    {typeof cls.students_count === 'number'
                      ? cls.students_count
                      : cls.students?.length || 0}
                  </strong>
                </span>
              </div>
            </div>

            {/* Class Code Action Card */}
            {code && (
              <div
                style={{
                  background: '#EFF6FF',
                  border: '2px dashed #3B82F6',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
                  MÃ LỚP HỌC (CLASS CODE)
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    color: '#1E40AF',
                    margin: '6px 0 10px',
                  }}
                >
                  {code}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ic-btn ic-btn-secondary ic-btn-sm"
                    onClick={handleCopyCode}
                  >
                    📋 Chép mã
                  </button>
                  <button
                    type="button"
                    className="ic-btn ic-btn-outline ic-btn-sm"
                    onClick={handleCopyLink}
                  >
                    🔗 Link mời
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="ic-tabs">
            <button
              type="button"
              className={`ic-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Tổng quan
            </button>
            <button
              type="button"
              className={`ic-tab ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Bài học tương tác
            </button>
            <button
              type="button"
              className={`ic-tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Học viên ({typeof cls.students_count === 'number' ? cls.students_count : cls.students?.length || 0})
            </button>
            <button
              type="button"
              className={`ic-tab ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              Phòng học Live {cls.active_session_id && '🔴'}
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <h3 style={{ fontFamily: 'Oswald', fontSize: '1.4rem', color: '#0F172A', marginTop: 0 }}>
                  Thông tin chung
                </h3>
                <p style={{ color: '#64748B', lineHeight: '1.6' }}>
                  {cls.description || 'Lớp học chưa có mô tả chi tiết.'}
                </p>

                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="ic-btn ic-btn-secondary ic-btn-sm"
                    onClick={() => setActiveTab('lessons')}
                  >
                    Xem bài học tương tác →
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <h3 style={{ fontFamily: 'Oswald', fontSize: '1.4rem', color: '#0F172A', marginTop: 0 }}>
                  Trạng thái phòng Live
                </h3>

                {cls.active_session_id ? (
                  <div>
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        marginBottom: '16px',
                      }}
                    >
                      <strong style={{ color: '#DC2626' }}>🔴 Buổi học Live đang diễn ra!</strong>
                      <p style={{ margin: '4px 0 0', color: '#7F1D1D', fontSize: '0.9rem' }}>
                        Giáo viên đang mở phòng học tương tác thời gian thực cho lớp này.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="ic-btn ic-btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/interactive-room/session/${cls.active_session_id}`)}
                    >
                      🔴 Tham gia buổi học Live ngay
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
                      Hiện tại chưa có phòng Live nào đang mở cho lớp học này.
                    </p>
                    {isTeacher && (
                      <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                        👉 Chuyển sang tab <strong>&ldquo;Bài học tương tác&rdquo;</strong> và chọn <strong>&ldquo;Start Class&rdquo;</strong> để bắt đầu giảng dạy trực tiếp!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LESSONS */}
          {activeTab === 'lessons' && <ClassLessonsTab classId={classId} isTeacher={isTeacher} />}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'students' && <ClassStudentsTab classId={classId} isTeacher={isTeacher} />}

          {/* TAB 4: LIVE SESSION */}
          {activeTab === 'live' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '36px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                maxWidth: '680px',
                margin: '0 auto',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔴</div>
              <h3 style={{ fontFamily: 'Oswald', fontSize: '2rem', color: '#0F172A', margin: '0 0 8px' }}>
                Phòng Học Trực Tiếp (Live Session)
              </h3>
              <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
                Phòng học Live đồng bộ thời gian thực qua Socket.IO: Giáo viên trình chiếu Flashcard, Trắc nghiệm trực tiếp và Vòng quay từ vựng ngẫu nhiên.
              </p>

              {cls.active_session_id ? (
                <button
                  type="button"
                  className="ic-btn ic-btn-primary"
                  style={{ padding: '14px 36px', fontSize: '1.2rem' }}
                  onClick={() => navigate(`/interactive-room/session/${cls.active_session_id}`)}
                >
                  🔴 Vào phòng Live đang diễn ra
                </button>
              ) : (
                <div>
                  <div
                    style={{
                      background: '#F1F5F9',
                      padding: '16px',
                      borderRadius: '16px',
                      color: '#475569',
                      marginBottom: '20px',
                    }}
                  >
                    Chưa có buổi học Live nào đang hoạt động.
                  </div>
                  {isTeacher && (
                    <button
                      type="button"
                      className="ic-btn ic-btn-secondary"
                      onClick={() => setActiveTab('lessons')}
                    >
                      Chọn bài học để bắt đầu Live →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
