import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Varela Round', sans-serif",
          color: '#11224E',
          background: '#fff8f0'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Đã xảy ra lỗi giao diện ⚠️</h1>
          <p style={{ color: '#64748b', maxWidth: '500px', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'Có lỗi phát sinh trong khi tải trang.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              background: '#2A63E8',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Tải lại trang ↺
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
