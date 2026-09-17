import React from 'react'
import type { AIMessage, AIFeedback as AIFeedbackType } from '../types/aiConversation'
import AIFeedback from './AIFeedback'

interface AIMessageBubbleProps {
  message: AIMessage
  feedback?: AIFeedbackType | null
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message, feedback }) => {
  return (
    <div className="ai-msg-row assistant">
      <div className="ai-avatar assistant">🤖</div>
      <div style={{ flex: 1 }}>
        <div className="ai-bubble assistant">
          {message.content}
        </div>
        <AIFeedback feedback={feedback} />
      </div>
    </div>
  )
}

export default AIMessageBubble
