import React from 'react'
import { useTranslation } from 'react-i18next'
import type { AIFeedback as AIFeedbackType } from '../types/aiConversation'

interface AIFeedbackProps {
  feedback?: AIFeedbackType | null
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ feedback }) => {
  const { t } = useTranslation('ai')
  if (!feedback) return null

  if (feedback.is_correct) {
    return (
      <div className="ai-feedback-box correct">
        {t('conversation.sehrGut')}
      </div>
    )
  }

  return (
    <div className="ai-feedback-box incorrect">
      {feedback.correction && (
        <div className="ai-feedback-correction">
          {t('conversation.correction')} {feedback.correction}
        </div>
      )}
      {feedback.explanation && (
        <div className="ai-feedback-explanation">
          {t('conversation.explanation')} {feedback.explanation}
        </div>
      )}
    </div>
  )
}

export default AIFeedback
