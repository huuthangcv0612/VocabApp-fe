import { Link } from 'react-router-dom'
import '../styles/components/footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-section brand">
            <h3 className="footer-logo">DeutschUp</h3>
            <p className="footer-description">
              Khám phá tinh hoa ngôn ngữ và văn hóa Đức cùng lộ trình học tập hiện đại, giúp bạn làm chủ tương lai và vượt xa trên con đường sự nghiệp quốc tế.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/duhocbkt" className="social-icon" title="Facebook">
                f
              </a>
              <a href="https://twitter.com" className="social-icon" title="Twitter">
                𝕏
              </a>
              <a href="https://instagram.com" className="social-icon" title="Instagram">
                📷
              </a>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">ĐIỀU HƯỚNG</h4>
            <ul className="footer-links">
              <li>
                <Link to="/levels">Trình Độ</Link>
              </li>
              <li>
                <Link to="/">Phòng Học Tương Tác</Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">HỖ TRỢ HỌC VIÊN</h4>
            <ul className="footer-links">
              <li>
                <a href="#faq">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#roadmap">Lộ trình học tập</a>
              </li>
              <li>
                <a href="#security">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#services">Điều khoản dịch vụ</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">LIÊN HỆ</h4>
            <div className="contact-items">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span className="contact-text">60B Nguyễn Huy Tưởng, Hà Nội</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <a href="tel:0987654321" className="contact-text">0938.862.186</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <a href="https://www.bkt.edu.vn/" className="contact-text" target="_blank" rel="noopener noreferrer">
                  https://www.bkt.edu.vn/
                </a>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="footer-section map-section">
            <h4 className="footer-section-title">VỊ TRÍ</h4>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.840665254526!2d105.80410577605198!3d20.999023180642922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac97ec1852a7%3A0xc52e8c9935768f5f!2zNjBCIE5ndXnhu4VuIEh1eSBUxrDhu59uZywgVGhhbmggWHXDom4gVHJ1bmcsIFRoYW5oIFh1w6JuLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1775279272826!5m2!1svi!2s"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DeutschUp Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-copyright">
        <p>© 2026 DeutschUp. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.</p>
      </div>
    </footer>
  )
}

export default Footer
