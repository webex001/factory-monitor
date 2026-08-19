import type { Station } from '@/types/station'

export function makeStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 'M01',
    name: '3D Printer',
    stage: 'Print',
    type: 'Metal 3D Print',
    status: 'running',
    statusSince: Date.now() - 60_000,
    timeInStateSeconds: 60,
    utilisationPct24h: 50,
    telemetry: { chamber_temp_c: 200, build_progress_pct: 40 },
    parts: { queued: ['VLV-000001'], processed: ['VLV-000000'] },
    ...overrides,
  }
}

export const FIXTURE_STATIONS: Station[] = [
  makeStation({
    id: 'M01',
    name: '3D Printer',
    stage: 'Print',
    type: 'Metal 3D Print',
    status: 'running',
  }),
  makeStation({
    id: 'M02',
    name: 'CNC Lathe',
    stage: 'Turn',
    type: 'Precision turning',
    status: 'running',
  }),
  makeStation({
    id: 'M03',
    name: 'Honing Machine',
    stage: 'Hone',
    type: 'Bore honing',
    status: 'idle',
    telemetry: {},
  }),
  makeStation({
    id: 'M04',
    name: 'Test Rig',
    stage: 'Test',
    type: 'End-of-line performance test',
    status: 'running',
  }),
  makeStation({
    id: 'M05',
    name: 'Laser Marker',
    stage: 'Mark',
    type: 'Part identification',
    status: 'faulted',
    telemetry: { parts_marked_shift: 87 },
  }),
  makeStation({
    id: 'M06',
    name: 'Shipping Station',
    stage: 'Ship',
    type: 'Packaging and dispatch',
    status: 'maintenance',
    telemetry: { parts_dispatched_shift: 64 },
  }),
]
