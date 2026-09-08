import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Đang xác thực email...')
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const isPending = location.pathname.endsWith('/pending')

  useEffect(() => {
    if (isPending) {
      setStatus('loading')
      setMessage('Vui lòng kiểm tra email để xác thực tài khoản.')
      return
    }

    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Link xác thực không hợp lệ hoặc đã hết hạn.')
        return
      }

      try {
        await authService.verifyEmail(token)
        setStatus('success')
        setMessage('Email đã được xác thực thành công.')
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Link xác thực không hợp lệ hoặc đã hết hạn.')
      }
    }

    void verify()
  }, [token, isPending])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setResendLoading(true)
    setResendMessage('')
    try {
      await authService.resendVerification(email.trim())
      setResendMessage('Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.')
      toast.success('Đã gửi lại email xác thực.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi lại email xác thực.'
      toast.error(msg)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">Xác thực email</h1>
          <p className="auth-page__subtitle">{message}</p>
        </div>

        {status === 'loading' && !isPending ? (
          <p className="auth-form__error">Đang xác thực email...</p>
        ) : null}

        {status === 'success' ? (
          <div className="auth-form">
            <Link to="/login" className="auth-form__submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Đăng nhập ngay
            </Link>
          </div>
        ) : null}

        {(isPending || status === 'error') ? (
          <form onSubmit={handleResend} className="auth-form" style={{ marginTop: '20px' }}>
            <p className="auth-page__subtitle" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
              Chưa nhận được email hoặc link bị hết hạn? Nhập email để gửi lại link xác thực:
            </p>
            <FormInput
              label="Email xác thực"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap-email@example.com"
              required
            />
            {resendMessage ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{resendMessage}</p> : null}
            <button type="submit" disabled={resendLoading} className="auth-form__submit">
              {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>

            <p className="auth-form__footer" style={{ marginTop: '15px' }}>
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </form>
        ) : null}
      </section>
    </main>
  )
}

export default VerifyEmail
