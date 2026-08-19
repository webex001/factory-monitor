import { useMemo, useState } from 'react'
import { MousePointer2 } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { FloorStationCard } from '@/components/FloorStationCard'
import { StationDetailPanel } from '@/components/StationDetailPanel'
import { FloorMapSkeleton } from '@/components/FloorMapSkeleton'
import { useStations } from '@/hooks/useStations'
import { STATUS_ORDER, STATUS_TOKENS } from '@/theme/tokens'
import { CARD_CLASS } from '@/theme/card'

// Fixed 6-station bay layout (same assumption ZoneLabel/stations.slice
// already make elsewhere in this file): 5 stations across the top row with
// a thin connector column between each pair, then a thin connector row
// down to M06 (which shares M05's column in the bottom row) showing the
// line's production flow, matching the reference floor plan.
const CARD_COLUMNS = ['col-start-1', 'col-start-3', 'col-start-5', 'col-start-7', 'col-start-9']
const CONNECTOR_COLUMNS = ['col-start-2', 'col-start-4', 'col-start-6', 'col-start-8']

export function FloorMap() {
  const { state } = useStations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const stations = useMemo(() => (state.status === 'success' ? state.data : []), [state])
  const byId = Object.fromEntries(stations.map((s) => [s.id, s]))
  const selectedStation = selectedId ? (byId[selectedId] ?? null) : null

  return (
    <>
      <TopBar crumbs={['Factory Status', 'Floor map']} />
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Production line · Site 1 · Bay A
            </div>
            <h1 className="mt-0.5 text-xl font-semibold text-slate-900">Shop floor plan</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            {STATUS_ORDER.map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${STATUS_TOKENS[status].dotClass}`}
                />
                {STATUS_TOKENS[status].label}
              </span>
            ))}
          </div>
        </div>

        {state.status === 'loading' && <FloorMapSkeleton />}

        {state.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {state.message}
          </div>
        )}

        {state.status === 'success' && (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className={`relative ${CARD_CLASS} p-4`}>
                <div className="mb-2 flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase">
                  <span>Bay A · Line 1</span>
                  <span>↑ N</span>
                </div>

                <div className="grid grid-cols-[1fr_12px_1fr_12px_1fr_12px_1fr_12px_1fr] grid-rows-[auto_12px_auto]">
                  {stations.slice(0, 5).map((station, i) => (
                    <div key={station.id} className={`row-start-1 h-36 ${CARD_COLUMNS[i]}`}>
                      <FloorStationCard
                        station={station}
                        selected={station.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    </div>
                  ))}

                  {CONNECTOR_COLUMNS.map((col, i) => (
                    <FlowConnector
                      key={i}
                      orientation="horizontal"
                      className={`row-start-1 ${col}`}
                    />
                  ))}

                  <FlowConnector orientation="vertical" className="row-start-2 col-start-9" />

                  <ZoneLabel
                    label="Material storage"
                    className="row-start-3 col-start-1 col-end-4"
                  />
                  <ZoneLabel label="Inspection bench" className="row-start-3 col-start-5" />
                  <ZoneLabel label="Staging area" className="row-start-3 col-start-7" />
                  {stations[5] && (
                    <div className="row-start-3 col-start-9 h-36">
                      <FloorStationCard
                        station={stations[5]}
                        selected={stations[5].id === selectedId}
                        onSelect={setSelectedId}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>↑ N</span>
                <span>Scale 1:100</span>
                <span>{stations.length} stations</span>
                <span>Bay dimensions · 36m x 14m</span>
                <span>Last sync · just now</span>
              </div>
            </div>

            <div className={`w-72 shrink-0 ${CARD_CLASS} p-5`}>
              {selectedStation ? (
                <StationDetailPanel station={selectedStation} />
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <MousePointer2 size={20} aria-hidden="true" className="text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Select a station to see details
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Live status, time-in-state, recent events and 24h utilisation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/** A thin line between two sequential stations, showing the line's flow order. */
function FlowConnector({
  orientation,
  className = '',
}: {
  orientation: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center ${className}`}>
      <span
        className={
          orientation === 'horizontal' ? 'h-px w-full bg-slate-300' : 'h-full w-px bg-slate-300'
        }
      />
    </div>
  )
}

function ZoneLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex h-36 items-center justify-center rounded-md border border-dashed border-slate-200 text-[10px] font-medium tracking-wide text-slate-300 uppercase ${className}`}
    >
      {label}
    </div>
  )
}
