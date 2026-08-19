import { Bell } from 'lucide-react'
import { useClock } from '@/hooks/useClock'
import { useStations } from '@/hooks/useStations'

const CONNECTION_LABEL: Record<string, string> = {
  live: 'Live',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
}

const CONNECTION_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  connecting: 'bg-slate-400 animate-pulse',
  reconnecting: 'bg-amber-500 animate-pulse',
}

export function TopBar({ crumbs }: { crumbs: string[] }) {
  const { time, date } = useClock()
  const { connectionStatus } = useStations()

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="text-sm text-slate-500">{crumbs.join(' / ')}</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${CONNECTION_DOT[connectionStatus]}`}
          />
          {/* Only the status word is a live region — the clock ticks every 15s
              and would otherwise get re-announced to screen readers on every tick. */}
          <span role="status" aria-live="polite">
            {CONNECTION_LABEL[connectionStatus]}
          </span>{' '}
          <span>
            · {time} · {date}
          </span>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Bell size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
