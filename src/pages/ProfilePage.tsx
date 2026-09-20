import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import cloudSvg from '../assets/Cloud.svg'
import toast from 'react-hot-toast'
import type { AuthUser } from '../types/auth'
import '../styles/pages/profile.css'

const PRESET_AVATARS = ['👧', '👦', '🦜', '🦁', '🐻', '🚀', '🎓', '👑']

export const ProfilePage: React.FC = () => {
  const { user: contextUser, updateProfileState } = useAuth()
  const [profile, setProfile] = useState<AuthUser | null>(contextUser)
  const [loading, setLoading] = useState(!contextUser)
  const [error, setError] = useState<string | null>(null)

  // Active Tab: 'info' | 'verification' | 'password'
  const [activeTab, setActiveTab] = useState<'info' | 'verification' | 'password'>('info')

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(contextUser?.name || '')
  const [username, setUsername] = useState(contextUser?.username || '')
  const [avatar, setAvatar] = useState(contextUser?.avatar || '')
  const [dateOfBirth, setDateOfBirth] = useState(contextUser?.dateOfBirth || '')
  const [gender, setGender] = useState<string>(contextUser?.gender || 'male')
  const [savingProfile, setSavingProfile] = useState(false)

  // Email Verification State
  const [sendingVerification, setSendingVerification] = useState(false)

  // Password Change State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        setError(null)
        if (!contextUser) {
          setLoading(true)
        }

        const data = await userService.getProfile()

        if (!isMounted) return

        if (data) {
          setProfile(data)
          setName(data.name || '')
          setUsername(data.username || '')
          setAvatar(data.avatar || '')
          setDateOfBirth(data.dateOfBirth || '')
          setGender(data.gender || 'male')

          updateProfileState(data)
        }
      } catch (err: unknown) {
        if (!isMounted) return

        console.error('Failed to load profile:', err)
        setError('Không thể tải thông tin hồ sơ.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void fetchProfile()

    return () => {
      isMounted = false
    }
  }, [updateProfileState])

  const handleStartEdit = () => {
    if (profile) {
      setName(profile.name || '')
      setUsername(profile.username || '')
      setAvatar(profile.avatar || '')
      setDateOfBirth(profile.dateOfBirth || '')
      setGender(profile.gender || 'male')
    }
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (profile) {
      setName(profile.name || '')
      setUsername(profile.username || '')
      setAvatar(profile.avatar || '')
      setDateOfBirth(profile.dateOfBirth || '')
      setGender(profile.gender || 'male')
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedUsername = username.trim()

    if (trimmedName.length < 2) {
      toast.error('Họ tên phải có ít nhất 2 ký tự.')
      return
    }

    setSavingProfile(true)
    try {
      const updated = await userService.updateProfile({
        name: trimmedName,
        username: trimmedUsername || undefined,
        avatar: avatar.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      })

      setProfile(updated)
      updateProfileState(updated)
      setIsEditing(false)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleResendEmailVerification = async () => {
    if (!profile?.email) return
    setSendingVerification(true)
    try {
      await authService.resendVerification(profile.email)
      toast.success('Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gửi email xác thực thất bại.'
      toast.error(msg)
    } finally {
      setSendingVerification(false)
    }
  }

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp.')
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword(oldPassword, newPassword, confirmPassword)
      toast.success('Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.'
      toast.error(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  // Render Avatar Helper
  const renderAvatarContent = (avString?: string | null) => {
    if (!avString) return '🧑‍🎓'
    if (PRESET_AVATARS.includes(avString) || avString.length <= 4) {
      return avString
    }
    return <img src={avString} alt="Avatar" />
  }

  return (
    <div className="profile-page-wrapper">
      {/* Background Floating SVG Clouds */}
      <div className="profile-bg-clouds" aria-hidden="true">
        <img src={cloudSvg} alt="" className="profile-cloud profile-cloud-1" />
        <img src={cloudSvg} alt="" className="profile-cloud profile-cloud-2" />
        <img src={cloudSvg} alt="" className="profile-cloud profile-cloud-3" />
      </div>

      <Header />

      <main className="profile-main-container">
        {/* Banner Header */}
        <section className="profile-header-banner">
          <div className="profile-banner-left">
            <div className="profile-banner-avatar-wrap">
              <div className="profile-banner-avatar">
                {renderAvatarContent(profile?.avatar)}
              </div>
            </div>
            <div>
              <h1 className="profile-banner-title">{profile?.name || 'Người dùng'}</h1>
              <p className="profile-banner-subtitle">
                @{profile?.username || 'username'} • {profile?.email || ''}
              </p>
            </div>
          </div>
          <span className="profile-role-badge">
            {profile?.role === 'admin' ? '⚙️ Quản trị viên (Admin)' : '🎓 Học viên (Learner)'}
          </span>
        </section>

        {/* Navigation Tabs */}
        <div className="profile-nav-tabs">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <span>👤</span> Thông Tin Cá Nhân
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <span>✉️</span> Quản Lý Email & Xác Thực
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span>🔒</span> Thay Đổi Mật Khẩu
          </button>
        </div>

        {error && (
          <div style={{ margin: '0 0 20px 0', padding: '14px 20px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.95rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading && !profile ? (
          <div className="profile-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Đang tải thông tin hồ sơ cá nhân...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'info' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h3 className="profile-card-title">👤 Thông Tin Cá Nhân</h3>
                    <p className="profile-card-desc">Quản lý ảnh đại diện và thông tin lý lịch cá nhân của bạn</p>
                  </div>
                  {!isEditing && (
                    <button type="button" className="btn-btn-primary" onClick={handleStartEdit}>
                      ✏️ Chỉnh Sửa Thông Tin
                    </button>
                  )}
                </div>

                {isEditing ? (
                  /* EDIT MODE FORM */
                  <form onSubmit={handleSaveProfile}>
                    {/* Avatar Picker */}
                    <div className="avatar-edit-section">
                      <div className="avatar-preview-box">
                        {renderAvatarContent(avatar)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="avatar-presets-label">Chọn biểu tượng đại diện (Avatar):</div>
                        <div className="avatar-presets-grid">
                          {PRESET_AVATARS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={`avatar-preset-item ${avatar === emoji ? 'active' : ''}`}
                              onClick={() => setAvatar(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <label className="profile-form-label" style={{ fontSize: '0.85rem' }}>
                            Hoặc nhập URL ảnh đại diện tùy chỉnh:
                          </label>
                          <input
                            type="text"
                            className="profile-form-input"
                            placeholder="https://example.com/my-avatar.jpg"
                            value={avatar && !PRESET_AVATARS.includes(avatar) ? avatar : ''}
                            onChange={(e) => setAvatar(e.target.value)}
                            style={{ marginTop: '4px', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="profile-grid-form">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Họ và tên *</label>
                        <input
                          type="text"
                          className="profile-form-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nhập họ và tên..."
                          required
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Tên người dùng (Username)</label>
                        <input
                          type="text"
                          className="profile-form-input"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Ví dụ: huuthang"
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Địa chỉ Email</label>
                        <input
                          type="email"
                          className="profile-form-input"
                          value={profile?.email || ''}
                          disabled
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Giới tính</label>
                        <select
                          className="profile-form-select"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="male">Nam 👨</option>
                          <option value="female">Nữ 👩</option>
                          <option value="other">Khác 🌈</option>
                        </select>
                      </div>

                      <div className="profile-form-group profile-form-full">
                        <label className="profile-form-label">Ngày sinh</label>
                        <input
                          type="date"
                          className="profile-form-input"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn-btn-secondary" onClick={handleCancelEdit}>
                        ✕ Hủy
                      </button>
                      <button type="submit" className="btn-btn-primary" disabled={savingProfile}>
                        {savingProfile ? 'Đang lưu...' : '💾 Lưu Thay Đổi'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEW MODE DISPLAY */
                  <div className="profile-info-list">
                    <div className="profile-info-item">
                      <div className="profile-info-label">Họ và tên</div>
                      <div className="profile-info-val">{profile?.name || 'Chưa cập nhật'}</div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-label">Username</div>
                      <div className="profile-info-val">@{profile?.username || 'chuacapnhat'}</div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-label">Địa chỉ Email</div>
                      <div className="profile-info-val">{profile?.email || 'N/A'}</div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-label">Giới tính</div>
                      <div className="profile-info-val">
                        {gender === 'female' ? 'Nữ 👩' : gender === 'other' ? 'Khác 🌈' : 'Nam 👨'}
                      </div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-label">Ngày sinh</div>
                      <div className="profile-info-val">{profile?.dateOfBirth || 'Chưa thiết lập'}</div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-label">Vai trò tài khoản</div>
                      <div className="profile-info-val" style={{ textTransform: 'capitalize' }}>
                        {profile?.role === 'admin' ? '⚙️ Admin' : '🎓 Learner'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: QUẢN LÝ EMAIL & XÁC THỰC */}
            {activeTab === 'verification' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h3 className="profile-card-title">✉️ Quản Lý Email & Xác Thực Tài Khoản</h3>
                    <p className="profile-card-desc">Kiểm tra trạng thái xác minh email và bảo mật tài khoản</p>
                  </div>
                </div>

                <div className={`verification-status-box ${profile?.isEmailVerified ? 'verified' : 'unverified'}`}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                      Email liên kết với tài khoản:
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {profile?.email}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span>Trạng thái: </span>
                      {profile?.isEmailVerified ? (
                        <span className="verif-badge verified">✓ Đã xác thực</span>
                      ) : (
                        <span className="verif-badge unverified">⚠️ Chưa xác thực</span>
                      )}
                    </div>
                  </div>

                  {!profile?.isEmailVerified && (
                    <button
                      type="button"
                      className="btn-btn-primary"
                      onClick={handleResendEmailVerification}
                      disabled={sendingVerification}
                    >
                      {sendingVerification ? 'Đang gửi...' : '📩 Gửi lại email xác thực'}
                    </button>
                  )}
                </div>

                {profile?.isEmailVerified ? (
                  <p style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #bbf7d0', fontSize: '0.92rem' }}>
                    🎉 **Tài khoản của bạn đã được xác thực an toàn.** Bạn có thể trải nghiệm đầy đủ tất cả tính năng trên hệ thống Deutschup.
                  </p>
                ) : (
                  <p style={{ color: '#9a3412', backgroundColor: '#fff7ed', padding: '16px', borderRadius: '14px', border: '1px solid #fed7aa', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    💡 **Lưu ý:** Nếu bạn chưa nhận được thư xác thực, hãy kiểm tra kỹ hộp thư rác (Spam / Junk) hoặc bấm nút <strong>"Gửi lại email xác thực"</strong> ở trên để nhận liên kết xác minh mới.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: THAY ĐỔI MẬT KHẨU */}
            {activeTab === 'password' && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <h3 className="profile-card-title">🔒 Thay Đổi Mật Khẩu</h3>
                    <p className="profile-card-desc">Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản cá nhân</p>
                  </div>
                </div>

                <form onSubmit={handleChangePasswordSubmit} style={{ maxWidth: '520px' }}>
                  {/* Current Password */}
                  <div className="profile-form-group" style={{ marginBottom: '18px' }}>
                    <label className="profile-form-label">Mật khẩu hiện tại *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        className="profile-form-input"
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        {showOldPass ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="profile-form-group" style={{ marginBottom: '18px' }}>
                    <label className="profile-form-label">Mật khẩu mới *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="profile-form-input"
                        placeholder="•••••••• (Ít nhất 8 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        {showNewPass ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="profile-form-group" style={{ marginBottom: '24px' }}>
                    <label className="profile-form-label">Xác nhận mật khẩu mới *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="profile-form-input"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        {showConfirmPass ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-btn-primary"
                    disabled={changingPassword}
                    style={{ width: '100%', padding: '14px' }}
                  >
                    {changingPassword ? 'Đang đổi mật khẩu...' : '🔒 Đổi Mật Khẩu'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
