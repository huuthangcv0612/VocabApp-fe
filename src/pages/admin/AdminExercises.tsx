import React, { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { toast } from 'react-hot-toast'

interface ExerciseItem {
  id: string
  title: string
  exerciseType: 'multiple_choice' | 'fill_in_blank' | 'matching' | 'audio_listen'
  lessonTitle: string
  levelCode: string
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'active' | 'draft'
}

const INITIAL_EXERCISES: ExerciseItem[] = [
  { id: 'ex1', title: 'Luyện tập Chào Hỏi A1', exerciseType: 'multiple_choice', lessonTitle: 'Bài 1: Lời chào trong ngày', levelCode: 'A1', questionCount: 10, difficulty: 'easy', status: 'active' },
  { id: 'ex2', title: 'Điền từ: Giới thiệu bản thân', exerciseType: 'fill_in_blank', lessonTitle: 'Bài 2: Xưng hô trang trọng', levelCode: 'A1', questionCount: 8, difficulty: 'easy', status: 'active' },
  { id: 'ex3', title: 'Nối từ vựng mua sắm', exerciseType: 'matching', lessonTitle: 'Bài 1: Mua sắm hoa quả', levelCode: 'A2', questionCount: 12, difficulty: 'medium', status: 'active' },
  { id: 'ex4', title: 'Luyện nghe phản xạ hội thoại', exerciseType: 'audio_listen', lessonTitle: 'Bài 3: Hỏi đường nhà ga', levelCode: 'A2', questionCount: 6, difficulty: 'hard', status: 'draft' },
]

export const AdminExercises: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseItem[]>(INITIAL_EXERCISES)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<ExerciseItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.lessonTitle.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = levelFilter === 'all' || ex.levelCode === levelFilter
    const matchesType = typeFilter === 'all' || ex.exerciseType === typeFilter
    return matchesSearch && matchesLevel && matchesType
  })

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setIsDeleting(true)

    setTimeout(() => {
      setExercises((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setIsDeleting(false)
      setDeleteTarget(null)
      toast.success(`Đã xóa bài tập "${deleteTarget.title}"!`)
    }, 400)
  }

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '🔠 Multiple Choice'
      case 'listening':
        return '🎧 Listening'
      case 'translation':
        return '🌐 Translation'
      case 'fill_blank':
      case 'fill_in_blank':
        return '✏️ Fill Blank'
      case 'sentence_arrangement':
        return '🧩 Sentence Arrangement'
      default:
        return type
    }
  }

  return (
    <AdminLayout title="Quản Lý Bài Tập (Exercises)" breadcrumbs={[{ label: 'Exercises' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Bài Tập Thực Hành</h2>
          <p className="admin-page-subtitle">Quản lý bộ 5 bài tập: Trắc nghiệm, Luyện nghe, Dịch câu, Điền từ, Sắp xếp câu</p>
        </div>
        <button
          className="btn-admin-primary"
          onClick={() => toast.success('Mở bài học ở danh sách Lessons để dùng Exercise Builder!')}
        >
          ➕ Tạo Bài Tập Trong Lesson
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm tiêu đề bài tập hoặc bài học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="all">Tất cả Trình độ</option>
          <option value="A1">Level A1</option>
          <option value="A2">Level A2</option>
          <option value="B1">Level B1</option>
        </select>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả 5 Loại bài tập</option>
          <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
          <option value="listening">Listening (Luyện nghe)</option>
          <option value="translation">Translation (Dịch câu)</option>
          <option value="fill_blank">Fill Blank (Điền từ)</option>
          <option value="sentence_arrangement">Sentence Arrangement (Sắp xếp câu)</option>
        </select>
      </div>

      {loading ? (
        <AdminLoadingState message="Đang tải danh sách bài tập..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => setError(null)} />
      ) : filteredExercises.length === 0 ? (
        <AdminEmptyState
          icon="✍️"
          title="Không tìm thấy bài tập nào"
          description="Thử thay đổi từ khóa hoặc bộ lọc."
          actionLabel="Đặt lại tìm kiếm"
          onAction={() => {
            setSearch('')
            setLevelFilter('all')
            setTypeFilter('all')
          }}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên Bài Tập</th>
                  <th>Loại Bài Tập</th>
                  <th>Bài Học (Lesson)</th>
                  <th>Trình Độ</th>
                  <th>Số Câu Hỏi</th>
                  <th>Độ Khó</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((ex) => (
                  <tr key={ex.id}>
                    <td style={{ fontWeight: 700 }}>{ex.title}</td>
                    <td>
                      <span className="badge-pill badge-a1">{renderTypeLabel(ex.exerciseType)}</span>
                    </td>
                    <td style={{ color: '#475569' }}>{ex.lessonTitle}</td>
                    <td>
                      <span className={`badge-pill badge-${ex.levelCode.toLowerCase()}`}>
                        {ex.levelCode}
                      </span>
                    </td>
                    <td><strong>{ex.questionCount}</strong> câu</td>
                    <td>
                      <span className={`badge-pill badge-${ex.difficulty}`}>
                        {ex.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-pill ${ex.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn-admin-secondary"
                          onClick={() => toast.success(`Sửa bài tập ${ex.title}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-admin-danger"
                          onClick={() => setDeleteTarget(ex)}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Bài tập"
        message="Bạn có chắc chắn muốn xóa bài tập này?"
        itemName={deleteTarget ? deleteTarget.title : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminExercises
