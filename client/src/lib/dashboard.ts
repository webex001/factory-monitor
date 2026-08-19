import type { Station, UtilisationSample } from '@/types/station'

// Config values, not derived from telemetry — nothing in the domain model
// represents a planning target, so these are named constants rather than a
// faked computation. See README "What's implemented vs. cut".
export const DAILY_THROUGHPUT_TARGET = 160
export const UTILISATION_TARGET_PCT = 75

export function stationsRunning(stations: Station[]): { running: number; total: number } {
  return { running: stations.filter((s) => s.status === 'running').length, total: stations.length }
}

export function activeFaultStations(stations: Station[]): Station[] {
  return stations.filter((s) => s.status === 'faulted')
}

/**
 * M06 (Shipping Station) only increments this once a valve has passed every
 * upstream station, so it's a genuine throughput signal, not a mock value.
 * This task treats "shift" as "today" — the doc doesn't define shift
 * boundaries, so that's a stated assumption, not a hidden one.
 */
export function throughputToday(stations: Station[]): number {
  const shipping = stations.find((s) => s.id === 'M06')
  return shipping?.telemetry.parts_dispatched_shift ?? 0
}

export function throughputPct(throughput: number, target: number): number {
  return target > 0 ? Math.round((throughput / target) * 100) : 0
}

/**
 * The REST-fetched utilisation series only refreshes on mount or time-range
 * change, so it can lag the already-live SSE station feed. Append a trailing
 * "now" sample computed the same way as the server's own buckets
 * (`getUtilisationSeries` in mock-server/data.js) so the chart's tip and the
 * KPI number derived from it track live status changes without re-fetching.
 */
export function withLiveUtilisationSample(
  samples: UtilisationSample[],
  stations: Station[],
): UtilisationSample[] {
  if (stations.length === 0) return samples

  const counts = { running: 0, idle: 0, maintenance: 0, faulted: 0 }
  for (const station of stations) counts[station.status] += 1

  const liveSample: UtilisationSample = {
    timestamp: new Date().toISOString(),
    ...counts,
    utilisationPct: Math.round((counts.running / stations.length) * 1000) / 10,
  }

  return [...samples, liveSample]
}
