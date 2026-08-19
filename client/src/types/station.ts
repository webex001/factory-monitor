import type { StationStatus } from '@/theme/tokens'

export type { StationStatus }

export interface StationParts {
  queued: string[]
  processed: string[]
}

/** Telemetry shapes vary per station kind; all fields are optional on the wire. */
export interface StationTelemetry {
  // M01 — 3D Printer
  chamber_temp_c?: number
  build_progress_pct?: number
  material_remaining_pct?: number
  job_id?: string
  // M02 — CNC Lathe
  spindle_rpm?: number
  coolant_temp_c?: number
  // M04 — Test Rig
  test_running?: boolean
  test_result?: 'pass' | 'fail' | null
  inlet_pressure_bar?: number
  outlet_pressure_bar?: number
  flow_rate_lpm?: number
  fluid_temp_c?: number
  test_duration_s?: number
  part_serial?: string | null
  // M05 — Laser Marker
  parts_marked_shift?: number
  // M06 — Shipping Station
  parts_dispatched_shift?: number
}

export interface Station {
  id: string
  name: string
  stage: string
  type: string
  status: StationStatus
  statusSince: number
  timeInStateSeconds: number
  utilisationPct24h: number
  telemetry: StationTelemetry
  parts: StationParts
}

export interface StationHistoryInterval {
  status: StationStatus
  startedAt: string
  endedAt: string | null
}

export interface StationHistoryResponse {
  stationId: string
  hours: number
  utilisationPct: number
  intervals: StationHistoryInterval[]
}

export interface UtilisationSample {
  timestamp: string
  running: number
  idle: number
  maintenance: number
  faulted: number
  utilisationPct: number
}

export interface UtilisationResponse {
  hours: number
  samples: UtilisationSample[]
}
