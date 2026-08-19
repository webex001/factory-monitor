import { NavLink } from 'react-router-dom'
import {
  ListChecks,
  LayoutGrid,
  BarChart3,
  ClipboardList,
  CircleGauge,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react'
import { useStations } from '@/hooks/useStations'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
  }`

const CONNECTION_LABEL: Record<string, string> = {
  live: 'Live',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
}

const CONNECTION_TEXT: Record<string, string> = {
  live: 'text-emerald-400',
  connecting: 'text-slate-400',
  reconnecting: 'text-amber-400',
}

const CONNECTION_DOT: Record<string, string> = {
  live: 'bg-emerald-400',
  connecting: 'bg-slate-400 animate-pulse',
  reconnecting: 'bg-amber-400 animate-pulse',
}

export function Sidebar() {
  const { connectionStatus } = useStations()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="px-5 pt-6 pb-5">
        <div className="text-xl font-bold tracking-tight text-white">DOMIN</div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          Factory status
          <span
            className={`inline-flex items-center gap-1 normal-case ${CONNECTION_TEXT[connectionStatus]}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${CONNECTION_DOT[connectionStatus]}`}
            />{' '}
            {CONNECTION_LABEL[connectionStatus]}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        <NavSection label="Factory status">
          <NavLink to="/" end className={navLinkClass}>
            <ListChecks size={16} aria-hidden="true" /> Stations
          </NavLink>
          <NavLink to="/floor-map" className={navLinkClass}>
            <LayoutGrid size={16} aria-hidden="true" /> Floor map
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            <BarChart3 size={16} aria-hidden="true" /> Dashboard
          </NavLink>
        </NavSection>

        <NavSection label="Production">
          <span className={navLinkClass({ isActive: false })} aria-disabled="true">
            <ClipboardList size={16} aria-hidden="true" /> Jobs
          </span>
          <span className={navLinkClass({ isActive: false })} aria-disabled="true">
            <CircleGauge size={16} aria-hidden="true" /> Valves
          </span>
          <span className={navLinkClass({ isActive: false })} aria-disabled="true">
            <FileText size={16} aria-hidden="true" /> Reports
          </span>
          <span className={navLinkClass({ isActive: false })} aria-disabled="true">
            <AlertTriangle size={16} aria-hidden="true" />
            Alerts
            <span
              aria-label="1 alert"
              className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white"
            >
              1
            </span>
          </span>
        </NavSection>

        <NavSection label="Account">
          <span className={navLinkClass({ isActive: false })} aria-disabled="true">
            <Settings size={16} aria-hidden="true" /> Settings
          </span>
        </NavSection>
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
          JM
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">James Marsden</div>
          <div className="truncate text-xs text-slate-400">Operations</div>
        </div>
        <LogOut size={16} aria-hidden="true" className="text-slate-500" />
      </div>
    </aside>
  )
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
