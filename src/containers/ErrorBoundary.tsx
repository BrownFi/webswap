import React, { Component, ReactNode } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import StaticScreen from './StaticScreen'

interface Props extends RouteComponentProps {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: string
}

class ErrorBoundaryBase extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: '',
  }

  static getDerivedStateFromError(error: Error): State {
    console.error(error)
    return {
      hasError: true,
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
      if (this.props.location.pathname.includes('/add') || this.props.location.pathname.includes('/remove')) {
        if (!location.host.startsWith('localhost')) {
          this.props.history.replace('/pool')
          location.reload()
        }
      } else {
        if (!location.host.startsWith('localhost')) {
          // this.props.history.replace('/')
          // location.reload()
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <StaticScreen>
          <div className="max-w-[1600px] bg-[##131216] z-10 mx-auto px-6 py-10">
            <pre className="text-white whitespace-pre-wrap">{this.state.error}</pre>
          </div>
        </StaticScreen>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryBase)
