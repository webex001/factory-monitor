import type { Station } from '@/types/station'

interface StreamHandlers {
  onOpen: () => void
  onMessage: (stations: Station[]) => void
  onError: () => void
}

/** Opens the live station feed. Returns a cleanup function that closes it. */
export function openStationsStream({ onOpen, onMessage, onError }: StreamHandlers): () => void {
  const source = new EventSource(`/api/stream`)

  source.onopen = onOpen
  source.onerror = onError
  source.onmessage = (event) => {
    try {
      const stations = JSON.parse(event.data) as Station[]
      onMessage(stations)
    } catch {
      onError()
    }
  }

  return () => source.close()
}
