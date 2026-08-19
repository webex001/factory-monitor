import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A real production app would send this to error tracking — out of scope here.
    console.error('Page crashed:', error, info)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-sm font-medium text-slate-700">Something went wrong on this page.</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
