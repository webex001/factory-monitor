import { useMemo, useState } from 'react'
import { ChevronRight, Download, Search } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { StatusBadge } from '@/components/StatusBadge'
import { StationDrawer } from '@/components/StationDrawer'
import { StationsSkeleton } from '@/components/StationsSkeleton'
import { useStations } from '@/hooks/useStations'
import {
  DEFAULT_STATION_FILTERS,
  computeStatusCounts,
  filterStations,
  formatTimeInState,
  uniqueStages,
} from '@/lib/stations'
import { downloadCsv, stationsToCsv } from '@/lib/csvExport'
import { STATUS_ORDER, STATUS_TOKENS } from '@/theme/tokens'
import { CARD_CLASS } from '@/theme/card'
import type { Station } from '@/types/station'
import type { StationFilters } from '@/lib/stations'

export function Stations() {
  const { state, connectionStatus, retry } = useStations()
  const [filters, setFilters] = useState<StationFilters>(DEFAULT_STATION_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const stations = useMemo(() => (state.status === 'success' ? state.data : []), [state])
  const counts = useMemo(() => computeStatusCounts(stations), [stations])
  const stages = useMemo(() => uniqueStages(stations), [stations])
  const filtered = useMemo(() => filterStations(stations, filters), [stations, filters])
  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        sortDir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id),
      ),
    [filtered, sortDir],
  )
  const selectedStation = stations.find((s) => s.id === selectedId) ?? null

  return (
    <>
      <TopBar crumbs={['Factory Status', 'Stations']} />
      <div className="flex-1 p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-slate-900">Stations</h1>
          {state.status === 'success' && (
            <p className="mt-0.5 text-sm text-slate-500">
              {stations.length} stations
              {counts.faulted > 0
                ? ` · ${counts.faulted} fault${counts.faulted > 1 ? 's' : ''}`
                : ''}
            </p>
          )}
        </div>

        {state.status === 'loading' && <StationsSkeleton />}

        {state.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {state.status === 'success' && (
          <>
            {connectionStatus === 'reconnecting' && (
              <div
                role="status"
                className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
              >
                Live connection lost — showing last known data.
              </div>
            )}

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATUS_ORDER.map((status) => {
                const token = STATUS_TOKENS[status]
                return (
                  <div
                    key={status}
                    className={`rounded-lg border border-l-4 border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-white px-4 py-3 ${token.leftBorderClass}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {token.label}
                      <span className={`h-2 w-2 rounded-full ${token.dotClass}`} />
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                      {counts[status]}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="relative flex-1 min-w-[220px]">
                <span className="sr-only">Search stations</span>
                <Search
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="Search station, name or type"
                  className="w-full rounded-md border border-slate-300 py-1.5 pr-3 pl-8 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                />
              </label>

              <label className="flex items-center gap-1.5 text-sm">
                <span className="sr-only">Filter by stage</span>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value }))}
                  className="rounded-md border border-slate-300 py-1.5 px-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All stages</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5 text-sm">
                <span className="sr-only">Filter by status</span>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      status: e.target.value as StationFilters['status'],
                    }))
                  }
                  className="rounded-md border border-slate-300 py-1.5 px-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
                >
                  <option value="all">All statuses</option>
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_TOKENS[status].label}
                    </option>
                  ))}
                </select>
              </label>

              <span className="ml-auto text-xs text-slate-500">
                {sorted.length} of {stations.length} stations
              </span>

              <button
                type="button"
                onClick={() => downloadCsv('stations.csv', stationsToCsv(sorted))}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download size={14} aria-hidden="true" /> Export
              </button>
            </div>

            <div className={`overflow-hidden ${CARD_CLASS}`}>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th
                      className="px-4 py-2.5"
                      aria-sort={sortDir === 'asc' ? 'ascending' : 'descending'}
                    >
                      <button
                        type="button"
                        onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                        className="flex items-center gap-1"
                      >
                        ID <span aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      </button>
                    </th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Time in state</th>
                    <th className="px-4 py-2.5">24h utilisation</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((station) => (
                    <StationRow key={station.id} station={station} onSelect={setSelectedId} />
                  ))}
                </tbody>
              </table>

              {sorted.length === 0 && stations.length > 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No stations match your filters.</p>
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_STATION_FILTERS)}
                    className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {stations.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">No stations reporting.</div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedStation && (
        <StationDrawer station={selectedStation} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}

function StationRow({ station, onSelect }: { station: Station; onSelect: (id: string) => void }) {
  return (
    <tr
      onClick={() => onSelect(station.id)}
      tabIndex={0}
      aria-label={`View details for ${station.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(station.id)
        }
      }}
      className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
    >
      <td className="px-4 py-3 font-medium text-slate-900">{station.id}</td>
      <td className="px-4 py-3">{station.name}</td>
      <td className="px-4 py-3 text-slate-600">{station.stage}</td>
      <td className="px-4 py-3 text-slate-600">{station.type}</td>
      <td className="px-4 py-3">
        <StatusBadge status={station.status} />
      </td>
      <td className="px-4 py-3 text-slate-600">{formatTimeInState(station.timeInStateSeconds)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${STATUS_TOKENS.running.dotClass}`}
              style={{ width: `${Math.min(100, Math.max(0, station.utilisationPct24h))}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{station.utilisationPct24h}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-300">
        <ChevronRight size={16} aria-hidden="true" />
      </td>
    </tr>
  )
}
