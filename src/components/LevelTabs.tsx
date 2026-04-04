import '../styles/components/level-tabs.css'

interface LevelTabsProps {
  levels: string[]
  labels: string[]
  activeLevel: string
  onSelectLevel: (level: string) => void
}

const LevelTabs = ({ levels, labels, activeLevel, onSelectLevel }: LevelTabsProps) => {
  return (
    <div className="level-tabs">
      {levels.map((level, index) => (
        <button
          key={level}
          className={`level-tab ${activeLevel === level ? 'active' : ''}`}
          onClick={() => onSelectLevel(level)}
        >
          {labels[index]}
        </button>
      ))}
    </div>
  )
}

export default LevelTabs
