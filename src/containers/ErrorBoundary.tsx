import React, { Component, ReactNode } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import StaticScreen from './StaticScreen'

interface Props extends RouteComponentProps {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundaryBase extends Component<Props, State> {
  state: State = {
    hasError: false
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, info)
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      if (this.props.location.pathname.includes('/add')) {
        this.props.history.replace('/pool')
        location.reload()
      } else {
        this.props.history.replace('/')
        location.reload()
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return <StaticScreen />
    }

    return this.props.children
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryBase)
