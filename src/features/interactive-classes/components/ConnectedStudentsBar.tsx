import type { SessionConnectedStudent } from '../../../types/interactiveClass'

interface ConnectedStudentsBarProps {
  students: SessionConnectedStudent[]
  showCountOnly?: boolean
}

export const ConnectedStudentsBar = ({
  students,
  showCountOnly = false,
}: ConnectedStudentsBarProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '999px',
          fontSize: '0.85rem',
          color: '#E2E8F0',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            display: 'inline-block',
          }}
        />
        <span>
          <strong>{students.length}</strong> học viên online
        </span>
      </div>

      {!showCountOnly && students.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
          {students.slice(0, 5).map((s, idx) => (
            <div
              key={s.id || idx}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: idx > 0 ? '-6px' : '0',
                border: '2px solid #1E293B',
              }}
              title={s.name}
            >
              {s.name ? s.name.charAt(0).toUpperCase() : 'H'}
            </div>
          ))}
          {students.length > 5 && (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#475569',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-6px',
                border: '2px solid #1E293B',
              }}
            >
              +{students.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
