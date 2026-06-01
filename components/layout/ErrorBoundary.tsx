'use client'
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message ?? 'Unknown error' }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', err, info)
  }

  reset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="pro-main flex items-center justify-center">
        <div className="pro-card text-center max-w-sm w-full">
          <p className="font-mono font-bold text-[14px] text-[var(--pro-text)] mb-2">
            ⚠ Something went wrong
          </p>
          <p className="font-mono text-[11px] text-[var(--pro-text-muted)] mb-4 break-all">
            {this.state.message}
          </p>
          <button
            type="button"
            className="pro-btn"
            onClick={this.reset}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}
