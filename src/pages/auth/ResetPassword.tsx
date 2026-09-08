import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const ResetPassword = () => {
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
      setError('Link đặt lại mật khẩu không hợp lệ.')
      return
    }

    const checkToken = async () => {
      try {
        await authService.validateResetToken(token)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
        setError(errorMessage)
      }
    }

    void checkToken()
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ.')
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    if (password !== passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, password, passwordConfirm)
      toast.success('Mật khẩu đã được thay đổi')
      setSuccess('Mật khẩu đã được thay đổi. Bạn có thể đăng nhập lại ngay.')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu.'
      let errorMessage = rawMessage
      if (rawMessage.toLowerCase().includes('expired')) {
        errorMessage = 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.'
      } else if (rawMessage.includes('Invalid or expired reset token') || rawMessage.toLowerCase().includes('invalid')) {
        errorMessage = 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.'
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
          <h1 className="auth-page__title">Đặt lại mật khẩu</h1>
          <p className="auth-page__subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Mật khẩu mới"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            disabled={!token}
          />
          <FormInput
            label="Xác nhận mật khẩu"
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
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <p className="auth-form__footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}

export default ResetPassword
