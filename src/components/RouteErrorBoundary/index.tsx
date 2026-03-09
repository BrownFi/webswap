import React, { Component, ReactNode } from 'react'
import { ButtonConfirmed } from 'components/Button'

interface Props {
  children: ReactNode
  fallbackPath?: string
}

interface State {
  hasError: boolean
  error: string
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: '' }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error.message,
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Route error:', error, info)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 py-20 text-white text-center">
          <div className="text-lg">Something went wrong on this page</div>
          <div className="text-sm opacity-70">{this.state.error}</div>
          <div className="flex gap-2">
            <ButtonConfirmed className="!w-[140px] !p-2" onClick={this.handleRetry}>
              TRY AGAIN
            </ButtonConfirmed>
            <ButtonConfirmed
              className="!w-[140px] !p-2"
              onClick={() => {
                window.location.href = this.props.fallbackPath || '/swap'
              }}
            >
              GO TO SWAP
            </ButtonConfirmed>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
