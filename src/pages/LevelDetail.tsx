import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLektions, useLevels } from '../hooks/useApi'
import '../styles/pages/levels.css'

const LevelDetail = () => {
  const { levelId } = useParams<{ levelId: string }>()
  const { lektions, loading, error } = useLektions(levelId)
  const { levels } = useLevels()

  const level = levels.find((item) => item._id === levelId)
  const levelTitle = level ? `Cấp Độ ${level.level_name}` : 'Danh sách bài học'

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          <Link to="/levels" className="back-button">
            <span className="back-icon">←</span>
            Return to Levels
          </Link>

          <h1 className="levels-title">{levelTitle}</h1>
          <p className="levels-description">
            Choose the lessons that fit your level and continue your journey in learning German vocabulary.
          </p>

          {loading && <p className="status-text">Loading lessons...</p>}
          {error && <p className="status-text error">Error: {error}</p>}

          <div className="levels-grid">
            {lektions.map((lektion) => {
              const displayTitle = lektion.lektion_name.includes('-')
                ? lektion.lektion_name.split('-').pop()?.trim() || lektion.lektion_name
                : lektion.lektion_name
              const count = typeof lektion.vocabularyCount === 'number' ? lektion.vocabularyCount : 0

              return (
                <div key={lektion._id} className="level-card">
                  <div className="card-icon">📘</div>
                  <h3 className="card-title">{displayTitle}</h3>
                  <p className="card-description">{count} vocabulary words </p>
                  <Link to={`/lektion/${lektion._id}`} className="card-button">
                    View Lesson
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LevelDetail