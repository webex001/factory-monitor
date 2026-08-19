import type { Station } from '@/types/station'
import type { StationStatus } from '@/theme/tokens'
import { STATUS_ORDER } from '@/theme/tokens'

export function computeStatusCounts(stations: Station[]): Record<StationStatus, number> {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<
    StationStatus,
    number
  >
  for (const station of stations) counts[station.status] += 1
  return counts
}

export interface StationFilters {
  search: string
  stage: string | 'all'
  status: StationStatus | 'all'
}

export const DEFAULT_STATION_FILTERS: StationFilters = { search: '', stage: 'all', status: 'all' }

export function filterStations(stations: Station[], filters: StationFilters): Station[] {
  const search = filters.search.trim().toLowerCase()
  return stations.filter((station) => {
    if (filters.stage !== 'all' && station.stage !== filters.stage) return false
    if (filters.status !== 'all' && station.status !== filters.status) return false
    if (search) {
      const haystack = `${station.id} ${station.name} ${station.type}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

export function isFiltersActive(filters: StationFilters): boolean {
  return filters.search.trim() !== '' || filters.stage !== 'all' || filters.status !== 'all'
}

/** "2h 14m" for >=1h, "43m" below that, "0m" floor. */
export function formatTimeInState(totalSeconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(totalSeconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function uniqueStages(stations: Station[]): string[] {
  return Array.from(new Set(stations.map((s) => s.stage)))
}
