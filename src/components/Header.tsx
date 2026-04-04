import { Link } from 'react-router-dom'
import '../styles/components/header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">DeutschUp</span>
        </Link>
        
        <nav className="nav-menu">
          <Link to="/levels" className="nav-link">
            Trình Độ
          </Link>
          <Link to="/classroom" className="nav-link">
            Phòng Học Tương Tác
          </Link>
        </nav>

        <Link to="/levels" className="btn-start">
          Bắt Đầu Ngay
        </Link>
      </div>
    </header>
  )
}

export default Header
