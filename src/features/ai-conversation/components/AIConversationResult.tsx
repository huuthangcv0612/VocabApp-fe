import React from 'react'

interface AIConversationResultProps {
  resultData?: Record<string, unknown> | null
  turnCount?: number
  onRestart: () => void
  onExit: () => void
}

export const AIConversationResult: React.FC<AIConversationResultProps> = ({
  resultData,
  turnCount,
  onRestart,
  onExit,
}) => {
  // Extract optional summary fields safely from backend response
  const rawObj = resultData || {}
  const score = typeof rawObj.score === 'number' ? rawObj.score : undefined
  const totalTurns = typeof rawObj.turn_count === 'number'
    ? rawObj.turn_count
    : typeof rawObj.total_turns === 'number'
    ? rawObj.total_turns
    : turnCount

  const usedVocab = Array.isArray(rawObj.used_vocabulary) ? rawObj.used_vocabulary : undefined
  const mistakes = Array.isArray(rawObj.mistakes) ? rawObj.mistakes : undefined
  const feedbackSummary = typeof rawObj.feedback_summary === 'string' ? rawObj.feedback_summary : undefined

  return (
    <div className="ai-result-card">
      <div className="ai-result-badge">🎉</div>
      <h2 className="ai-result-title">Hoàn thành hội thoại!</h2>
      <p className="ai-result-desc">
        {feedbackSummary || 'Bạn đã hoàn thành xuất sắc lượt luyện tập hội thoại tiếng Đức với AI!'}
      </p>

      <div className="ai-result-stats">
        {totalTurns !== undefined && (
          <div className="ai-stat-box">
            <div className="stat-val">{totalTurns}</div>
            <div className="stat-lbl">Lượt hội thoại</div>
          </div>
        )}

        {score !== undefined && (
          <div className="ai-stat-box">
            <div className="stat-val">{score}</div>
            <div className="stat-lbl">Điểm số</div>
          </div>
        )}

        {usedVocab !== undefined && (
          <div className="ai-stat-box">
            <div className="stat-val">{usedVocab.length}</div>
            <div className="stat-lbl">Từ vựng đã dùng</div>
          </div>
        )}

        {mistakes !== undefined && (
          <div className="ai-stat-box">
            <div className="stat-val">{mistakes.length}</div>
            <div className="stat-lbl">Lỗi ngữ pháp</div>
          </div>
        )}
      </div>

      <div className="ai-result-actions">
        <button
          onClick={onRestart}
          className="btn-admin-primary"
          style={{ padding: '12px 24px', borderRadius: '9999px', fontSize: '1rem' }}
        >
          🔄 Luyện tập lại
        </button>

        <button
          onClick={onExit}
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', borderRadius: '9999px', fontSize: '1rem' }}
        >
          🏠 Về Lộ Trình Học
        </button>
      </div>
    </div>
  )
}

export default AIConversationResult
