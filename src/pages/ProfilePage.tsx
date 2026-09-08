import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'
import { FormInput } from '../components/auth/FormInput'
import toast from 'react-hot-toast'
import type { AuthUser } from '../types/auth'
import '../styles/pages/auth.css'

const ProfilePage = () => {
  const { user: contextUser, updateProfileState } = useAuth()
  const [profile, setProfile] = useState<AuthUser | null>(contextUser)
  const [name, setName] = useState(contextUser?.name || '')
  const [username, setUsername] = useState(contextUser?.username || '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await userService.getProfile()
        if (isMounted) {
          setProfile(data)
          setName(data.name || '')
          setUsername(data.username || '')
          updateProfileState(data)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Không thể tải thông tin cá nhân.'
          setError(msg)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchProfile()
    return () => {
      isMounted = false
    }
  }, [updateProfileState])

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    const trimmedUsername = username.trim()

    if (trimmedName.length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự.')
      return
    }

    setSaving(true)
    try {
      const updated = await userService.updateProfile({
        name: trimmedName,
        username: trimmedUsername || undefined,
      })
      setProfile(updated)
      updateProfileState(updated)
      setSuccess('Cập nhật thông tin cá nhân thành công.')
      toast.success('Cập nhật hồ sơ thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Header />
      <main className="auth-page" style={{ flex: 1, padding: '40px 16px' }}>
        <section className="auth-page__container" style={{ maxWidth: '560px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div className="auth-page__header" style={{ marginBottom: '24px' }}>
            <h1 className="auth-page__title" style={{ fontSize: '1.8rem', color: '#1e293b' }}>Hồ Sơ Cá Nhân</h1>
            <p className="auth-page__subtitle" style={{ color: '#64748b' }}>Quản lý thông tin tài khoản của bạn</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>Đang tải thông tin hồ sơ...</p>
          ) : (
            <form onSubmit={handleUpdate} className="auth-form">
              <FormInput
                label="Họ và tên"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />

              <FormInput
                label="Tên tài khoản (Username)"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />

              <FormInput
                label="Địa chỉ Email"
                type="email"
                value={profile?.email || ''}
                disabled
                autoComplete="email"
              />

              <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                <span>Vai trò: </span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{profile?.role || 'user'}</strong>
              </div>

              {error ? <p className="auth-form__error">{error}</p> : null}
              {success ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{success}</p> : null}

              <button type="submit" disabled={saving} className="auth-form__submit">
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: '#475569' }}>Bảo mật tài khoản</span>
                <Link
                  to="/profile/change-password"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#2A63E8',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                  }}
                >
                  🔒 Đổi Mật Khẩu
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage
