import { useMemo, useState } from 'react'
import Header from '../components/Header'
import LevelTabs from '../components/LevelTabs'
import LevelCard from '../components/LevelCard'
import Footer from '../components/Footer'
import { useLevels, useLektions } from '../hooks/useApi'
import '../styles/pages/levels.css'

const LEVEL_GROUPS = [
  { key: 'A1', label: 'Trình Độ A1' },
  { key: 'A2', label: 'Trình Độ A2' },
  { key: 'B1', label: 'Trình Độ B1' },
]

const getIconByLevel = (levelName: string) => {
  if (levelName.startsWith('A1.1')) return '👤'
  if (levelName.startsWith('A1.2')) return '👥'
  if (levelName.startsWith('A1.3')) return '📦'
  if (levelName.startsWith('A2.1')) return '🛍️'
  if (levelName.startsWith('A2.2')) return '📚'
  if (levelName.startsWith('B1')) return '🚀'
  return '📘'
}

const Levels = () => {
  const { levels, loading: levelsLoading, error: levelsError } = useLevels()
  const { lektions } = useLektions()
  const [activeGroup, setActiveGroup] = useState('A1')

  const lektionCounts = useMemo(() => {
    return lektions.reduce<Record<string, number>>((acc, lektion) => {
      const levelId = typeof lektion.level_id === 'string' ? lektion.level_id : lektion.level_id._id
      acc[levelId] = (acc[levelId] ?? 0) + 1
      return acc
    }, {})
  }, [lektions])

  const groupedLevels = LEVEL_GROUPS.reduce<Record<string, typeof levels>>((acc, group) => {
    acc[group.key] = levels.filter((level) => level.level_name.startsWith(group.key))
    return acc
  }, {})

  const currentLevels = groupedLevels[activeGroup] || []

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          <h1 className="levels-title">Chọn Cấp Độ Của Bạn</h1>
          <p className="levels-description">
            Bắt đầu hành trình chinh phục tiếng Đức từ những bước chân đầu tiên. Lựa chọn lộ trình phù hợp để thăng tiến trình độ ngôn ngữ của bạn.
          </p>

          <div className="levels-tabs-wrapper">
            <LevelTabs
              levels={LEVEL_GROUPS.map((group) => group.key)}
              labels={LEVEL_GROUPS.map((group) => group.label)}
              activeLevel={activeGroup}
              onSelectLevel={setActiveGroup}
            />
          </div>

          {levelsLoading && <p className="status-text">Đang tải cấp độ...</p>}
          {levelsError && <p className="status-text error">Lỗi: {levelsError}</p>}
          {!levelsLoading && !levelsError && currentLevels.length === 0 && (
            <p className="status-text">Không có cấp độ trong nhóm này.</p>
          )}

          <div className="levels-grid">
            {currentLevels.map((level) => (
              <LevelCard
                key={level._id}
                level={{
                  id: level._id,
                  title: `Cấp Độ ${level.level_name}`,
                  description: level.description,
                  lessonCount: lektionCounts[level._id] ?? 0,
                  icon: getIconByLevel(level.level_name),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Levels
