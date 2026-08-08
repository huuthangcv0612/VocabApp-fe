import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useVocabulary } from '../hooks/useApi'
import '../styles/pages/lesson.css'

const Lektion = () => {
  const { lektionId } = useParams<{ lektionId: string }>()
  const { vocabulary, loading, error } = useVocabulary(lektionId)

  return (
    <div className="lesson">
      <Header />
      <section className="lesson-section">
        <div className="lesson-container">
          <Link to="/levels" className="back-button">
            <span className="back-icon">←</span>
            Chọn Lektion
          </Link>

          <div className="badge-section">
            <div className="badge">
              <span className="badge-icon">📚</span>
              <span className="badge-text">Choose Learning Mode</span>
            </div>
          </div>

          <h1 className="lesson-title">
            Learning Tools <span className="highlight">Breakthrough</span>
          </h1>

          <p className="lesson-description">
            A diverse range of interactive exercises helps you memorize German vocabulary and grammar naturally, effectively, and never boring.
          </p>

          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-icon">🃏</div>
              <div className="tool-label">Flashcard</div>
              <p className="tool-description">
                Learn vocabulary effectively with double-sided flashcards. Front side in German, back side with Vietnamese translation and illustrative examples.
              </p>
              <Link to={`/flashcard/${lektionId}`} className="tool-button">
                Start Flashcard
              </Link>
            </div>

            <div className="tool-card">
              <div className="tool-icon">📝</div>
              <div className="tool-label">Quiz</div>
              <p className="tool-description">
                Get instant feedback on your memory with our input system. Immediate correct/incorrect feedback with visual effects to reinforce learning.
              </p>
              <Link to={`/quiz/${lektionId}`} className="tool-button">
                Start Quiz
              </Link>
            </div>

            <div className="tool-card">
              <div className="tool-icon">🎯</div>
              <div className="tool-label">Spin Wheel</div>
              <p className="tool-description">
                Test your reflexes with the random spin wheel. When the wheel stops on a word, you will practice forming real sentences with that word.
              </p>
              <Link to={`/spinwheel/${lektionId}`} className="tool-button">
                Start Spin Wheel
              </Link>
            </div>
          </div>

          {loading && <p className="status-text">Loading vocabulary...</p>}
          {error && <p className="status-text error">Error: {error}</p>}
          {!loading && !error && vocabulary.length === 0 && (
            <p className="status-text">No vocabulary available for this lesson.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Lektion
