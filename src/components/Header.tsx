import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../styles/components/header.css'
import useAuth from '../hooks/useAuth'
import HamburgerIcon from '../assets/Hamberger.svg'
import DeutschUpLogo from '../assets/DEUTSCHUP.svg'

type HeaderProps = {
  animate?: boolean
}

const Header = ({ animate = false }: HeaderProps) => {
  const { t } = useTranslation('common')
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`header ${animate ? 'header--animated' : ''}`}>
      <div className="header-container">
        <NavLink to="/" className="logo" onClick={closeMobileMenu}>
          <img src={DeutschUpLogo} alt="DeutschUp" className="logo-img" />
        </NavLink>

        <nav className="nav-menu">
          <NavLink to="/learning-path" className="nav-link">
            {t('nav.startLearning')}
          </NavLink>
          <NavLink to="/progress" className="nav-link">
            {t('nav.progress')}
          </NavLink>
          <NavLink to="/pricing" className="nav-link">
            {t('nav.pricing')}
          </NavLink>

          <NavLink to="/test" className="nav-link">
            {t('nav.practiceTests')}
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link">
            {t('nav.interactiveClasses')}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" style={{ color: '#FFF2B7', fontWeight: 800 }}>
              {t('nav.adminDashboard')}
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="user-greeting" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                Hallo, <span className="username">{user?.name}</span> 👤
              </NavLink>
              <button onClick={handleLogout} className="btn-book">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-book">
                {t('nav.login')}
              </NavLink>
              <NavLink to="/register" className="btn-book btn-register">
                {t('nav.register')}
              </NavLink>
            </>
          )}

          <button
            className="mobile-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <img src={HamburgerIcon} alt="Menu" className="hamburger-img" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-menu open">
          <NavLink to="/learning-path" className="nav-link" onClick={closeMobileMenu}>
            {t('nav.startLearning')}
          </NavLink>
          <NavLink to="/progress" className="nav-link" onClick={closeMobileMenu}>
            {t('nav.progress')}
          </NavLink>

          <NavLink to="/pricing" className="nav-link" onClick={closeMobileMenu}>
            {t('nav.pricing')}
          </NavLink>

          <NavLink to="/test" className="nav-link" onClick={closeMobileMenu}>
            {t('nav.practiceTests')}
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link" onClick={closeMobileMenu}>
            {t('nav.interactiveClasses')}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" onClick={closeMobileMenu} style={{ color: '#FFF2B7', fontWeight: 800 }}>
              {t('nav.adminDashboard')}
            </NavLink>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => {
                handleLogout()
                closeMobileMenu()
              }}
              className="btn-book"
            >
              {t('nav.logout')} ({user?.name})
            </button>
          ) : (
            <div className="mobile-auth-buttons">
              <NavLink to="/login" className="btn-book" onClick={closeMobileMenu}>
                {t('nav.login')}
              </NavLink>
              <NavLink to="/register" className="btn-book btn-register" onClick={closeMobileMenu}>
                {t('nav.register')}
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header

