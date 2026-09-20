import { useState } from 'react'
import type {
  ActivityType,
  ActivityConfig,
  InteractiveActivity,
  FlashcardConfig,
  QuizConfig,
  SpinConfig,
} from '../../../types/interactiveClass'

interface ActivityBuilderProps {
  activities: InteractiveActivity[]
  onChange: (activities: InteractiveActivity[]) => void
  disabled?: boolean
}

export const ActivityBuilder = ({
  activities,
  onChange,
  disabled = false,
}: ActivityBuilderProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Default configs
  const defaultFlashcardConfig: FlashcardConfig = {
    show_translation: true,
    show_example: true,
    shuffle: false,
  }

  const defaultQuizConfig: QuizConfig = {
    question_count: 10,
    time_limit: 15,
    shuffle: true,
  }

  const defaultSpinConfig: SpinConfig = {
    spin_mode: 'word',
    allow_repeat: false,
  }

  const handleAddActivity = (type: ActivityType) => {
    let config: ActivityConfig = defaultFlashcardConfig
    let title = 'Flashcard Ôn Tập'

    if (type === 'quiz') {
      config = defaultQuizConfig
      title = 'Trắc Nghiệm Tương Tác'
    } else if (type === 'spin') {
      config = defaultSpinConfig
      title = 'Vòng Quay May Mắn'
    }

    const newActivity: InteractiveActivity = {
      _id: `temp_${Date.now()}`,
      lesson_id: '',
      type,
      title,
      config,
      order: activities.length + 1,
    }

    const updated = [...activities, newActivity]
    onChange(updated)
    setEditingIndex(updated.length - 1)
  }

  const handleRemoveActivity = (index: number) => {
    const updated = activities.filter((_, idx) => idx !== index)
    onChange(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleUpdateConfig = (
    index: number,
    newConfig: Partial<FlashcardConfig & QuizConfig & SpinConfig>,
    newTitle?: string
  ) => {
    const updated = [...activities]
    const currentConfig = (updated[index].config || {}) as unknown as Record<string, unknown>
    updated[index] = {
      ...updated[index],
      config: { ...currentConfig, ...newConfig } as ActivityConfig,
      title: newTitle !== undefined ? newTitle : updated[index].title,
    }
    onChange(updated)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="ic-btn ic-btn-outline ic-btn-sm"
          onClick={() => handleAddActivity('flashcard')}
          disabled={disabled}
        >
          🗂️ + Thêm Flashcard
        </button>

        <button
          type="button"
          className="ic-btn ic-btn-outline ic-btn-sm"
          onClick={() => handleAddActivity('quiz')}
          disabled={disabled}
        >
          ❓ + Thêm Trắc Nghiệm (Quiz)
        </button>

        <button
          type="button"
          className="ic-btn ic-btn-outline ic-btn-sm"
          onClick={() => handleAddActivity('spin')}
          disabled={disabled}
        >
          🎡 + Thêm Vòng Quay (Spin)
        </button>
      </div>

      {activities.length === 0 ? (
        <div
          style={{
            padding: '24px',
            border: '2px dashed #CBD5E1',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          Chưa có hoạt động nào. Hãy chọn thêm Flashcard, Quiz hoặc Vòng quay từ vựng cho buổi học!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((act, idx) => {
            const isEditing = editingIndex === idx
            const typeLabel =
              act.type === 'flashcard'
                ? 'Flashcard'
                : act.type === 'quiz'
                ? 'Quiz'
                : 'Vòng Quay (Spin)'
            const typeIcon =
              act.type === 'flashcard' ? '🗂️' : act.type === 'quiz' ? '❓' : '🎡'

            return (
              <div
                key={act._id || `act_${idx}`}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: isEditing ? '2px solid #2A63E8' : '1px solid #E2E8F0',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditingIndex(isEditing ? null : idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{typeIcon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                        {act.title || typeLabel}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Hoạt động #{idx + 1} • {typeLabel}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2A63E8',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingIndex(isEditing ? null : idx)
                      }}
                    >
                      {isEditing ? 'Đóng cấu hình ▲' : 'Cấu hình ▼'}
                    </button>

                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '1rem',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveActivity(idx)
                      }}
                      title="Xóa hoạt động"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    <div className="ic-form-group">
                      <label className="ic-label">Tiêu đề hoạt động</label>
                      <input
                        type="text"
                        className="ic-input"
                        value={act.title || ''}
                        onChange={(e) => handleUpdateConfig(idx, {}, e.target.value)}
                        placeholder={`VD: ${typeLabel} A1`}
                      />
                    </div>

                    {/* FLASHCARD CONFIG */}
                    {act.type === 'flashcard' && (
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean((act.config as FlashcardConfig)?.show_translation)}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { show_translation: e.target.checked })
                            }
                          />
                          <span>Hiện dịch nghĩa</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean((act.config as FlashcardConfig)?.show_example)}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { show_example: e.target.checked })
                            }
                          />
                          <span>Hiện câu ví dụ</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={Boolean((act.config as FlashcardConfig)?.shuffle)}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { shuffle: e.target.checked })
                            }
                          />
                          <span>Xáo trộn từ vựng</span>
                        </label>
                      </div>
                    )}

                    {/* QUIZ CONFIG */}
                    {act.type === 'quiz' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div className="ic-form-group">
                          <label className="ic-label">Số lượng câu hỏi</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            className="ic-input"
                            value={(act.config as QuizConfig)?.question_count || 10}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { question_count: Number(e.target.value) })
                            }
                          />
                        </div>

                        <div className="ic-form-group">
                          <label className="ic-label">Thời gian trả lời (giây)</label>
                          <input
                            type="number"
                            min="5"
                            max="120"
                            className="ic-input"
                            value={(act.config as QuizConfig)?.time_limit || 15}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { time_limit: Number(e.target.value) })
                            }
                          />
                        </div>

                        <div className="ic-form-group" style={{ alignSelf: 'center', marginTop: '16px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean((act.config as QuizConfig)?.shuffle)}
                              onChange={(e) =>
                                handleUpdateConfig(idx, { shuffle: e.target.checked })
                              }
                            />
                            <span>Xáo trộn thứ tự câu hỏi</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* SPIN CONFIG */}
                    {act.type === 'spin' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="ic-form-group">
                          <label className="ic-label">Chế độ quay</label>
                          <select
                            className="ic-select"
                            value={(act.config as SpinConfig)?.spin_mode || 'word'}
                            onChange={(e) =>
                              handleUpdateConfig(idx, { spin_mode: e.target.value })
                            }
                          >
                            <option value="word">Quay từ vựng ngẫu nhiên</option>
                            <option value="student">Quay học viên ngẫu nhiên</option>
                          </select>
                        </div>

                        <div className="ic-form-group" style={{ alignSelf: 'center', marginTop: '16px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean((act.config as SpinConfig)?.allow_repeat)}
                              onChange={(e) =>
                                handleUpdateConfig(idx, { allow_repeat: e.target.checked })
                              }
                            />
                            <span>Cho phép quay lặp lại</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
