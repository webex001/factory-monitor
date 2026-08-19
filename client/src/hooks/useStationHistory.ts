import { useCallback, useEffect, useReducer } from 'react'
import { fetchStationHistory } from '@/api/stations'
import { fetchStateReducer } from '@/lib/fetchStateReducer'
import { describeApiError } from '@/lib/apiError'
import type { StationHistoryResponse } from '@/types/station'

/** On-demand REST fetch — does not subscribe to SSE. Re-fetches when stationId or hours changes. */
export function useStationHistory(stationId: string | null, hours: number) {
  const [state, dispatch] = useReducer(fetchStateReducer<StationHistoryResponse>, {
    status: 'loading',
  })

  const load = useCallback(() => {
    if (!stationId) return
    dispatch({ type: 'loading' })
    fetchStationHistory(stationId, hours)
      .then((data) => dispatch({ type: 'success', data }))
      .catch((err: unknown) =>
        dispatch({
          type: 'error',
          message: describeApiError(err, "Couldn't load station history. Please try again."),
        }),
      )
  }, [stationId, hours])

  useEffect(() => {
    load()
  }, [load])

  return { state, retry: load }
}
