import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLektions, useLevels } from '../hooks/useApi'
import { vocabularyApi } from '../services/api'
import '../styles/pages/levels.css'

const LevelDetail = () => {
  const { levelId } = useParams<{ levelId: string }>()
  const { lektions, loading, error } = useLektions(levelId)
  const { levels } = useLevels()
  const [vocabCounts, setVocabCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (lektions.length === 0) {
      setVocabCounts({})
      return
    }

    const loadCounts = async () => {
      const counts: Record<string, number> = {}
      await Promise.all(
        lektions.map(async (lektion) => {
          try {
            const vocab = await vocabularyApi.getByLektionId(lektion._id)
            counts[lektion._id] = Array.isArray(vocab) ? vocab.length : 0
          } catch {
            counts[lektion._id] = 0
          }
        })
      )
      setVocabCounts(counts)
    }

    loadCounts()
  }, [lektions])

  const level = levels.find((item) => item._id === levelId)
  const levelTitle = level ? `Cấp Độ ${level.level_name}` : 'Danh sách bài học'

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          <Link to="/levels" className="back-button">
            <span className="back-icon">←</span>
            Quay Lại chọn cấp độ
          </Link>

          <h1 className="levels-title">{levelTitle}</h1>
          <p className="levels-description">
            Chọn bài học phù hợp trong cấp độ này và tiếp tục hành trình học từ vựng tiếng Đức.
          </p>

          {loading && <p className="status-text">Đang tải bài học...</p>}
          {error && <p className="status-text error">Lỗi: {error}</p>}

          <div className="levels-grid">
            {lektions.map((lektion) => {
              const displayTitle = lektion.lektion_name.includes('-')
                ? lektion.lektion_name.split('-').pop()?.trim() || lektion.lektion_name
                : lektion.lektion_name
              const count = vocabCounts[lektion._id] ?? 0

              return (
                <div key={lektion._id} className="level-card">
                  <div className="card-icon">📘</div>
                  <h3 className="card-title">{displayTitle}</h3>
                  <p className="card-description">{count} từ vựng trong lektion này</p>
                  <Link to={`/lektion/${lektion._id}`} className="card-button">
                    Xem bài học
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