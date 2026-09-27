import React, { type ReactNode } from 'react'
import Header from '../Header'
import cloudSvg from '../../assets/Cloud.svg'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-page-wrapper">
      {/* Background Floating SVG Clouds */}
      <div className="auth-bg-clouds" aria-hidden="true">
        <img src={cloudSvg} alt="" className="auth-cloud auth-cloud-1" />
        <img src={cloudSvg} alt="" className="auth-cloud auth-cloud-2" />
        <img src={cloudSvg} alt="" className="auth-cloud auth-cloud-3" />
        <img src={cloudSvg} alt="" className="auth-cloud auth-cloud-4" />
      </div>

      <Header />

      <main className="auth-page">
        {children}
      </main>
    </div>
  )
}

export default AuthLayout
