import { ButtonConfirmed } from 'components/Button'
import React, { Component, ReactNode } from 'react'
import { useNavigate, useLocation, NavigateFunction, Location } from 'react-router-dom'
import StaticScreen from './StaticScreen'
import { isChunkLoadError, tryReload } from 'utils/chunkReload'

interface Props {
  children: ReactNode
  navigate: NavigateFunction
  location: Location
}

interface State {
  hasError: boolean
  error: string
  countdown?: number | null
  // True when the caught error is a stale-build chunk-load failure (deploy churn) —
  // we reload immediately to pick up the new build instead of showing the error UI.
  isChunkError?: boolean
}

class ErrorBoundaryBase extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: '',
    countdown: null,
  }

  private countdownInterval?: number

  static getDerivedStateFromError(error: Error): State {
    console.error(error)
    return {
      hasError: true,
      isChunkError: isChunkLoadError(error?.message ?? ''),
      error: JSON.stringify(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        null,
        2,
      ),
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, info)
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      // Stale-build chunk error (new deploy replaced the old hashed chunk): reload
      // immediately to pick up the new build. tryReload reloads at most once per
      // session; if it's already tried (persistent failure), fall through to the
      // normal error UI below.
      if (this.state.isChunkError && tryReload()) {
        return
      }
      if (this.props.location.pathname.includes('/add') || this.props.location.pathname.includes('/remove')) {
        // Keep original behavior for add/remove: reload immediately
        this.props.navigate('/pool', { replace: true })
        window.location.reload()
      } else {
        // Start a 10s countdown before auto-reload
        if (!this.countdownInterval) {
          this.setState({ countdown: 10 })
          this.countdownInterval = window.setInterval(() => {
            this.setState((prev) => {
              const next = (prev.countdown ?? 0) - 1
              if (next <= 0) {
                if (this.countdownInterval) window.clearInterval(this.countdownInterval)
                this.countdownInterval = undefined
                window.location.reload()
                return { countdown: 0 }
              }
              return { countdown: next }
            })
          }, 1000)
        }
      }
    }
  }

  componentWillUnmount(): void {
    if (this.countdownInterval) {
      window.clearInterval(this.countdownInterval)
      this.countdownInterval = undefined
    }
  }

  private handleRetry = () => {
    if (this.countdownInterval) {
      window.clearInterval(this.countdownInterval)
      this.countdownInterval = undefined
    }
    this.setState({ hasError: false, error: '', countdown: null })
  }

  render() {
    if (this.state.hasError && this.state.isChunkError) {
      // Stale build after a deploy — a reload is underway (or a countdown to one).
      // Show a calm message instead of the raw error dump.
      return (
        <StaticScreen>
          <div className="w-[1600px] max-w-[100vw] bg-[#12100b] text-white z-10 mx-auto px-6 py-10">
            <div className="max-w-[480px] flex flex-col gap-2 items-center mx-auto text-center">
              <div>A new version was just deployed.</div>
              <div>Reloading to the latest version…</div>
              <ButtonConfirmed
                className="!w-[140px] !p-2"
                onClick={() => window.location.reload()}
              >
                RELOAD
              </ButtonConfirmed>
            </div>
          </div>
        </StaticScreen>
      )
    }
    if (this.state.hasError) {
      return (
        <StaticScreen>
          <div className="w-[1600px] max-w-[100vw] bg-[#12100b] text-white z-10 mx-auto px-6 py-10">
            <div className="max-w-[480px] flex flex-col gap-2 items-center mx-auto text-center">
              <div>
                <div>An unexpected error occurred</div>
                <div>Please try again or reload the page.</div>
              </div>
              <div className="flex gap-2">
                <ButtonConfirmed className="!w-[140px] !p-2" onClick={this.handleRetry}>
                  TRY AGAIN
                </ButtonConfirmed>
                <ButtonConfirmed
                  className="!w-[140px] !p-2"
                  onClick={() => {
                    this.props.navigate('/', { replace: true })
                    window.location.reload()
                  }}
                >
                  {this.state.countdown && this.state.countdown > 0 ? `RELOAD (${this.state.countdown})` : 'RELOAD'}
                </ButtonConfirmed>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm md:text-base">{this.state.error}</pre>
          </div>
        </StaticScreen>
      )
    }

    return this.props.children
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <ErrorBoundaryBase navigate={navigate} location={location}>
      {children}
    </ErrorBoundaryBase>
  )
}
