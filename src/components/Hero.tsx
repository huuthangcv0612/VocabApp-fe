import { Link } from 'react-router-dom'
import '../styles/components/hero.css'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot">●</span>
            <span className="badge-text">Nền tảng học tiếng Đức chuẩn Bauhaus</span>
          </div>

          <h1 className="hero-title">
            Chinh phục <span className="highlight">Tiếng Đức</span> với sự chuẩn xác
          </h1>

          <p className="hero-description">
            Lộ trình học tập cá nhân hóa từ A1 đến B1. Trải nghiệm phương pháp sư phạm hiện đại kết hợp cùng công nghệ tương tác định cao, giúp bạn làm chủ ngôn ngữ một cách tự nhiên và bền vững nhất.
          </p>

          <div className="hero-buttons">
            <Link to="/levels" className="btn btn-primary">
              Bắt Đầu Ngay
            </Link>
            <Link to="/levels" className="btn btn-secondary">
              Khám Phá Trình Độ
            </Link>
          </div>

          <div className="course-badges">
            <div className="course-badge">
              <span className="badge-checkmark">✓</span>
              <span className="badge-label">Tiêu chuẩn Bauhaus</span>
            </div>
            <div className="course-badge">
              <span className="badge-checkmark">✓</span>
              <span className="badge-label">Lộ trình chuẩn CEFR</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-placeholder">
            <div className="image-content-badge">
              <span className="badge-icon">✓</span>
              <div>
                <div className="badge-title">Trình độ A1 - B1</div>
                <div className="badge-subtitle">Học viên xuất sắc</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
