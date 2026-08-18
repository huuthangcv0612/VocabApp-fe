import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/pages/admin.css'
import DeutschUpLogo from '../../assets/DEUTSCHUP.svg'

interface AdminLayoutProps {
  title: string
  breadcrumbs?: { label: string; path?: string }[]
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, breadcrumbs, children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev)
  }

  // Navigation Groups
  const cmsNavItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/levels', label: 'Levels', icon: '📶' },
    { to: '/admin/topics', label: 'Topics', icon: '🏷️' },
    { to: '/admin/units', label: 'Units', icon: '📦' },
    { to: '/admin/lessons', label: 'Lessons', icon: '📖' },
    { to: '/admin/vocabularies', label: 'Vocabulary', icon: '📚' },
    { to: '/admin/exercises', label: 'Exercises', icon: '✍️' },
  ]

  const systemNavItems = [
    { to: '/admin/questions', label: 'Question Bank', icon: '❓' },
    { to: '/admin/tests', label: 'Tests Config', icon: '📝' },
    { to: '/admin/users', label: 'User Management', icon: '👥' },
    { to: '/admin/results', label: 'Test Results', icon: '🎓' },
  ]

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src={DeutschUpLogo} alt="VocabApp" className="admin-brand-logo-img" />
          <span className="admin-brand-badge">CMS ADMIN</span>
        </div>

        <div className="admin-nav-scroll">
          <div className="admin-nav-section-title">QUẢN LÝ NỘI DUNG</div>
          <nav className="admin-nav">
            {cmsNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-nav-section-title" style={{ marginTop: '20px' }}>
            HỆ THỐNG & ĐỀ THI
          </div>
          <nav className="admin-nav">
            {systemNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-exit-link">
            <span>🏠</span>
            <span>Về Trang Học Viên</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              className="admin-sidebar-toggle-btn"
              onClick={toggleMobileSidebar}
              title="Toggle Menu"
            >
              ☰
            </button>
            <div className="admin-header-title-group">
              <nav className="admin-breadcrumbs">
                <NavLink to="/admin" className="breadcrumb-item">Admin</NavLink>
                <span className="breadcrumb-separator">/</span>
                {breadcrumbs ? (
                  breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      {crumb.path ? (
                        <NavLink to={crumb.path} className="breadcrumb-item">{crumb.label}</NavLink>
                      ) : (
                        <span className="breadcrumb-item active">{crumb.label}</span>
                      )}
                      {idx < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
                    </React.Fragment>
                  ))
                ) : (
                  <span className="breadcrumb-item active">{title}</span>
                )}
              </nav>
              <h1 className="admin-header-title">{title}</h1>
            </div>
          </div>

          <div className="admin-header-user">
            <div className="admin-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || 'Admin User'}</span>
              <span className="admin-user-role">{user?.role || 'admin'}</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn" title="Đăng xuất khỏi CMS">
              🚪 Đăng Xuất
            </button>
          </div>
        </header>

        <main className="admin-body">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
