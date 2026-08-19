import { StatusBadge } from './StatusBadge'
import { formatTimeInState } from '@/lib/stations'
import { formatTelemetryEntries } from '@/lib/formatTelemetry'
import type { Station } from '@/types/station'

/** Shared station detail content — used by the Stations row drawer and the Floor map side panel. */
export function StationDetailPanel({
  station,
  headingId,
}: {
  station: Station
  /** Lets a modal container (StationDrawer) point its aria-labelledby at this heading. */
  headingId?: string
}) {
  const telemetry = formatTelemetryEntries(
    station.telemetry as Record<string, string | number | boolean | null | undefined>,
  )

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-medium text-slate-400">{station.id}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <h3 id={headingId} className="text-lg font-semibold text-slate-900">
            {station.name}
          </h3>
          <StatusBadge status={station.status} />
        </div>
        <div className="mt-1 text-sm text-slate-500">
          {station.stage} · {station.type}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <DetailItem label="Time in state" value={formatTimeInState(station.timeInStateSeconds)} />
        <DetailItem label="24h utilisation" value={`${station.utilisationPct24h}%`} />
        <DetailItem label="Parts queued" value={String(station.parts.queued.length)} />
        <DetailItem label="Parts processed" value={String(station.parts.processed.length)} />
      </dl>

      {telemetry.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Telemetry
          </h4>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            {telemetry.map((entry) => (
              <DetailItem key={entry.key} label={entry.label} value={entry.value} />
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  )
}
