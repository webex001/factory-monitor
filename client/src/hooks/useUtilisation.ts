import { useCallback, useEffect, useReducer } from 'react'
import { fetchUtilisation } from '@/api/stations'
import { fetchStateReducer } from '@/lib/fetchStateReducer'
import { describeApiError } from '@/lib/apiError'
import type { UtilisationResponse } from '@/types/station'

/** On-demand REST fetch — does not subscribe to SSE. Re-fetches when hours changes. */
export function useUtilisation(hours: number) {
  const [state, dispatch] = useReducer(fetchStateReducer<UtilisationResponse>, {
    status: 'loading',
  })

  const load = useCallback(() => {
    dispatch({ type: 'loading' })
    fetchUtilisation(hours)
      .then((data) => dispatch({ type: 'success', data }))
      .catch((err: unknown) =>
        dispatch({
          type: 'error',
          message: describeApiError(err, "Couldn't load utilisation data. Please try again."),
        }),
      )
  }, [hours])

  useEffect(() => {
    load()
  }, [load])

  return { state, retry: load }
}
