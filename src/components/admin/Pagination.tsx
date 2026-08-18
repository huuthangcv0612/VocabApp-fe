import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <div className="admin-pagination">
      <div className="pagination-info">
        Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trong tổng số <strong>{totalItems}</strong> mục
      </div>

      <div className="pagination-controls">
        <button
          className="btn-admin-secondary pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ◀ Trang trước
        </button>

        <span className="pagination-current">
          Trang <strong>{currentPage}</strong> / {totalPages}
        </span>

        <button
          className="btn-admin-secondary pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Trang sau ▶
        </button>
      </div>
    </div>
  )
}

export default Pagination
