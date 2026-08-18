import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLevels } from '../hooks/useApi'
import type { Level } from '../services/api'
import CloudIcon from '../assets/Cloud.svg'
import SchoolIcon from '../assets/School 1.svg'
import '../styles/pages/levels.css'

const DEFAULT_LEVELS: Level[] = [
  { _id: 'A1.1', level_name: 'A1.1', description: 'Trình độ tiếng Đức căn bản 1 cho người mới bắt đầu', order: 1 },
  { _id: 'A1.2', level_name: 'A1.2', description: 'Trình độ tiếng Đức căn bản 2', order: 2 },
  { _id: 'A2.1', level_name: 'A2.1', description: 'Trình độ tiếng Đức sơ cấp 1', order: 3 },
  { _id: 'A2.2', level_name: 'A2.2', description: 'Trình độ tiếng Đức sơ cấp 2', order: 4 },
  { _id: 'B1.1', level_name: 'B1.1', description: 'Trình độ tiếng Đức trung cấp 1', order: 5 },
  { _id: 'B1.2', level_name: 'B1.2', description: 'Trình độ tiếng Đức trung cấp 2', order: 6 },
]

const Levels = () => {
  const { levels, loading: levelsLoading, error: levelsError } = useLevels()
  const navigate = useNavigate()

  const safeLevels = useMemo(() => {
    if (Array.isArray(levels) && levels.length > 0) {
      return levels
    }
    return DEFAULT_LEVELS
  }, [levels])

  return (
    <div className="levels-page">
      <Header />

      {/* Section 1: Hero Banner */}
      <section className="levels-hero-section">
        {/* Floating Clouds */}
        <img src={CloudIcon} alt="" className="hero-cloud cloud-1" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-2" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-3" />

        <div className="hero-container">
          <div className="hero-title-wrapper">
            <h1 className="hero-title">
              CHOOSE<br />LEVEL
            </h1>
          </div>

          <div className="hero-school-wrapper">
            <img src={SchoolIcon} alt="School" className="hero-school-img" />
          </div>
        </div>

        {/* Bottom Scalloped Wave */}
        <div className="hero-wave"></div>
      </section>

      {/* Section 2: Card-Level Selection (Referenced Design) */}
      <section className="card-level-section">
        <div className="card-level-container">
          {/* Left Side: Step by Step Title & Book Illustration */}
          <div className="card-level-left">
            <h2 className="step-title">
              STEP BY STEP<br />TO APPLY
            </h2>

            <div className="illustration-wrapper">
              <img src={CloudIcon} alt="" className="side-cloud cloud-left" />
              <img src={CloudIcon} alt="" className="side-cloud cloud-right" />

              {/* Stack of Books with Moon & Stars SVG */}
              <svg width="220" height="190" viewBox="0 0 240 200" fill="none" className="book-stack-svg">
                <path d="M30 175 C20 175 12 165 12 155 C12 145 22 140 32 140 C37 130 52 125 67 130 C77 120 97 120 107 130 C117 125 132 130 137 140 C147 140 157 145 157 155 C157 165 147 175 137 175 Z" fill="#FFFFFF" opacity="0.9" />
                <rect x="45" y="140" width="130" height="24" rx="5" fill="#D90000" />
                <rect x="55" y="146" width="26" height="12" rx="2" fill="#2A63E8" />
                <rect x="90" y="147" width="75" height="3" fill="#FFCC00" />
                <rect x="30" y="114" width="145" height="24" rx="5" fill="#FFCC00" />
                <path d="M40 114 L80 138 H70 L30 114 Z" fill="#D90000" opacity="0.6" />
                <rect x="50" y="89" width="115" height="23" rx="5" fill="#D90000" />
                <rect x="60" y="94" width="16" height="13" fill="#FFFFFF" />
                <rect x="35" y="66" width="130" height="21" rx="4" fill="#2A63E8" />
                <line x1="55" y1="66" x2="55" y2="87" stroke="#FFCC00" strokeWidth="3" />
                <line x1="75" y1="66" x2="75" y2="87" stroke="#FFCC00" strokeWidth="3" />
                <line x1="95" y1="66" x2="95" y2="87" stroke="#FFCC00" strokeWidth="3" />
                <line x1="115" y1="66" x2="115" y2="87" stroke="#FFCC00" strokeWidth="3" />
                <path d="M70 20 C60 20 52 28 52 38 C52 48 60 56 70 56 C65 51 62 44 62 38 C62 32 65 25 70 20 Z" fill="#FFCC00" />
                <path d="M95 18 L98 25 L105 25 L99 29 L101 36 L95 32 L89 36 L91 29 L85 25 L92 25 Z" fill="#D90000" />
                <path d="M120 36 L122 41 L127 41 L123 44 L124 49 L120 46 L116 49 L117 44 L113 41 L118 41 Z" fill="#2A63E8" />
              </svg>
            </div>
          </div>

          {/* Right Side: Level Cards Grid */}
          <div className="card-level-right">
            {levelsLoading && <p className="status-text">Đang tải danh sách trình độ...</p>}
            {levelsError && <p className="status-text error">Lỗi tải danh sách level: {levelsError}</p>}

            <div className="card-level-grid">
              {safeLevels.map((level, index) => {
                const isBlue = index % 4 === 0 || index % 4 === 3
                const numberStr = String(index + 1).padStart(2, '0') + '.'
                const levelName = level.level_name || (level as any).name || `A${index + 1}`

                return (
                  <div
                    key={level._id || levelName}
                    className={`card-level-item ${isBlue ? 'card-blue' : 'card-red'}`}
                    onClick={() => navigate(`/topics/${level._id || levelName}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-level-number">{numberStr}</div>
                    <div className="card-level-body">
                      <h3 className="card-level-title">LEVEL {levelName}</h3>
                      <p className="card-level-desc">
                        {level.description || `Trình độ tiếng Đức căn bản ${levelName} với đầy đủ bài học từ vựng.`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Levels
