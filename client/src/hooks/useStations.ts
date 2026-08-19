import { useEffect } from 'react'
import { useStationsStore } from '@/store/stationsStore'

/**
 * Reads the shared live station list. Safe to call from multiple
 * components/screens — the underlying SSE connection is opened once at the
 * store level, not per-hook-call.
 */
export function useStations() {
  const state = useStationsStore((s) => s.state)
  const connectionStatus = useStationsStore((s) => s.connectionStatus)
  const connect = useStationsStore((s) => s.connect)
  const retry = useStationsStore((s) => s.retry)

  useEffect(() => {
    connect()
  }, [connect])

  return { state, connectionStatus, retry }
}
