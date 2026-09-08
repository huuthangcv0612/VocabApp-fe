import { useState } from 'react'
import { authService } from '../../services/authService'
import { FormInput } from '../../components/auth/FormInput'
import toast from 'react-hot-toast'
import '../../styles/pages/auth.css'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu phải trùng khớp.')
      return
    }

    setLoading(true)

    try {
      await authService.changePassword(oldPassword, newPassword, confirmPassword)
      toast.success('Mật khẩu đã được đổi thành công')
      setSuccess('Mật khẩu đã được đổi thành công.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể đổi mật khẩu.'
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
          <h1 className="auth-page__title">Đổi mật khẩu</h1>
          <p className="auth-page__subtitle">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FormInput
            label="Mật khẩu cũ"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <FormInput
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FormInput
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error ? <p className="auth-form__error">{error}</p> : null}
          {success ? <p className="auth-form__error" style={{ background: '#dcfce7', color: '#166534' }}>{success}</p> : null}

          <button type="submit" disabled={loading} className="auth-form__submit">
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default ChangePassword
