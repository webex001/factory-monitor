import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { STATUS_ORDER, STATUS_TOKENS } from '@/theme/tokens'
import { UTILISATION_TARGET_PCT } from '@/lib/dashboard'
import type { UtilisationSample } from '@/types/station'

function formatTick(timestamp: string, hours: number) {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffH = diffMs / 3_600_000
  if (diffH < 0.25) return 'now'
  return hours <= 1 ? `-${Math.round(diffH * 60)}m` : `-${Math.round(diffH)}h`
}

function describeChart(samples: UtilisationSample[], hours: number): string {
  if (samples.length === 0) return `No utilisation data for the last ${hours} hours.`
  const pcts = samples.map((s) => s.utilisationPct)
  const latest = pcts[pcts.length - 1]
  const min = Math.min(...pcts)
  const max = Math.max(...pcts)
  return `Currently ${latest}%, ranging from ${min}% to ${max}% over the last ${hours} hours. Target is ${UTILISATION_TARGET_PCT}%.`
}

export function UtilisationChart({
  samples,
  hours,
}: {
  samples: UtilisationSample[]
  hours: number
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-end gap-4 text-xs text-slate-600">
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
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={samples}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          title="Factory utilisation chart"
          desc={describeChart(samples, hours)}
        >
          <defs>
            <linearGradient id="utilisationFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={STATUS_TOKENS.running.hex} stopOpacity={0.25} />
              <stop offset="100%" stopColor={STATUS_TOKENS.running.hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v: string) => formatTick(v, hours)}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <ReferenceLine
            y={UTILISATION_TARGET_PCT}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{
              value: `Target ${UTILISATION_TARGET_PCT}%`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: '#b45309',
            }}
          />
          <Area
            type="monotone"
            dataKey="utilisationPct"
            stroke={STATUS_TOKENS.running.hex}
            strokeWidth={2}
            fill="url(#utilisationFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
