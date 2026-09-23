import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const Register = () => {
  const { t } = useTranslation(['auth', 'common'])
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedUsername = username.trim() || undefined

    if (trimmedName.length < 2) {
      setError(t('validation.nameMin', { defaultValue: 'Vui lòng nhập họ tên hợp lệ.' }))
      setLoading(false)
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError(t('validation.invalidEmail', { defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ.' }))
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t('validation.passwordMin', { defaultValue: 'Mật khẩu phải có ít nhất 8 ký tự.' }))
      setLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError(t('validation.passwordMismatch', { defaultValue: 'Mật khẩu và xác nhận mật khẩu phải trùng khớp.' }))
      setLoading(false)
      return
    }

    try {
      await register(trimmedName, trimmedEmail, password, passwordConfirm, trimmedUsername)
      toast.success(t('register.successToast'))
      navigate('/verify-email/pending', { replace: true, state: { email: trimmedEmail } })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('register.fail', { defaultValue: 'Đăng ký thất bại' })
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
          <h1 className="auth-page__title">{t('register.title')}</h1>
          <p className="auth-page__subtitle">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label={t('register.name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <FormInput
            label={t('register.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder={t('register.usernamePlaceholder')}
          />
          <FormInput
            label={t('register.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <FormInput
            label={t('register.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FormInput
            label={t('register.passwordConfirm')}
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error && <p className="auth-form__error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="auth-form__submit"
          >
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p className="auth-form__footer">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">
            {t('register.loginNow')}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Register
