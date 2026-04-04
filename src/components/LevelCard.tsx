import { useNavigate } from 'react-router-dom'
import '../styles/components/level-card.css'

interface Level {
  id: string
  title: string
  description: string
  lessonCount: number
  icon: string
}

interface LevelCardProps {
  level: Level
}

const LevelCard = ({ level }: LevelCardProps) => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate(`/levels/${level.id}`)
  }

  return (
    <div className="level-card">
      <div className="card-icon">{level.icon}</div>
      <h3 className="card-title">{level.title}</h3>
      <p className="card-description">{level.description}</p>
      <div className="card-vocabulary">
        <span className="vocabulary-icon">✨</span>
        <span className="vocabulary-count">{level.lessonCount} Lektion</span>
      </div>
      <button className="card-button" onClick={handleStart}>
        <span className="button-icon">🛒</span>
        Bắt Đầu Học
      </button>
    </div>
  )
}

export default LevelCard
