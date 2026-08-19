import { create } from 'zustand'
import { fetchStations } from '@/api/stations'
import { openStationsStream } from '@/api/stream'
import { describeApiError } from '@/lib/apiError'
import type { Station } from '@/types/station'
import type { FetchState } from '@/types/fetchState'

const STATIONS_LOAD_ERROR = "Couldn't load stations. Please try again."

// The mock server pushes a message roughly every 3s (see mock-server's
// TICK_MS). If nothing arrives for well over twice that, treat the
// connection as dead and force a reconnect — needed because a stalled
// connection doesn't always surface as an EventSource `error`. In dev,
// Vite's proxy is one concrete case: killing the mock server mid-stream
// leaves the browser-facing response hanging open (no data, no close), so
// EventSource never fires onerror on its own. A heartbeat catches that
// (and any other silent-hang failure mode) without depending on the
// transport reporting failure correctly.
const STALE_AFTER_MS = 8_000
const HEARTBEAT_INTERVAL_MS = 2_000

export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting'

interface StationsStore {
  state: FetchState<Station[]>
  connectionStatus: ConnectionStatus
  connect: () => void
  retry: () => void
}

// Module-level so the SSE connection is opened exactly once no matter how
// many components call useStations() — the store, not the hook, owns the
// connection lifecycle.
let initialized = false
let closeStream: (() => void) | null = null
let lastMessageAt = 0
let heartbeatId: ReturnType<typeof setInterval> | null = null

export const useStationsStore = create<StationsStore>()((set, get) => {
  function openStream() {
    closeStream?.()
    lastMessageAt = Date.now()
    closeStream = openStationsStream({
      onOpen: () => {
        lastMessageAt = Date.now()
        set({ connectionStatus: 'live' })
      },
      onMessage: (stations) => {
        lastMessageAt = Date.now()
        set({ state: { status: 'success', data: stations }, connectionStatus: 'live' })
      },
      onError: () =>
        set((s) => ({
          connectionStatus: s.state.status === 'success' ? 'reconnecting' : 'connecting',
        })),
    })
  }

  function startHeartbeat() {
    if (heartbeatId) return
    heartbeatId = setInterval(() => {
      if (Date.now() - lastMessageAt <= STALE_AFTER_MS) return
      set((s) => ({
        connectionStatus: s.state.status === 'success' ? 'reconnecting' : 'connecting',
      }))
      openStream() // force a fresh connection attempt instead of waiting on a stalled one
    }, HEARTBEAT_INTERVAL_MS)
  }

  return {
    state: { status: 'loading' },
    connectionStatus: 'connecting',

    connect: () => {
      if (initialized) return
      initialized = true

      fetchStations()
        .then((stations) => set({ state: { status: 'success', data: stations } }))
        .catch((err: unknown) => {
          // Don't clobber data the SSE stream may have already delivered.
          if (get().state.status === 'success') return
          set({
            state: { status: 'error', message: describeApiError(err, STATIONS_LOAD_ERROR) },
          })
        })

      openStream()
      startHeartbeat()
    },

    retry: () => {
      set({ state: { status: 'loading' } })
      fetchStations()
        .then((stations) => set({ state: { status: 'success', data: stations } }))
        .catch((err: unknown) =>
          set({
            state: { status: 'error', message: describeApiError(err, STATIONS_LOAD_ERROR) },
          }),
        )
    },
  }
})

// Test-only escape hatch: reset the module-level singleton between tests.
export function __resetStationsStreamForTests(): void {
  closeStream?.()
  closeStream = null
  if (heartbeatId) clearInterval(heartbeatId)
  heartbeatId = null
  initialized = false
  lastMessageAt = 0
}
