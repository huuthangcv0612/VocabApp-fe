import React from 'react'
import type { AIMessage } from '../types/aiConversation'

interface UserMessageBubbleProps {
  message: AIMessage
}

export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ message }) => {
  const content =
    typeof message === 'string'
      ? message
      : message?.content ||
        (message as unknown as { message?: string; text?: string })?.message ||
        (message as unknown as { message?: string; text?: string })?.text ||
        ''

  return (
    <div className="ai-msg-row user">
      <div className="ai-avatar user">👤</div>
      <div className="ai-bubble user">
        {content}
      </div>
    </div>
  )
}

export default UserMessageBubble
