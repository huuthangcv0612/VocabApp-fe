import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import type { TestSubmissionResultData } from '../../types/test'

export const AdminResults = () => {
  const [results, setResults] = useState<TestSubmissionResultData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllResults()
      setResults(data.results)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải lịch sử làm bài test.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  return (
    <AdminLayout title="Quản Lý Kết Quả Thi Của Học Viên">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">🎓 Lịch Sử Bài Nộp & Kết Quả Chấm Điểm Tự Động</h3>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách bài thi...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Học Viên</th>
                  <th>Bài Test</th>
                  <th>Cấp Độ</th>
                  <th>Điểm Số</th>
                  <th>Tỷ Lệ Đạt</th>
                  <th>Cấp Độ Đánh Giá</th>
                  <th>Kỹ Năng Cần Cải Thiện</th>
                  <th>Thời Gian Nộp</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.userId?.name || 'Học viên'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.userId?.email || 'learner@deutschup.com'}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.testName || 'Quick Test'}</td>
                    <td>
                      <span className={`badge-pill badge-${r.evaluatedLevel.toLowerCase()}`}>{r.evaluatedLevel}</span>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '1rem', color: '#2a63e8' }}>
                      {r.score} / {r.total}
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${r.percentage >= 70 ? 'badge-active' : 'badge-inactive'}`}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {r.percentage}%
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.evaluatedLevel}</td>
                    <td>
                      {r.weaknesses && r.weaknesses.length > 0 ? (
                        r.weaknesses.map((w) => (
                          <span key={w} className="badge-pill badge-b1" style={{ marginRight: '4px', textTransform: 'capitalize' }}>
                            ⚠️ {w}
                          </span>
                        ))
                      ) : (
                        <span className="badge-pill badge-active">Tốt tất cả</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminResults
