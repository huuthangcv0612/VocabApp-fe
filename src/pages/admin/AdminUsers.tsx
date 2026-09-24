import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import { adminService } from '../../services/adminService'
import type { UserAdminItem } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getUsers()
      setUsers(Array.isArray(data) ? data : (data as { users?: UserAdminItem[] }).users || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleChangeRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Bạn có chắc muốn đổi quyền của người dùng này thành ${newRole.toUpperCase()}?`)) return
    try {
      await adminService.updateUserRole(userId, newRole)
      toast.success(`Đã đổi quyền thành công sang ${newRole.toUpperCase()}!`)
      fetchUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đổi quyền user.'
      toast.error(msg)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus?: string) => {
    const isLocked = currentStatus === 'locked'
    const confirmMsg = isLocked ? 'Mở khóa tài khoản người dùng này?' : 'Khóa tài khoản người dùng này?'
    if (!window.confirm(confirmMsg)) return
    try {
      await adminService.toggleUserStatus(userId, currentStatus)
      toast.success(isLocked ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!')
      fetchUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thay đổi trạng thái user.'
      toast.error(msg)
    }
  }

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.name || '').toLowerCase().includes(search.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesSearch = nameMatch || emailMatch
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <AdminLayout title="Quản Lý Người Dùng & Phân Quyền" breadcrumbs={[{ label: 'Users' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản Lý Người Dùng & Phân Quyền</h2>
          <p className="admin-page-subtitle">Xem danh sách tài khoản, phân quyền quản trị viên và quản lý trạng thái hoạt động</p>
        </div>
        <button className="btn-admin-secondary" onClick={fetchUsers} disabled={loading}>
          🔄 Làm Mới Dữ Liệu
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm theo tên hoặc email người dùng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
        >
          <option value="all">Tất cả Vai trò</option>
          <option value="user">User (Học viên)</option>
          <option value="admin">Admin (Quản trị)</option>
        </select>
      </div>

      {loading ? (
        <AdminLoadingState message="Đang tải danh sách người dùng..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length === 0 ? (
        <AdminEmptyState
          icon="👥"
          title="Không tìm thấy người dùng nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc, hoặc bấm 'Làm Mới Dữ Liệu'."
          actionLabel="Làm Mới Dữ Liệu"
          onAction={fetchUsers}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">👥 Danh Sách Người Dùng ({filteredUsers.length})</h3>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai Trò (Role)</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Đăng Ký</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác Quản Lý</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const role = (u.role || 'user').toLowerCase()
                  const isLocked = u.status === 'locked'
                  const createdDate = u.createdAt
                  return (
                    <tr key={u._id || `user-${idx}`}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td style={{ color: '#64748b' }}>{u.email}</td>
                      <td>
                        <span className={`badge-pill ${role === 'admin' ? 'badge-c2' : 'badge-a1'}`}>
                          {role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${isLocked ? 'badge-inactive' : 'badge-active'}`}>
                          {isLocked ? '🔒 Đã Khóa' : '✅ Hoạt Động'}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {createdDate ? new Date(createdDate).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn-admin-secondary"
                            onClick={() => handleChangeRole(u._id, u.role)}
                          >
                            Đổi Quyền ({role === 'admin' ? 'User' : 'Admin'})
                          </button>
                          <button
                            className={isLocked ? 'btn-admin-primary' : 'btn-admin-danger'}
                            onClick={() => handleToggleStatus(u._id, u.status)}
                          >
                            {isLocked ? '🔓 Mở Khóa' : '🔒 Khóa TK'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
