import type { FetchState } from '@/types/fetchState'

export type FetchAction<T> =
  { type: 'loading' } | { type: 'success'; data: T } | { type: 'error'; message: string }

export function fetchStateReducer<T>(_state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case 'loading':
      return { status: 'loading' }
    case 'success':
      return { status: 'success', data: action.data }
    case 'error':
      return { status: 'error', message: action.message }
  }
}
