import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../styles/components/header.css'
import useAuth from '../hooks/useAuth'
import HamburgerIcon from '../assets/Hamberger.svg'
import DeutschUpLogo from '../assets/DEUTSCHUP.svg'

type HeaderProps = {
  animate?: boolean
}

const Header = ({ animate = false }: HeaderProps) => {
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
          <NavLink to="/levels" className="nav-link">
            Start Learning
          </NavLink>
          <NavLink to="/progress" className="nav-link">
            Progress
          </NavLink>
          <NavLink to="/pricing" className="nav-link">
            Pricing
          </NavLink>
          <NavLink to="/test" className="nav-link">
            Practice Tests
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link">
            Interactive Classes
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" style={{ color: '#FFF2B7', fontWeight: 800 }}>
              ⚙️ Admin Dashboard
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                Hallo, <span className="username">{user?.name}</span>
              </span>
              <button onClick={handleLogout} className="btn-book">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-book">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-book btn-register">
                Register
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
          <NavLink to="/levels" className="nav-link" onClick={closeMobileMenu}>
            Start Learning
          </NavLink>
          <NavLink to="/progress" className="nav-link" onClick={closeMobileMenu}>
            Progress
          </NavLink>
          <NavLink to="/pricing" className="nav-link" onClick={closeMobileMenu}>
            Pricing
          </NavLink>
          <NavLink to="/test" className="nav-link" onClick={closeMobileMenu}>
            Practice Tests
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link" onClick={closeMobileMenu}>
            Interactive Classes
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" onClick={closeMobileMenu} style={{ color: '#FFF2B7', fontWeight: 800 }}>
              ⚙️ Admin Dashboard
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
              Logout ({user?.name})
            </button>
          ) : (
            <div className="mobile-auth-buttons">
              <NavLink to="/login" className="btn-book" onClick={closeMobileMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn-book btn-register" onClick={closeMobileMenu}>
                Register
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header
