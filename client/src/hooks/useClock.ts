import { useEffect, useState } from 'react'

/** Live-updating clock for the top bar's "Live · HH:MM · Day D Mon" chip. */
export function useClock(intervalMs = 15_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return { time, date }
}
