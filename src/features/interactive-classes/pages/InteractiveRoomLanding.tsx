import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAuth } from '../../../contexts/AuthContext'
import { useSubscription } from '../../../hooks/useSubscription'
import { interactiveClassService } from '../../../services/interactiveClassService'
import {
  checkInteractivePermissions,
  checkClassOwnership,
} from '../../../utils/interactivePermissions'
import { ClassCard } from '../components/ClassCard'
import { CreateClassModal } from '../components/CreateClassModal'
import { JoinClassModal } from '../components/JoinClassModal'
import { PremiumRequiredModal } from '../../../components/modals/PremiumRequiredModal'
import type { ClassItem } from '../../../types/interactiveClass'
import '../../../styles/pages/interactive-classes.css'

export const InteractiveRoomLanding = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { subscription, loading: subLoading } = useSubscription()

  const permissions = checkInteractivePermissions(user, subscription)
  const canManageClasses = permissions.canManageClasses

  const [activeTab, setActiveTab] = useState<'managed' | 'joined'>('managed')
  const [managedClasses, setManagedClasses] = useState<ClassItem[]>([])
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [joinCodeParam, setJoinCodeParam] = useState<string>('')

  // Check if URL has ?joinCode=...
  useEffect(() => {
    const code = searchParams.get('joinCode')
    if (code) {
      setJoinCodeParam(code)
      setIsJoinOpen(true)
    }
  }, [searchParams])

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      if (canManageClasses) {
        // Custom users can have both classes they created and classes they joined
        const [managedRes, joinedRes] = await Promise.allSettled([
          interactiveClassService.getClasses(),
          interactiveClassService.getMyClasses(),
        ])

        if (managedRes.status === 'fulfilled') {
          setManagedClasses(managedRes.value)
        }
        if (joinedRes.status === 'fulfilled') {
          setJoinedClasses(joinedRes.value)
        }
      } else {
        // Free & Premium users fetch classes they joined
        const myClasses = await interactiveClassService.getMyClasses()
        setJoinedClasses(myClasses)
      }
    } catch (err: unknown) {
      console.error('Error fetching classes:', err)
      toast.error('Không thể tải danh sách lớp học.')
    } finally {
      setLoading(false)
    }
  }, [canManageClasses])

  useEffect(() => {
    if (!subLoading) {
      fetchClasses()
    }
  }, [subLoading, fetchClasses])

  const handleDeleteClass = async (classId: string) => {
    try {
      await interactiveClassService.deleteClass(classId)
      toast.success('Đã xóa lớp học!')
      setManagedClasses((prev) => prev.filter((c) => (c._id || c.id) !== classId))
    } catch (err: unknown) {
      console.error('Error deleting class:', err)
      toast.error('Lỗi khi xóa lớp học.')
    }
  }

  const handleClassCreated = (newClass: ClassItem) => {
    setManagedClasses((prev) => [newClass, ...prev])
    setActiveTab('managed')
  }

  const handleClassJoined = (joinedClass?: ClassItem) => {
    if (joinedClass) {
      setJoinedClasses((prev) => {
        const exists = prev.some(
          (c) => (c._id || c.id) === (joinedClass._id || joinedClass.id),
        )
        if (exists) return prev
        return [joinedClass, ...prev]
      })
      setActiveTab('joined')
    } else {
      fetchClasses()
    }
  }

  // Current display list based on active tab
  const currentList = canManageClasses
    ? activeTab === 'managed'
      ? managedClasses
      : joinedClasses
    : joinedClasses

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-accent, #FFF2B7)' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0 5rem', backgroundColor: 'var(--color-accent, #FFF2B7)' }}>
        <div className="ic-container">
          {/* Permission Promo Banner for Free/Premium users who don't have Custom Plan */}
          {permissions.needsCustomUpgrade && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '2px solid #3B82F6',
                borderRadius: '20px',
                padding: '20px 24px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#1E40AF', fontSize: '1.2rem', fontFamily: 'Oswald' }}>
                  ⭐ NÂNG CẤP GÓI CUSTOM ĐỂ TẠO LỚP HỌC & GIẢNG DẠY TƯƠNG TÁC
                </h4>
                <p style={{ margin: 0, color: '#1E3A8A', fontSize: '0.95rem' }}>
                  Gói <strong>CUSTOM</strong> cho phép bạn tạo không giới hạn lớp học, soạn bài giảng tương tác (Flashcard, Quiz, Spin) và khởi tạo phòng học Live thời gian thực cho học viên.
                </p>
              </div>
              <button
                type="button"
                className="ic-btn ic-btn-primary ic-btn-sm"
                onClick={() => navigate('/pricing')}
              >
                Khám phá Gói Custom
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className="ic-page-header">
            <div className="ic-title-group">
              <h1>
                {canManageClasses ? 'Lớp Học Tương Tác' : 'Lớp Học Của Tôi'}
              </h1>
              <p>
                {canManageClasses
                  ? 'Quản lý lớp học, xây dựng bài giảng tương tác và giảng dạy trực tiếp thời gian thực.'
                  : 'Tham gia lớp học và trải nghiệm các bài giảng tương tác trực tiếp cùng giảng viên.'}
              </p>
            </div>

            <div className="ic-actions-group">
              <button
                type="button"
                className="ic-btn ic-btn-outline"
                onClick={() => setIsJoinOpen(true)}
              >
                🔑 Tham gia bằng mã
              </button>

              {canManageClasses ? (
                <button
                  type="button"
                  className="ic-btn ic-btn-primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  + Tạo lớp học mới
                </button>
              ) : (
                <button
                  type="button"
                  className="ic-btn ic-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: 0.95,
                  }}
                  onClick={() => setShowCustomModal(true)}
                >
                  <span>⭐ + Tạo lớp học mới</span>
                  <span
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    CUSTOM
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Switcher for Custom Users */}
          {canManageClasses && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                borderBottom: '2px solid #E2E8F0',
                paddingBottom: '8px',
              }}
            >
              <button
                type="button"
                className={`ic-btn ic-btn-sm ${activeTab === 'managed' ? 'ic-btn-primary' : 'ic-btn-outline'}`}
                onClick={() => setActiveTab('managed')}
              >
                🏫 Lớp tôi quản lý ({managedClasses.length})
              </button>
              <button
                type="button"
                className={`ic-btn ic-btn-sm ${activeTab === 'joined' ? 'ic-btn-primary' : 'ic-btn-outline'}`}
                onClick={() => setActiveTab('joined')}
              >
                👥 Lớp đã tham gia ({joinedClasses.length})
              </button>
            </div>
          )}

          {/* Classes Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
              <p>Đang tải danh sách lớp học...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="ic-empty-state">
              <div className="ic-empty-icon">🏫</div>
              <h3>
                {canManageClasses && activeTab === 'managed'
                  ? 'Bạn chưa tạo lớp học nào'
                  : 'Bạn chưa tham gia lớp học nào'}
              </h3>
              <p>
                {canManageClasses && activeTab === 'managed'
                  ? 'Hãy tạo lớp học đầu tiên của bạn để mời học viên và bắt đầu bài học tương tác!'
                  : 'Hãy nhập mã lớp học (Class Code) do giáo viên cung cấp để tham gia lớp!'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="ic-btn ic-btn-secondary"
                  onClick={() => setIsJoinOpen(true)}
                >
                  🔑 Nhập mã tham gia
                </button>
                {canManageClasses && activeTab === 'managed' ? (
                  <button
                    type="button"
                    className="ic-btn ic-btn-primary"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    + Tạo lớp học ngay
                  </button>
                ) : !canManageClasses ? (
                  <button
                    type="button"
                    className="ic-btn ic-btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: 0.95,
                    }}
                    onClick={() => setShowCustomModal(true)}
                  >
                    <span>⭐ + Tạo lớp học</span>
                    <span
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      CUSTOM
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>
                  {canManageClasses && activeTab === 'managed'
                    ? `Danh sách lớp bạn đang quản lý (${currentList.length})`
                    : `Danh sách lớp bạn đang tham gia (${currentList.length})`}
                </span>
              </div>

              <div className="ic-grid">
                {currentList.map((cls, idx) => {
                  const { canManageThisClass } = checkClassOwnership(user, cls, permissions)
                  return (
                    <ClassCard
                      key={cls._id || cls.id || `cls_${idx}`}
                      cls={cls}
                      canManage={canManageThisClass}
                      onDelete={canManageThisClass ? handleDeleteClass : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleClassCreated}
      />

      <JoinClassModal
        isOpen={isJoinOpen}
        initialCode={joinCodeParam}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={handleClassJoined}
      />

      <PremiumRequiredModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        planType="CUSTOM"
      />
    </div>
  )
}
