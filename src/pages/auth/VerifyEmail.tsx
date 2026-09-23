import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const VerifyEmail = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])
  const isPending = location.pathname.endsWith('/pending')

  const initialEmail = (location.state as { email?: string } | null)?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(isPending ? 'success' : 'loading')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const [resendError, setResendError] = useState('')

  useEffect(() => {
    if (isPending) {
      setStatus('success')
      setMessage(t('verifyEmail.pendingSubtitle'))
      return
    }

    if (!token) {
      setStatus('error')
      setMessage(t('verifyEmail.failedDesc'))
      return
    }

    let isMounted = true
    const verify = async () => {
      setStatus('loading')
      setMessage(t('verifyEmail.verifyingTitle'))
      try {
        const successMsg = await authService.verifyEmail(token)
        if (isMounted) {
          setStatus('success')
          setMessage(successMsg || t('verifyEmail.successDesc'))
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error')
          setMessage(error instanceof Error ? error.message : t('verifyEmail.failedDesc'))
        }
      }
    }

    void verify()

    return () => {
      isMounted = false
    }
  }, [token, isPending, t])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error(t('validation.invalidEmail', { defaultValue: 'Vui lòng nhập địa chỉ email.' }))
      return
    }

    setResendLoading(true)
    setResendSuccess('')
    setResendError('')

    try {
      const msg = await authService.resendVerification(trimmedEmail)
      const finalMsg = msg || t('login.resendSuccess', { defaultValue: 'Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.' })
      setResendSuccess(finalMsg)
      toast.success(finalMsg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('login.resendFail', { defaultValue: 'Không thể gửi lại email xác thực.' })
      setResendError(msg)
      toast.error(msg)
    } finally {
      setResendLoading(false)
    }
  }

  // Pending screen
  if (isPending) {
    return (
      <main className="auth-page">
        <section className="auth-page__container">
          <div className="auth-page__header" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="auth-page__title">{t('verifyEmail.pendingTitle')}</h1>
            <p className="auth-page__subtitle" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', marginTop: '0.5rem' }}>
              {t('verifyEmail.pendingSubtitle')}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              {t('verifyEmail.pendingDesc')} {email && <strong>({email})</strong>}
            </p>
          </div>

          <div className="auth-form" style={{ marginTop: '1.5rem' }}>
            <Link
              to="/login"
              className="auth-form__submit"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              {t('login.submit')}
            </Link>

            <form onSubmit={handleResend} style={{ marginTop: '1.25rem', borderTop: '1px solid var(--auth-border)', paddingTop: '1.25rem' }}>
              <p className="auth-page__subtitle" style={{ fontSize: '0.88rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                {t('verifyEmail.resendPrompt')}
              </p>
              <FormInput
                label={t('login.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
              />
              {resendSuccess ? (
                <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534', marginTop: '0.75rem' }}>
                  {resendSuccess}
                </p>
              ) : null}
              {resendError ? (
                <p className="auth-form__error" style={{ marginTop: '0.75rem' }}>
                  {resendError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={resendLoading}
                className="auth-form__submit"
                style={{ marginTop: '0.75rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                {resendLoading ? t('verifyEmail.resendingBtn') : t('verifyEmail.resendBtn')}
              </button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  // Loading screen
  if (status === 'loading') {
    return (
      <main className="auth-page">
        <section className="auth-page__container" style={{ textAlign: 'center' }}>
          <div className="auth-page__header">
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'spin 1.5s linear infinite' }}
              >
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <h1 className="auth-page__title">{t('verifyEmail.verifyingTitle')}</h1>
            <p className="auth-page__subtitle">{t('verifyEmail.verifyingSubtitle')}</p>
          </div>
        </section>
      </main>
    )
  }

  // Success screen
  if (status === 'success') {
    return (
      <main className="auth-page">
        <section className="auth-page__container" style={{ textAlign: 'center' }}>
          <div className="auth-page__header">
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="auth-page__title">{t('verifyEmail.successTitle')}</h1>
            <p className="auth-page__subtitle" style={{ fontSize: '1rem', color: '#166534', marginTop: '0.5rem', fontWeight: 500 }}>
              {message}
            </p>
          </div>

          <div className="auth-form" style={{ marginTop: '1.5rem' }}>
            <Link
              to="/login"
              className="auth-form__submit"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              {t('login.submit')}
            </Link>
          </div>
        </section>
      </main>
    )
  }

  // Error screen
  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 1.25rem',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="auth-page__title">{t('verifyEmail.failedTitle')}</h1>
          <p className="auth-form__error" style={{ marginTop: '1rem', textAlign: 'center' }}>
            {message}
          </p>
        </div>

        <form onSubmit={handleResend} className="auth-form" style={{ marginTop: '1.5rem' }}>
          <p className="auth-page__subtitle" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            {t('verifyEmail.resendPrompt')}
          </p>
          <FormInput
            label={t('login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhap-email@example.com"
            required
          />
          {resendSuccess ? (
            <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>
              {resendSuccess}
            </p>
          ) : null}
          {resendError ? (
            <p className="auth-form__error">
              {resendError}
            </p>
          ) : null}
          <button type="submit" disabled={resendLoading} className="auth-form__submit">
            {resendLoading ? t('verifyEmail.resendingBtn') : t('verifyEmail.resendBtn')}
          </button>

          <p className="auth-form__footer" style={{ marginTop: '1rem' }}>
            <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">
              {t('verifyEmail.backToLogin')}
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default VerifyEmail
