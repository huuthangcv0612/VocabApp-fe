import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
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

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
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
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.')
      console.log('Register successful, navigating to verify email pending state')
      navigate('/verify-email/pending', { replace: true })
    } catch (err) {
      console.error('Register page catch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại'
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
          <h1 className="auth-page__title">Đăng ký</h1>
          <p className="auth-page__subtitle">Tạo tài khoản để bắt đầu hành trình học tiếng Đức.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
        <FormInput
          label="Họ tên"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          minLength={8}
          required
        />
        <FormInput
          label="Xác nhận mật khẩu"
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
