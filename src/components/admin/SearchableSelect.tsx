import React, { useState, useEffect, useRef } from 'react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '🔍 Tìm kiếm hoặc chọn bài học...',
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find currently selected option object
  const selectedOption = options.find((opt) => opt.value === value)

  // Synchronize input text with selected value when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '')
    }
  }, [value, selectedOption, isOpen])

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
        // Reset search term to selected option label if closed without selecting
        if (selectedOption) {
          setSearchTerm(selectedOption.label)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedOption])

  // Filter options by search query
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true
    // If the search term exactly equals the selected label, show all options or filter
    if (selectedOption && searchTerm === selectedOption.label && !isFocused) return true

    const query = searchTerm.toLowerCase()
    const matchLabel = opt.label.toLowerCase().includes(query)
    const matchSublabel = opt.sublabel ? opt.sublabel.toLowerCase().includes(query) : false
    return matchLabel || matchSublabel
  })

  const handleInputFocus = () => {
    if (disabled) return
    setIsFocused(true)
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleSelectOption = (option: SelectOption) => {
    onChange(option.value)
    setSearchTerm(option.label)
    setIsOpen(false)
    setIsFocused(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchTerm('')
    onChange('')
    setIsOpen(true)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
            pointerEvents: 'none',
            bottom: 0,
            left: '50%',
          }}
        />
      )}

      {/* Control Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Left Magnifying Glass Icon */}
        <span
          style={{
            position: 'absolute',
            left: '12px',
            fontSize: '0.95rem',
            color: '#64748b',
            pointerEvents: 'none',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          🔍
        </span>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            paddingLeft: '38px',
            paddingRight: searchTerm ? '52px' : '36px',
            borderColor: isOpen || isFocused ? '#2a63e8' : '#cbd5e1',
            boxShadow: isOpen || isFocused ? '0 0 0 3px rgba(42, 99, 232, 0.15)' : 'none',
            backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {/* Clear Button (Shown when there is a search term) */}
        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            title="Xóa lựa chọn"
            style={{
              position: 'absolute',
              right: '30px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        )}

        {/* Dropdown Toggle Arrow Icon */}
        <span
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
              if (!isOpen && inputRef.current) inputRef.current.focus()
            }
          }}
          style={{
            position: 'absolute',
            right: '12px',
            fontSize: '0.75rem',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </div>

      {/* Options Dropdown Menu */}
      {isOpen && !disabled && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '220px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
            padding: '4px 0',
            margin: 0,
            listStyle: 'none',
          }}
        >
          {filteredOptions.length === 0 ? (
            <li
              style={{
                padding: '12px 14px',
                fontSize: '0.88rem',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              Không tìm thấy bài học nào phù hợp
            </li>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                    color: isSelected ? '#2a63e8' : '#1e293b',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <span style={{ color: '#2a63e8', fontWeight: 700, marginLeft: '8px' }}>✓</span>}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export default SearchableSelect
