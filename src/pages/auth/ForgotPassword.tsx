import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const ForgotPassword = () => {
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
      toast.success('Yêu cầu đã được gửi')
      setMessage('Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi yêu cầu lúc này.'
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
          <h1 className="auth-page__title">Quên mật khẩu</h1>
          <p className="auth-page__subtitle">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          {error ? <p className="auth-form__error">{error}</p> : null}
          {message ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{message}</p> : null}

          <button type="submit" disabled={loading} className="auth-form__submit">
            {loading ? 'Đang gửi...' : 'Gửi liên kết'}
          </button>
        </form>

        <p className="auth-form__footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
