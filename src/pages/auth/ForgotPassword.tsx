import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const ForgotPassword = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await authService.forgotPassword(email.trim())
      toast.success(t('forgotPassword.successMessage'))
      setMessage(t('forgotPassword.successMessage'))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.states.error')
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
          <h1 className="auth-page__title">{t('forgotPassword.title')}</h1>
          <p className="auth-page__subtitle">{t('forgotPassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label={t('login.email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          {error ? <p className="auth-form__error">{error}</p> : null}
          {message ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{message}</p> : null}

          <button type="submit" disabled={loading} className="auth-form__submit">
            {loading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </button>
        </form>

        <p className="auth-form__footer">
          <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
