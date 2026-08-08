import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import type { LevelType, StatusType, TestConfigPayload, TestItem } from '../../types/admin'

export const AdminTests = () => {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<TestConfigPayload>({
    name: 'Quick Test A1',
    level: 'A1',
    totalQuestions: 30,
    config: {
      vocabulary: 10,
      grammar: 10,
      reading: 10,
      listening: 0,
    },
    difficultyRatio: {
      easy: 40,
      medium: 40,
      hard: 20,
    },
    timeLimit: 30,
    passingScore: 70,
    status: 'active',
  })

  const fetchTests = async () => {
    try {
      setLoading(true)
      const data = await adminService.getTests()
      setTests(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đề test.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminService.createTest(formData)
      setIsModalOpen(false)
      fetchTests()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo đề test.')
    }
  }

  return (
    <AdminLayout title="Quản Lý Đề Test & Cấu Hình Bài Thi">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">📝 Cấu Hình Các Bài Test Hiện Có</h3>
          <button className="btn-admin-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Tạo Cấu Hình Test Mới
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách bài test...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên Bài Test</th>
                  <th>Cấp Độ</th>
                  <th>Tổng Số Câu</th>
                  <th>Phân Phối Kỹ Năng</th>
                  <th>Thời Gian</th>
                  <th>Điểm Đạt</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 700 }}>{t.name}</td>
                    <td>
                      <span className={`badge-pill badge-${t.level.toLowerCase()}`}>{t.level}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.totalQuestions} câu</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Vocab: {t.config.vocabulary} | Grammar: {t.config.grammar} | Reading: {t.config.reading} | Listening: {t.config.listening}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.timeLimit} phút</td>
                    <td style={{ color: '#16a34a', fontWeight: 700 }}>{t.passingScore}%</td>
                    <td>
                      <span className={`badge-pill badge-${t.status}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Test Configuration Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Tạo Cấu Hình Bài Test Mới</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTest}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tên Bài Test</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cấp Độ (Level)</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as LevelType })}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tổng Số Câu Hỏi</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thời Gian Làm Bài (Phút)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Điểm Đạt (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Skill Distribution Config */}
              <div className="form-group">
                <label className="form-label">Phân Phối Số Câu Theo Kỹ Năng (Skill Config)</label>
                <div className="form-row">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Vocabulary</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.config.vocabulary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, vocabulary: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Grammar</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.config.grammar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, grammar: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Reading</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.config.reading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, reading: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Listening</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.config.listening}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, listening: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty Ratio Config */}
              <div className="form-group">
                <label className="form-label">Tỷ Lệ Độ Khó (Difficulty Ratio %)</label>
                <div className="form-row">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Easy %</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.difficultyRatio.easy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficultyRatio: { ...formData.difficultyRatio, easy: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Medium %</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.difficultyRatio.medium}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficultyRatio: { ...formData.difficultyRatio, medium: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hard %</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.difficultyRatio.hard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficultyRatio: { ...formData.difficultyRatio, hard: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Trạng Thái</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-admin-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary">
                  Lưu Cấu Hình Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminTests
