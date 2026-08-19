import { StatusBadge } from './StatusBadge'
import { formatTimeInState } from '@/lib/stations'
import { floorCardMetric } from '@/lib/floorMap'
import { STATUS_TOKENS } from '@/theme/tokens'
import type { Station } from '@/types/station'

export function FloorStationCard({
  station,
  selected,
  onSelect,
}: {
  station: Station
  selected: boolean
  onSelect: (id: string) => void
}) {
  const metric = floorCardMetric(station)
  const token = STATUS_TOKENS[station.status]

  return (
    <button
      type="button"
      onClick={() => onSelect(station.id)}
      aria-pressed={selected}
      className={`flex h-full w-full flex-col justify-between rounded-md border bg-white p-2.5 text-left transition-shadow ${
        selected
          ? 'border-slate-900 shadow-md'
          : `border-t-slate-200 border-r-slate-200 border-b-slate-200 border-l-4 ${token.leftBorderClass} hover:shadow-sm`
      }`}
    >
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">{station.id}</span>
          <span className="text-sm font-semibold text-slate-900">{station.name}</span>
        </div>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={station.status} />
        </div>
        <div className="mt-1 text-[10px] text-slate-400">{station.type}</div>
      </div>

      <div className="my-1 text-sm font-semibold text-slate-800">{metric ?? ' '}</div>

      <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-400">
        <span className="min-w-0 truncate">
          {formatTimeInState(station.timeInStateSeconds)} · Queue: {station.parts.queued.length}
        </span>
        <span className="shrink-0 rounded bg-slate-900 px-1.5 py-0.5 font-semibold text-white">
          {station.stage.toUpperCase()}
        </span>
      </div>
    </button>
  )
}
