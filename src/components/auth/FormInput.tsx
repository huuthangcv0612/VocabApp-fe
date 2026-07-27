import { type InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormInput({ label, error, className = '', ...props }: FormInputProps) {
  return (
    <label className="auth-form__group">
      <span className="auth-form__label">{label}</span>
      <input
        {...props}
        className={`auth-form__input${error ? ' auth-form__input--error' : ''} ${className}`.trim()}
      />
      {error ? <span className="auth-form__error-text">{error}</span> : null}
    </label>
  )
}
