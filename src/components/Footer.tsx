import { Link } from 'react-router-dom'
import '../styles/components/footer.css'

import CloudIcon from '../assets/Cloud.svg'
import FooterKid from '../assets/Footer-Kid.svg'
import AirBalloonIcon from '../assets/Icon-AirBollon.svg'
import SunIcon from '../assets/Icon-Sun.svg'
import PlaneIcon from '../assets/Icon-plane.svg'

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Scalloped Wave Border */}
      <div className="footer-wave"></div>

      {/* Sky Blue Section */}
      <div className="footer-sky-section">
        {/* Floating Sky SVGs */}
        <img src={CloudIcon} alt="" className="sky-deco deco-cloud-1" />
        <img src={CloudIcon} alt="" className="sky-deco deco-cloud-2" />
        <img src={CloudIcon} alt="" className="sky-deco deco-cloud-3" />
        <img src={CloudIcon} alt="" className="sky-deco deco-cloud-4" />
        <img src={CloudIcon} alt="" className="sky-deco deco-cloud-5" />

        <img src={SunIcon} alt="Sun" className="sky-deco deco-sun" />
        <img src={AirBalloonIcon} alt="Hot Air Balloon" className="sky-deco deco-balloon" />
        <img src={PlaneIcon} alt="Paper Plane" className="sky-deco deco-plane" />

        {/* White Inner Card */}
        <div className="footer-card">
          <div className="footer-card-top">
            {/* Kid Illustration */}
            <div className="footer-kid-wrapper">
              <img src={FooterKid} alt="DeutschUp Kid" className="footer-kid-img" />
            </div>

            {/* Nav Columns & Contact */}
            <div className="footer-nav-content">
              <div className="footer-nav-columns">
                <div className="footer-col">
                  <Link to="/" className="footer-link">Home</Link>
                  <Link to="/" className="footer-link">About</Link>
                  <Link to="/interactive-room" className="footer-link">Admissions</Link>
                  <Link to="/levels" className="footer-link">Programs</Link>
                </div>

                <div className="footer-col">
                  <Link to="/levels" className="footer-link">Tuition</Link>
                  <Link to="/interactive-room" className="footer-link">Parent Resources</Link>
                  <Link to="/levels" className="footer-link">Teachers</Link>
                  <Link to="/levels" className="footer-link">Gallery</Link>
                </div>

                <div className="footer-col">
                  <a href="#faq" className="footer-link">FAQ</a>
                  <a href="#careers" className="footer-link">Careers</a>
                  <a href="#news" className="footer-link">News</a>
                  <a href="#contact" className="footer-link">Contact</a>
                </div>
              </div>

              {/* Social Icons & Email */}
              <div className="footer-social-row">
                <div className="social-icons">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    title="LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    title="Instagram"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    title="Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.6 13.78 5.6c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z" />
                    </svg>
                  </a>
                </div>

                <a href="mailto:hello@deutschup.com" className="footer-email">
                  huuthang.cv0612@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Card Bottom: DeutschUp Red Logo & Legal Links */}
          <div className="footer-card-bottom">
            <div className="footer-brand-logo">
              DeutschUp
            </div>

            <div className="footer-bottom-meta">
              <div className="footer-legal-links">
                <a href="#terms">Term & Condition</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
              <div className="footer-copyright-text">
                © 2026 DeutschUp
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

