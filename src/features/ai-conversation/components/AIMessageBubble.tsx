import React from 'react'
import type { AIMessage, AIFeedback as AIFeedbackType } from '../types/aiConversation'
import AIFeedback from './AIFeedback'
import { SpeakerButton } from '../../../components/SpeakerButton'

interface AIMessageBubbleProps {
  message: AIMessage
  feedback?: AIFeedbackType | null
  onReplay?: (text: string) => void
  isPlaying?: boolean
  isLoading?: boolean
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({
  message,
  feedback,
  onReplay,
  isPlaying = false,
  isLoading = false,
}) => {
  const content =
    typeof message === 'string'
      ? message
      : message?.content ||
        (message as unknown as { message?: string; text?: string })?.message ||
        (message as unknown as { message?: string; text?: string })?.text ||
        ''

  return (
    <div className="ai-msg-row assistant">
      <div className="ai-avatar assistant">🤖</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ai-bubble-container">
          <div className="ai-bubble assistant">
            {content}
          </div>
          {onReplay && content && (
            <SpeakerButton
              text={content}
              onSpeak={onReplay}
              isPlaying={isPlaying}
              isLoading={isLoading}
              className="ai-bubble-speaker"
              title="Play audio"
            />
          )}

        </div>
        <AIFeedback feedback={feedback} />
      </div>
    </div>
  )
}

export default AIMessageBubble

