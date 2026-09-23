import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const Login = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isUnverified, setIsUnverified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { login, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }, [from, isAuthenticated, user, navigate])

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading || googleLoading) return

    setError('')
    setIsUnverified(false)
    setResendMessage('')
    setLoading(true)

    const trimmedEmail = email.trim()
    if (!validateEmail(trimmedEmail)) {
      setError(t('validation.invalidEmail', { ns: 'auth', defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ.' }))
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t('validation.passwordMin', { ns: 'auth', defaultValue: 'Mật khẩu phải có ít nhất 8 ký tự.' }))
      setLoading(false)
      return
    }

    try {
      const loggedUser = await login(trimmedEmail, password)
      toast.success(t('login.successToast'))

      if (loggedUser?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('login.failedToast', { defaultValue: 'Đăng nhập thất bại' })
      setError(errorMessage)
      toast.error(errorMessage)

      const status = (err as { status?: number })?.status
      const unverified = status === 403 || /xác nhận email|verify email/i.test(errorMessage)
      if (unverified) {
        setIsUnverified(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error(t('validation.invalidEmail', { ns: 'auth', defaultValue: 'Vui lòng nhập địa chỉ email.' }))
      return
    }

    setResendLoading(true)
    try {
      const msg = await authService.resendVerification(trimmedEmail)
      const successMsg = msg || t('login.resendSuccess', { defaultValue: 'Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.' })
      setResendMessage(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('login.resendFail', { defaultValue: 'Không thể gửi lại email xác thực.' })
      toast.error(msg)
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const errorMessage = t('login.googleFail')
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    if (loading || googleLoading) return

    setError('')
    setGoogleLoading(true)

    try {
      const loggedUser = await googleLogin(credentialResponse.credential)
      toast.success(t('login.googleSuccess'))

      if (loggedUser?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('login.googleFail')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    const errorMessage = t('login.googleFail')
    setError(errorMessage)
    toast.error(errorMessage)
  }

  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">{t('login.title')}</h1>
          <p className="auth-page__subtitle">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label={t('login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <FormInput
            label={t('login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={8}
            required
          />

          {error && <p className="auth-form__error">{error}</p>}

          {isUnverified && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                {t('login.unverifiedNotice')}
              </p>
              {resendMessage ? (
                <p style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 500 }}>
                  {resendMessage}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                  }}
                >
                  {resendLoading ? t('login.resending') : t('login.resendVerification')}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="auth-form__submit"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('login.or')}</span>
        </div>

        <div className="auth-google-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
        </div>

        <p className="auth-form__footer">
          <Link to="/forgot-password">{t('login.forgotPassword')}</Link>
        </p>

        <p className="auth-form__footer">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
            {t('login.registerNow')}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
