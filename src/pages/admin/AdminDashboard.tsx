import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import type { AdminStatistics } from '../../types/admin'

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminService.getStatistics()
        setStats(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải thống kê Admin.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout title="Dashboard Tổng Quan">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải dữ liệu thống kê hệ thống...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard Tổng Quan">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Tong So Cau Hoi</h4>
            <div className="stat-number">{stats?.totalQuestions ?? 0}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            ❓
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Tong De Test</h4>
            <div className="stat-number">{stats?.totalTests ?? 0}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            📝
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Tong Nguoi Dung</h4>
            <div className="stat-number">{stats?.totalUsers ?? 0}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            👥
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Luot Lam Bai Test</h4>
            <div className="stat-number">{stats?.totalResults ?? 0}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fae8ff', color: '#c026d3' }}>
            🎓
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Tong Tu Vung</h4>
            <div className="stat-number">{stats?.totalVocabularies ?? 0}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
            📚
          </div>
        </div>
      </div>

      {/* Level Breakdown & Recent Users */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Question Level Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">📌 Phân Số Câu Hỏi Theo Cấp Độ (CEFR)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats?.questionsByLevel &&
              Object.entries(stats.questionsByLevel).map(([level, count]) => {
                const maxCount = Math.max(...Object.values(stats.questionsByLevel), 1)
                const percentage = Math.round((count / maxCount) * 100)
                return (
                  <div key={level} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                      <span className={`badge-pill badge-${level.toLowerCase()}`}>{level}</span>
                      <span>{count} câu hỏi</span>
                    </div>
                    <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: level.startsWith('A') ? '#2a63e8' : level.startsWith('B') ? '#d90000' : '#86198f',
                          borderRadius: '999px',
                          transition: 'width 0.5s ease',
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Recent Registered Users */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">👤 Người Dùng Mới Đăng Ký</h3>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Quyền</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: '#64748b' }}>{u.email}</td>
                      <td>
                        <span className={`badge-pill ${u.role === 'admin' ? 'badge-c2' : 'badge-a1'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>
                      Chưa có người dùng mới.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
