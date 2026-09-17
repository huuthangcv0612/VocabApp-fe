import React from 'react'
import type { AIFeedback as AIFeedbackType } from '../types/aiConversation'

interface AIFeedbackProps {
  feedback?: AIFeedbackType | null
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ feedback }) => {
  if (!feedback) return null

  if (feedback.is_correct) {
    return (
      <div className="ai-feedback-box correct">
        ✓ Sehr gut!
      </div>
    )
  }

  return (
    <div className="ai-feedback-box incorrect">
      {feedback.correction && (
        <div className="ai-feedback-correction">
          ✏️ Correction: {feedback.correction}
        </div>
      )}
      {feedback.explanation && (
        <div className="ai-feedback-explanation">
          💡 Explanation: {feedback.explanation}
        </div>
      )}
    </div>
  )
}

export default AIFeedback
