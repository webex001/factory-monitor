import { describe, expect, it } from 'vitest'
import {
  activeFaultStations,
  stationsRunning,
  throughputPct,
  throughputToday,
  withLiveUtilisationSample,
} from './dashboard'
import { FIXTURE_STATIONS } from '@/test/fixtures'
import type { UtilisationSample } from '@/types/station'

describe('stationsRunning', () => {
  it('counts running stations against the total', () => {
    expect(stationsRunning(FIXTURE_STATIONS)).toEqual({ running: 3, total: 6 })
  })
})

describe('activeFaultStations', () => {
  it('returns only faulted stations', () => {
    expect(activeFaultStations(FIXTURE_STATIONS).map((s) => s.id)).toEqual(['M05'])
  })

  it('returns an empty array when nothing is faulted', () => {
    const noFaults = FIXTURE_STATIONS.filter((s) => s.status !== 'faulted')
    expect(activeFaultStations(noFaults)).toEqual([])
  })
})

describe('throughputToday', () => {
  it("reads M06's parts_dispatched_shift", () => {
    expect(throughputToday(FIXTURE_STATIONS)).toBe(64)
  })

  it('defaults to 0 when M06 is missing', () => {
    expect(throughputToday(FIXTURE_STATIONS.filter((s) => s.id !== 'M06'))).toBe(0)
  })
})

describe('throughputPct', () => {
  it('computes a percentage of target', () => {
    expect(throughputPct(80, 160)).toBe(50)
    expect(throughputPct(160, 160)).toBe(100)
  })

  it('handles a zero target without dividing by zero', () => {
    expect(throughputPct(10, 0)).toBe(0)
  })
})

describe('withLiveUtilisationSample', () => {
  it('appends a trailing sample computed from the live station list', () => {
    const restSamples: UtilisationSample[] = [
      {
        timestamp: '2026-08-18T12:00:00.000Z',
        running: 4,
        idle: 1,
        maintenance: 1,
        faulted: 0,
        utilisationPct: 66.7,
      },
    ]

    const result = withLiveUtilisationSample(restSamples, FIXTURE_STATIONS)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(restSamples[0])
    expect(result[1]).toMatchObject({
      running: 3,
      idle: 1,
      faulted: 1,
      maintenance: 1,
      utilisationPct: 50,
    })
  })

  it('returns the samples unchanged when there are no live stations', () => {
    const restSamples: UtilisationSample[] = [
      {
        timestamp: '2026-08-18T12:00:00.000Z',
        running: 4,
        idle: 1,
        maintenance: 1,
        faulted: 0,
        utilisationPct: 66.7,
      },
    ]

    expect(withLiveUtilisationSample(restSamples, [])).toBe(restSamples)
  })
})
