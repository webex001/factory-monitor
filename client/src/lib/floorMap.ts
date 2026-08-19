import type { Station } from '@/types/station'

/** The one headline telemetry value shown on each floor-map station card. */
export function floorCardMetric(station: Station): string | null {
  const t = station.telemetry
  switch (station.id) {
    case 'M01':
      return t.build_progress_pct !== undefined ? `Build ${t.build_progress_pct}%` : null
    case 'M02':
      return t.spindle_rpm !== undefined ? `${t.spindle_rpm.toLocaleString()} rpm` : null
    case 'M04':
      return t.part_serial ?? null
    case 'M05':
      return t.parts_marked_shift !== undefined ? `${t.parts_marked_shift} marked` : null
    case 'M06':
      return t.parts_dispatched_shift !== undefined ? `${t.parts_dispatched_shift} shipped` : null
    default:
      return null
  }
}
