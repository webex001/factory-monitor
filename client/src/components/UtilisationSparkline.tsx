import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { STATUS_TOKENS } from '@/theme/tokens'
import type { UtilisationSample } from '@/types/station'

export function UtilisationSparkline({ samples }: { samples: UtilisationSample[] }) {
  return (
    // Decorative: the number it echoes is already the adjacent KpiCard's
    // text value, so it's hidden from assistive tech and skipped for
    // keyboard focus rather than duplicating that value via Recharts'
    // built-in accessibility layer.
    <div aria-hidden="true" className="mt-2 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={samples}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          accessibilityLayer={false}
        >
          <defs>
            <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={STATUS_TOKENS.running.hex} stopOpacity={0.3} />
              <stop offset="100%" stopColor={STATUS_TOKENS.running.hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="utilisationPct"
            stroke={STATUS_TOKENS.running.hex}
            strokeWidth={1.5}
            fill="url(#sparklineFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
