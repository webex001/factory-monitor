import type { ReactNode } from 'react'
import { CARD_CLASS } from '@/theme/card'

export function KpiCard({
  label,
  value,
  subtitle,
  children,
  topAccentClass,
}: {
  label: string
  value: string
  subtitle?: string
  children?: ReactNode
  /**
   * A status token's `topBorderClass` (e.g. `STATUS_TOKENS.faulted.topBorderClass`)
   * for an alert strip across the card's top edge — omit for the plain card.
   * Composed explicitly rather than combined with `CARD_CLASS`: an unscoped
   * `border-slate-200` sets `border-color` on all four sides, so pairing it
   * with `border-t-{color}` on the same element lets whichever wins the
   * cascade erase the other, including the top edge meant to stay colored.
   */
  topAccentClass?: string
}) {
  return (
    <div
      className={
        topAccentClass
          ? `rounded-lg border-r border-b border-l border-t-2 border-r-slate-200 border-b-slate-200 border-l-slate-200 ${topAccentClass} bg-white px-4 py-3`
          : `${CARD_CLASS} px-4 py-3`
      }
    >
      <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
      {children}
    </div>
  )
}
