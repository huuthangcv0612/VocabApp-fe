import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated, user } = useAuth()
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
    setError('')
    setLoading(true)

    const trimmedEmail = email.trim()
    if (!validateEmail(trimmedEmail)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      setLoading(false)
      return
    }

    console.log('Login form submitted:', { email: trimmedEmail })
    try {
      const loggedUser = await login(trimmedEmail, password)
      toast.success('Đăng nhập thành công')

      if (loggedUser?.role === 'admin') {
        console.log('Admin login successful, navigating to /admin')
        navigate('/admin', { replace: true })
      } else {
        console.log('User login successful, navigating to:', from)
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error('Login page catch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại'
      console.error('Setting error:', errorMessage)
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
          <h1 className="auth-page__title">Đăng nhập</h1>
          <p className="auth-page__subtitle">Nhập thông tin của bạn để tiếp tục học tập.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <FormInput
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          minLength={8}
          required
        />

        {error && <p className="auth-form__error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="auth-form__submit"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="auth-form__footer">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>

        <p className="auth-form__footer">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
            Đăng ký ngay
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
