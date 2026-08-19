import { STATUS_TOKENS } from '@/theme/tokens'
import type { StationStatus } from '@/theme/tokens'

export function StatusBadge({ status }: { status: StationStatus }) {
  const token = STATUS_TOKENS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${token.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${token.dotClass}`} />
      {token.label}
    </span>
  )
}
