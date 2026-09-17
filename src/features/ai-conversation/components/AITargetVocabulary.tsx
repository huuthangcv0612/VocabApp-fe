import React, { useState } from 'react'
import type { AITargetVocabulary as TargetVocabType } from '../types/aiConversation'

interface AITargetVocabularyProps {
  vocabularies: TargetVocabType[]
}

export const AITargetVocabulary: React.FC<AITargetVocabularyProps> = ({ vocabularies }) => {
  const [isOpen, setIsOpen] = useState(true)

  if (!vocabularies || vocabularies.length === 0) return null

  return (
    <div className="ai-vocab-card">
      <div className="ai-vocab-header" onClick={() => setIsOpen((prev) => !prev)}>
        <span className="ai-vocab-title">
          📚 Từ vựng gợi ý cho bài học ({vocabularies.length})
        </span>
        <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700 }}>
          {isOpen ? 'Thu gọn ▲' : 'Mở rộng ▼'}
        </span>
      </div>

      {isOpen && (
        <div className="ai-vocab-chips">
          {vocabularies.map((item) => (
            <div key={item._id || item.word} className="ai-vocab-chip">
              <span className="ai-vocab-word">{item.word}</span>
              {item.meaning && <span className="ai-vocab-meaning">: {item.meaning}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AITargetVocabulary
