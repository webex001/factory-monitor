import { useStationHistory } from '@/hooks/useStationHistory'
import { STATUS_TOKENS } from '@/theme/tokens'
import { CARD_CLASS } from '@/theme/card'
import type { Station } from '@/types/station'

const TIMELINE_HOURS = 24

export function StatusTimeline({
  stations,
  onSelect,
}: {
  stations: Station[]
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Status timeline · last {TIMELINE_HOURS} hours
          </h2>
        </div>
        <span className="text-xs text-slate-400">Click a station to inspect</span>
      </div>
      <div className={`divide-y divide-slate-100 ${CARD_CLASS}`}>
        {stations.map((station) => (
          <StatusTimelineRow key={station.id} station={station} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function StatusTimelineRow({
  station,
  onSelect,
}: {
  station: Station
  onSelect: (id: string) => void
}) {
  const { state } = useStationHistory(station.id, TIMELINE_HOURS)
  const windowMs = TIMELINE_HOURS * 60 * 60 * 1000
  const windowStart = Date.now() - windowMs

  return (
    <button
      type="button"
      onClick={() => onSelect(station.id)}
      className="flex w-full items-center gap-4 px-4 py-2.5 text-left hover:bg-slate-50"
    >
      <div className="w-36 shrink-0">
        <div className="text-sm font-medium text-slate-900">
          {station.id} {station.name}
        </div>
        <div className="text-xs text-slate-400">{station.stage}</div>
      </div>
      {/* Decorative: the row's visible text (id/name/stage) already carries the
          accessible name, and per-interval color segments have no text
          equivalent worth surfacing here — full history is one click away. */}
      <div aria-hidden="true" className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
        {state.status === 'loading' && <div className="h-full w-full animate-pulse bg-slate-200" />}
        {state.status === 'error' && (
          <div className="flex h-full items-center px-2 text-[11px] text-red-500">
            Failed to load history
          </div>
        )}
        {state.status === 'success' &&
          state.data.intervals.map((interval, i) => {
            const start = Math.max(new Date(interval.startedAt).getTime(), windowStart)
            const end = interval.endedAt ? new Date(interval.endedAt).getTime() : Date.now()
            const left = ((start - windowStart) / windowMs) * 100
            const width = Math.max(0, ((end - start) / windowMs) * 100)
            return (
              <div
                key={i}
                className={`absolute top-0 h-full ${STATUS_TOKENS[interval.status].dotClass}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            )
          })}
      </div>
    </button>
  )
}
