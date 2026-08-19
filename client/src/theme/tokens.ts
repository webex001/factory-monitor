// Single source of truth for the four station statuses. StatusBadge, the
// Dashboard legend/chart, and the Floor map all read from this — no
// component should hardcode a status color independently.

export type StationStatus = 'running' | 'idle' | 'faulted' | 'maintenance'

interface StatusToken {
  label: string
  /** Tailwind classes for a pill/badge (light bg + dark text). */
  badgeClass: string
  /** Tailwind class for a solid status dot. */
  dotClass: string
  /** Tailwind class for a solid all-sides accent border (e.g. FloorStationCard's outline). */
  borderClass: string
  /**
   * Tailwind class for a left-edge-only accent border color, paired with a
   * neutral `border-t-slate-200 border-r-slate-200 border-b-slate-200` base
   * on the other three sides. Deliberately separate from `borderClass`: an
   * unscoped `border-{color}` utility sets `border-color` on all four
   * sides, so combining it with `border-slate-200` on the same element
   * lets whichever wins the cascade silently erase the other on every
   * side — including the one meant to stay colored.
   */
  leftBorderClass: string
  /** Same as `leftBorderClass` but for the top edge (e.g. KpiCard's alert strip). */
  topBorderClass: string
  /** Raw hex for contexts that can't use Tailwind classes (Recharts, inline SVG). */
  hex: string
}

export const STATUS_TOKENS: Record<StationStatus, StatusToken> = {
  running: {
    label: 'Running',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    leftBorderClass: 'border-l-emerald-500',
    topBorderClass: 'border-t-emerald-500',
    hex: '#22c55e',
  },
  idle: {
    label: 'Idle',
    badgeClass: 'bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    leftBorderClass: 'border-l-amber-500',
    topBorderClass: 'border-t-amber-500',
    hex: '#f59e0b',
  },
  faulted: {
    label: 'Faulted',
    badgeClass: 'bg-red-50 text-red-700',
    dotClass: 'bg-red-500',
    borderClass: 'border-red-500',
    leftBorderClass: 'border-l-red-500',
    topBorderClass: 'border-t-red-500',
    hex: '#ef4444',
  },
  maintenance: {
    label: 'Maintenance',
    badgeClass: 'bg-indigo-50 text-indigo-700',
    dotClass: 'bg-indigo-500',
    borderClass: 'border-indigo-500',
    leftBorderClass: 'border-l-indigo-500',
    topBorderClass: 'border-t-indigo-500',
    hex: '#6366f1',
  },
}

export const STATUS_ORDER: StationStatus[] = ['running', 'idle', 'faulted', 'maintenance']
