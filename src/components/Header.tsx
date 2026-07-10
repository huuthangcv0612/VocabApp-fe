import { Link } from 'react-router-dom'
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
        <Link to="/" className="logo">
          <span className="logo-text">DeutschUp</span>
        </Link>
        
        <nav className="nav-menu">
          <Link to="/levels" className="nav-link">
            Trình Độ
          </Link>
          <Link to="/interactive-room" className="nav-link">
            Phòng Học Tương Tác
          </Link>
        </nav>

        {isAuthenticated ? (
          <>
            <Link to="/levels" className="btn-start">
              Tiếp Tục Học
            </Link>
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
            <Link to="/login" className="btn-start">
              Đăng Nhập
            </Link>
            <Link to="/register" className="btn-start" style={{ marginLeft: '1rem' }}>
              Đăng Ký
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
