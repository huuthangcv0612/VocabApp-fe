import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/pages/auth.css'

const Register = () => {
  const [name, setName] = useState('')
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
    console.log('Register form submitted:', { name: trimmedName, email: trimmedEmail })

    if (trimmedName.length < 2) {
      setError('Vui lòng nhập họ tên hợp lệ.')
      setLoading(false)
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      setLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('Mật khẩu và xác nhận mật khẩu phải trùng khớp.')
      setLoading(false)
      return
    }

    try {
      await register(trimmedName, trimmedEmail, password, passwordConfirm)
      console.log('Register successful, navigating to home')
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Register page catch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại'
      console.error('Setting error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">Đăng ký</h1>
          <p className="auth-page__subtitle">Tạo tài khoản để bắt đầu hành trình học tiếng Đức.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-form__group">
          <span className="auth-form__label">Họ tên</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="auth-form__input"
            required
          />
        </label>
        <label className="auth-form__group">
          <span className="auth-form__label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="auth-form__input"
            required
          />
        </label>
        <label className="auth-form__group">
          <span className="auth-form__label">Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            className="auth-form__input"
            required
          />
        </label>
        <label className="auth-form__group">
          <span className="auth-form__label">Xác nhận mật khẩu</span>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            className="auth-form__input"
            required
          />
        </label>

        {error && <p className="auth-form__error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="auth-form__submit"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="auth-form__footer">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Register
