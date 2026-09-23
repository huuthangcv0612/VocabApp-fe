import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const ResetPassword = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.invalidToken'))
      return
    }

    const checkToken = async () => {
      try {
        await authService.validateResetToken(token)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('resetPassword.invalidToken')
        setError(errorMessage)
      }
    }

    void checkToken()
  }, [token, t])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError(t('resetPassword.invalidToken'))
      return
    }

    if (password.length < 8) {
      setError(t('validation.passwordMin', { defaultValue: 'Mật khẩu phải có ít nhất 8 ký tự.' }))
      return
    }

    if (password !== passwordConfirm) {
      setError(t('validation.passwordMismatch', { defaultValue: 'Mật khẩu và xác nhận mật khẩu phải trùng khớp.' }))
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, password, passwordConfirm)
      toast.success(t('resetPassword.successMessage'))
      setSuccess(t('resetPassword.successMessage'))
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : t('common.states.error')
      let errorMessage = rawMessage
      if (rawMessage.toLowerCase().includes('expired') || rawMessage.toLowerCase().includes('invalid')) {
        errorMessage = t('resetPassword.invalidToken')
      }
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">{t('resetPassword.title')}</h1>
          <p className="auth-page__subtitle">{t('resetPassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label={t('resetPassword.newPassword')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={!token}
          />
          <FormInput
            label={t('resetPassword.confirmNewPassword')}
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={!token}
          />

          {error ? <p className="auth-form__error">{error}</p> : null}
          {success ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{success}</p> : null}

          <button type="submit" disabled={loading || !token} className="auth-form__submit">
            {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </button>
        </form>

        <p className="auth-form__footer">
          <Link to="/login">{t('resetPassword.backToLogin')}</Link>
        </p>
      </section>
    </main>
  )
}

export default ResetPassword
