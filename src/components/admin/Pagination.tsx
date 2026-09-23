import React from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('common')
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalItems)

  return (
    <div className="admin-pagination">
      <div className="pagination-info">
        {t('pagination.showing')} <strong>{startItem}</strong> {t('pagination.to')} <strong>{endItem}</strong> {t('pagination.of')} <strong>{totalItems}</strong> {t('pagination.items')}
      </div>

      <div className="pagination-controls">
        <button
          className="btn-admin-secondary pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('pagination.prevPage')}
        </button>

        <span className="pagination-current">
          {t('pagination.page')} <strong>{currentPage}</strong> / {totalPages}
        </span>

        <button
          className="btn-admin-secondary pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('pagination.nextPage')}
        </button>
      </div>
    </div>
  )
}

export default Pagination
