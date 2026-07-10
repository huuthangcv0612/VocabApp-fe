import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import '../styles/components/header.css'
import useAuth from '../hooks/useAuth'

type HeaderProps = {
  animate?: boolean
}

const Header = ({ animate = false }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={`header ${animate ? 'header--animated' : ''}`}>
      <div className="header-container">
        <NavLink to="/" className="logo">
          <span className="logo-text">DeutschUp</span>
        </NavLink>

        <nav className="nav-menu">
          <NavLink to="/levels" className="nav-link">
            Trình Độ
          </NavLink>
          <NavLink to="/interactive-room" className="nav-link">
            Phòng Học Tương Tác
          </NavLink>
        </nav>

        {isAuthenticated ? (
          <>
            <NavLink to="/levels" className="btn-start">
              Tiếp Tục Học
            </NavLink>
            <button 
              onClick={handleLogout} 
              className="btn-start"
              style={{ background: '#ddd', color: '#003d82', border: 'none', cursor: 'pointer' }}
            >
              Đăng Xuất
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn-start">
              Đăng Nhập
            </NavLink>
            <NavLink to="/register" className="btn-start" style={{ marginLeft: '1rem' }}>
              Đăng Ký
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
