const TELEMETRY_LABELS: Record<string, string> = {
  chamber_temp_c: 'Chamber temp',
  build_progress_pct: 'Build progress',
  material_remaining_pct: 'Material remaining',
  job_id: 'Job ID',
  spindle_rpm: 'Spindle speed',
  coolant_temp_c: 'Coolant temp',
  test_running: 'Test running',
  test_result: 'Test result',
  inlet_pressure_bar: 'Inlet pressure',
  outlet_pressure_bar: 'Outlet pressure',
  flow_rate_lpm: 'Flow rate',
  fluid_temp_c: 'Fluid temp',
  test_duration_s: 'Test duration',
  part_serial: 'Part serial',
  parts_marked_shift: 'Parts marked (shift)',
  parts_dispatched_shift: 'Parts dispatched (shift)',
}

const TELEMETRY_UNITS: Record<string, string> = {
  chamber_temp_c: '°C',
  build_progress_pct: '%',
  material_remaining_pct: '%',
  spindle_rpm: ' rpm',
  coolant_temp_c: '°C',
  inlet_pressure_bar: ' bar',
  outlet_pressure_bar: ' bar',
  flow_rate_lpm: ' L/min',
  fluid_temp_c: '°C',
  test_duration_s: 's',
}

export interface TelemetryEntry {
  key: string
  label: string
  value: string
}

export function formatTelemetryEntries(
  telemetry: Record<string, string | number | boolean | null | undefined>,
): TelemetryEntry[] {
  return Object.entries(telemetry)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: TELEMETRY_LABELS[key] ?? key,
      value: formatValue(key, value),
    }))
}

function formatValue(key: string, value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  const unit = TELEMETRY_UNITS[key] ?? ''
  return `${String(value)}${unit}`
}
