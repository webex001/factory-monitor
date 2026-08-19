import { useMemo, useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { KpiCard } from '@/components/KpiCard'
import { UtilisationChart } from '@/components/UtilisationChart'
import { UtilisationSparkline } from '@/components/UtilisationSparkline'
import { StatusTimeline } from '@/components/StatusTimeline'
import { StationDrawer } from '@/components/StationDrawer'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import { useStations } from '@/hooks/useStations'
import { useUtilisation } from '@/hooks/useUtilisation'
import {
  DAILY_THROUGHPUT_TARGET,
  activeFaultStations,
  stationsRunning,
  throughputPct,
  throughputToday,
  withLiveUtilisationSample,
} from '@/lib/dashboard'
import { CARD_CLASS } from '@/theme/card'
import { STATUS_TOKENS } from '@/theme/tokens'

const TIME_RANGES = [
  { label: '1h', hours: 1 },
  { label: '4h', hours: 4 },
  { label: '24h', hours: 24 },
]

export function Dashboard() {
  const [hours, setHours] = useState(24)
  const { state: stationsState } = useStations()
  const { state: utilState, retry: retryUtil } = useUtilisation(hours)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const stations = useMemo(
    () => (stationsState.status === 'success' ? stationsState.data : []),
    [stationsState],
  )
  const running = stationsRunning(stations)
  const faults = activeFaultStations(stations)
  const throughput = throughputToday(stations)
  const selectedStation = stations.find((s) => s.id === selectedId) ?? null

  const liveSamples = useMemo(
    () =>
      utilState.status === 'success'
        ? withLiveUtilisationSample(utilState.data.samples, stations)
        : [],
    [utilState, stations],
  )

  const utilisationPctNow =
    liveSamples.length > 0 ? liveSamples[liveSamples.length - 1].utilisationPct : null

  return (
    <>
      <TopBar crumbs={['Factory Status', 'Dashboard']} />
      <div className="flex-1 p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Production line · Site 1 · Bay A
            </div>
            <h1 className="mt-0.5 text-xl font-semibold text-slate-900">Operational dashboard</h1>
          </div>
          <div
            role="group"
            aria-label="Time range"
            className="flex rounded-md border border-slate-300 bg-white p-0.5"
          >
            {TIME_RANGES.map((range) => (
              <button
                key={range.hours}
                type="button"
                onClick={() => setHours(range.hours)}
                aria-pressed={hours === range.hours}
                className={`rounded px-3 py-1 text-sm font-medium ${
                  hours === range.hours
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {stationsState.status === 'loading' && <DashboardSkeleton />}

        {stationsState.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{stationsState.message}</p>
          </div>
        )}

        {stationsState.status === 'success' && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                label={`Factory utilisation · ${hours}h`}
                value={utilisationPctNow !== null ? `${utilisationPctNow}%` : '—'}
              >
                {utilState.status === 'success' && <UtilisationSparkline samples={liveSamples} />}
              </KpiCard>

              <KpiCard
                label="Stations running"
                value={`${running.running}/${running.total}`}
                subtitle={
                  running.total - running.running > 0
                    ? `${running.total - running.running} not producing`
                    : 'All producing'
                }
              />

              <KpiCard
                label="Active faults"
                value={String(faults.length)}
                subtitle={faults.length > 0 ? faults.map((s) => s.id).join(', ') : 'None'}
                topAccentClass={
                  faults.length > 0 ? STATUS_TOKENS.faulted.topBorderClass : undefined
                }
              />

              <KpiCard
                label="Throughput · today"
                value={String(throughput)}
                subtitle={`Target ${DAILY_THROUGHPUT_TARGET} · ${throughputPct(throughput, DAILY_THROUGHPUT_TARGET)}%`}
                topAccentClass={
                  throughput < DAILY_THROUGHPUT_TARGET
                    ? STATUS_TOKENS.idle.topBorderClass
                    : undefined
                }
              />
            </div>

            <div className={`mb-5 ${CARD_CLASS} p-4`}>
              <h2 className="text-sm font-semibold text-slate-900">Factory utilisation</h2>
              <p className="text-xs text-slate-500">
                Fraction of stations running, sampled per 30 minutes
              </p>

              {utilState.status === 'loading' && (
                <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                  Loading utilisation…
                </div>
              )}
              {utilState.status === 'error' && (
                <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-sm text-red-600">
                  {utilState.message}
                  <button
                    type="button"
                    onClick={retryUtil}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              {utilState.status === 'success' && liveSamples.length === 0 && (
                <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                  No utilisation data for this window.
                </div>
              )}
              {utilState.status === 'success' && liveSamples.length > 0 && (
                <UtilisationChart samples={liveSamples} hours={hours} />
              )}
            </div>

            <StatusTimeline stations={stations} onSelect={setSelectedId} />
          </>
        )}
      </div>

      {selectedStation && (
        <StationDrawer station={selectedStation} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}
