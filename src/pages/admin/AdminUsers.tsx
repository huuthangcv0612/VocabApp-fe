import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import type { UserAdminItem } from '../../types/admin'

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      setUsers(Array.isArray(data) ? data : (data as { users?: UserAdminItem[] }).users || [])
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChangeRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Bạn có chắc muốn đổi quyền của user này thành ${newRole.toUpperCase()}?`)) return
    try {
      await adminService.updateUserRole(userId, newRole)
      fetchUsers()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đổi quyền user.')
    }
  }

  const handleToggleStatus = async (userId: string) => {
    if (!window.confirm('Bạn có chắc muốn đổi trạng thái khóa/mở tài khoản này?')) return
    try {
      await adminService.toggleUserStatus(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thay đổi trạng thái user.')
    }
  }

  return (
    <AdminLayout title="Quản Lý Người Dùng & Phân Quyền">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">👥 Danh Sách Người Dùng Hàng Đầu</h3>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách người dùng...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai Trò (Role)</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Thao Tác Quản Lý</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td style={{ color: '#64748b' }}>{u.email}</td>
                    <td>
                      <span className={`badge-pill ${u.role === 'admin' ? 'badge-c2' : 'badge-a1'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pill ${u.status === 'locked' ? 'badge-inactive' : 'badge-active'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-admin-secondary" onClick={() => handleChangeRole(u._id, u.role)}>
                          Đổi Quyền ({u.role === 'admin' ? 'User' : 'Admin'})
                        </button>
                        <button className="btn-admin-danger" onClick={() => handleToggleStatus(u._id)}>
                          {u.status === 'locked' ? 'Mở Khóa' : 'Khóa TK'}
                        </button>
                      </div>
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

export default AdminUsers
