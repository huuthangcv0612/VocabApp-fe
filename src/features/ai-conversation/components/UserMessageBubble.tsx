import React from 'react'
import type { AIMessage } from '../types/aiConversation'

interface UserMessageBubbleProps {
  message: AIMessage
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ message }) => {
  return (
    <div className="ai-msg-row user">
      <div className="ai-avatar user">👤</div>
      <div className="ai-bubble user">
        {message.content}
      </div>
    </div>
  )
}

export default UserMessageBubble
