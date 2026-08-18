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
            Bắt đầu học
          </NavLink>
          <NavLink to="/topics" className="nav-link">
            Chủ đề
          </NavLink>
          <NavLink to="/progress" className="nav-link">
            Tiến độ
          </NavLink>
          <NavLink to="/pricing" className="nav-link">
            Gói học
          </NavLink>
          <NavLink to="/test" className="nav-link">
            Luyện thi
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link">
            Lớp học tương tác
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
            Bắt đầu học
          </NavLink>
          <NavLink to="/topics" className="nav-link" onClick={closeMobileMenu}>
            Chủ đề
          </NavLink>
          <NavLink to="/progress" className="nav-link" onClick={closeMobileMenu}>
            Tiến độ
          </NavLink>
          <NavLink to="/pricing" className="nav-link" onClick={closeMobileMenu}>
            Gói học
          </NavLink>
          <NavLink to="/test" className="nav-link" onClick={closeMobileMenu}>
            Luyện thi
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link" onClick={closeMobileMenu}>
            Lớp học tương tác
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
