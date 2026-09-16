import React, { useMemo } from 'react'
import type { LearningPathLesson } from '../types/learningPath'
import LessonNode from './LessonNode'

interface LessonPathProps {
  lessons: LearningPathLesson[]
}

// Serpentine 3-node row offsets (in px) matching reference image:
// Row 1 (0..2): 0 -> 130 -> 260
// Row 2 (3..5): 260 -> 130 -> 0
const SERPENTINE_OFFSETS = [0, 130, 260, 260, 130, 0]

export const LessonPath: React.FC<LessonPathProps> = ({ lessons }) => {
  const nodeOffsets = useMemo(() => {
    return lessons.map((_, idx) => SERPENTINE_OFFSETS[idx % SERPENTINE_OFFSETS.length])
  }, [lessons])

  if (!lessons || lessons.length === 0) {
    return (
      <div className="lp-path-empty">
        <p>Chưa có bài học nào trong Unit này.</p>
      </div>
    )
  }

  return (
    <div className="lp-path-container">
      <div className="lp-path-nodes">
        {lessons.map((lesson, index) => {
          const offset = nodeOffsets[index]
          return (
            <div key={lesson._id} className="lp-path-step">
              <LessonNode
                lesson={lesson}
                index={index}
                offsetPercent={offset}
              />
            </div>
          )
        })}
      </div>

      {/* Unit Completion Crown Banner at end of Path */}
      <div className="lp-path-end-flag">
        <div className="lp-end-crown-circle">
          <span className="lp-end-icon">👑</span>
          <div className="lp-flag-mini">🚩</div>
        </div>
        <div className="lp-end-label">
          <span className="lp-end-title">Hoàn thành phần này</span>
          <span className="lp-end-xp">Nhận 100 XP ⚡</span>
        </div>
      </div>
    </div>
  )
}

export default LessonPath
