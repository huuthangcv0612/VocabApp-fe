import React from 'react'
import type { LearningPathUnit } from '../types/learningPath'
import LessonPath from './LessonPath'

interface UnitSectionProps {
  unit: LearningPathUnit
  unitIndex: number
}

export const UnitSection: React.FC<UnitSectionProps> = ({ unit, unitIndex }) => {
  const {
    title,
    lessons,
    completedLessonsCount,
    totalLessonsCount,
  } = unit

  return (
    <section className="lp-unit-section">
      {/* Unit Marker matching reference image */}
      <div className="lp-unit-marker">
        <span className="lp-marker-dot" />
        <div className="lp-marker-info">
          <span className="lp-unit-label">Unit {unitIndex + 1}</span>
          <h4 className="lp-unit-name-title">
            {title} <span className="lp-unit-count">({completedLessonsCount}/{totalLessonsCount})</span>
          </h4>
        </div>
      </div>

      {/* Lesson Path Nodes */}
      <div className="lp-unit-body">
        <LessonPath lessons={lessons} />
      </div>
    </section>
  )
}

export default UnitSection
