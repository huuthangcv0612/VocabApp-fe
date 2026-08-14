import { useMemo, useState } from 'react'
import Header from '../components/Header'
import LevelTabs from '../components/LevelTabs'
import LevelCard from '../components/LevelCard'
import Footer from '../components/Footer'
import { useLevels, useLektions } from '../hooks/useApi'
import type { Level } from '../services/api'
import '../styles/pages/levels.css'

const LEVEL_GROUPS = [
  { key: 'A1', label: 'Level A1' },
  { key: 'A2', label: 'Level A2' },
  { key: 'B1', label: 'Level B1' },
]

const DEFAULT_LEVELS: Level[] = [
  { _id: 'A1.1', level_name: 'A1.1', description: 'Trình độ tiếng Đức căn bản 1 cho người mới bắt đầu', order: 1 },
  { _id: 'A1.2', level_name: 'A1.2', description: 'Trình độ tiếng Đức căn bản 2', order: 2 },
  { _id: 'A2.1', level_name: 'A2.1', description: 'Trình độ tiếng Đức sơ cấp 1', order: 3 },
  { _id: 'A2.2', level_name: 'A2.2', description: 'Trình độ tiếng Đức sơ cấp 2', order: 4 },
  { _id: 'B1.1', level_name: 'B1.1', description: 'Trình độ tiếng Đức trung cấp 1', order: 5 },
]

const getIconByLevel = (levelName?: string) => {
  if (!levelName || typeof levelName !== 'string') return '📘'
  if (levelName.includes('A1.1')) return '👤'
  if (levelName.includes('A1.2')) return '👥'
  if (levelName.includes('A1.3')) return '📦'
  if (levelName.includes('A2.1')) return '🛍️'
  if (levelName.includes('A2.2')) return '📚'
  if (levelName.includes('B1')) return '🚀'
  return '📘'
}

const Levels = () => {
  const { levels, loading: levelsLoading, error: levelsError } = useLevels()
  const { lektions } = useLektions()
  const [activeGroup, setActiveGroup] = useState('A1')

  const safeLevels = useMemo(() => {
    if (Array.isArray(levels) && levels.length > 0) {
      return levels
    }
    return DEFAULT_LEVELS
  }, [levels])

  const lektionCounts = useMemo(() => {
    if (!Array.isArray(lektions)) return {}
    return lektions.reduce<Record<string, number>>((acc, lektion) => {
      if (!lektion) return acc
      const rawLevel = lektion.level_id || lektion.level
      if (!rawLevel) return acc
      const levelId = typeof rawLevel === 'string' ? rawLevel : rawLevel._id
      if (levelId) {
        acc[levelId] = (acc[levelId] ?? 0) + 1
      }
      return acc
    }, {})
  }, [lektions])

  const groupedLevels = useMemo(() => {
    return LEVEL_GROUPS.reduce<Record<string, Level[]>>((acc, group) => {
      acc[group.key] = safeLevels.filter((level) => {
        const name = level?.level_name || (level as any)?.name || ''
        return typeof name === 'string' && name.toUpperCase().includes(group.key.toUpperCase())
      })
      return acc
    }, {})
  }, [safeLevels])

  const groupLevels = groupedLevels[activeGroup] || []
  const currentLevels = groupLevels.length > 0 ? groupLevels : safeLevels

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          <h1 className="levels-title">Choose Your Level</h1>
          <p className="levels-description">
            Start your journey to mastering German from the very beginning. Choose the learning path that best suits your current level and helps you progress in your language-learning journey.
          </p>

          <div className="levels-tabs-wrapper">
            <LevelTabs
              levels={LEVEL_GROUPS.map((group) => group.key)}
              labels={LEVEL_GROUPS.map((group) => group.label)}
              activeLevel={activeGroup}
              onSelectLevel={setActiveGroup}
            />
          </div>

          {levelsLoading && <p className="status-text">Loading levels...</p>}
          {levelsError && <p className="status-text error">Lỗi tải danh sách level: {levelsError}</p>}

          <div className="levels-grid">
            {currentLevels.map((level) => {
              const levelName = level?.level_name || (level as any)?.name || 'Standard'
              const levelId = level?._id || levelName
              return (
                <LevelCard
                  key={levelId}
                  level={{
                    id: levelId,
                    title: `Level ${levelName}`,
                    description: level?.description || `Khám phá bài học trình độ ${levelName}`,
                    lessonCount: lektionCounts[levelId] ?? 0,
                    icon: getIconByLevel(levelName),
                  }}
                />
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Levels
