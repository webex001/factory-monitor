import { describe, expect, it } from 'vitest'
import { fetchStateReducer } from './fetchStateReducer'
import type { FetchState } from '@/types/fetchState'

describe('fetchStateReducer', () => {
  it('transitions loading -> success', () => {
    const state: FetchState<number> = { status: 'loading' }
    const next = fetchStateReducer(state, { type: 'success', data: 42 })
    expect(next).toEqual({ status: 'success', data: 42 })
  })

  it('transitions loading -> error', () => {
    const state: FetchState<number> = { status: 'loading' }
    const next = fetchStateReducer(state, { type: 'error', message: 'boom' })
    expect(next).toEqual({ status: 'error', message: 'boom' })
  })

  it('transitions error -> loading on retry', () => {
    const state: FetchState<number> = { status: 'error', message: 'boom' }
    const next = fetchStateReducer(state, { type: 'loading' })
    expect(next).toEqual({ status: 'loading' })
  })

  it('transitions success -> loading when a refetch starts', () => {
    const state: FetchState<number> = { status: 'success', data: 1 }
    const next = fetchStateReducer(state, { type: 'loading' })
    expect(next).toEqual({ status: 'loading' })
  })
})
