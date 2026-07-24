import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import '../../styles/pages/auth.css'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Đang xác thực email...')

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
  }, [token])

  return (
    <main className="auth-page">
      <section className="auth-page__container">
        <div className="auth-page__header">
          <h1 className="auth-page__title">Xác thực email</h1>
          <p className="auth-page__subtitle">{message}</p>
        </div>

        {status === 'loading' ? (
          <p className="auth-form__error">{isPending ? message : 'Đang xác thực email...'}</p>
        ) : null}

        {status === 'success' ? (
          <div className="auth-form">
            <Link to="/login" className="auth-form__submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Đăng nhập
            </Link>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="auth-form">
            <Link to="/login" className="auth-form__submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Quay lại đăng nhập
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default VerifyEmail
