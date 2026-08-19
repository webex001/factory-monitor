import { describe, expect, it } from 'vitest'
import {
  computeStatusCounts,
  filterStations,
  formatTimeInState,
  isFiltersActive,
  uniqueStages,
} from './stations'
import { FIXTURE_STATIONS } from '@/test/fixtures'

describe('computeStatusCounts', () => {
  it('counts each status across the fixture stations', () => {
    expect(computeStatusCounts(FIXTURE_STATIONS)).toEqual({
      running: 3,
      idle: 1,
      faulted: 1,
      maintenance: 1,
    })
  })

  it('returns zero counts for an empty list', () => {
    expect(computeStatusCounts([])).toEqual({ running: 0, idle: 0, faulted: 0, maintenance: 0 })
  })
})

describe('filterStations', () => {
  it('returns all stations when filters are default', () => {
    expect(
      filterStations(FIXTURE_STATIONS, { search: '', stage: 'all', status: 'all' }),
    ).toHaveLength(6)
  })

  it('filters by status', () => {
    const result = filterStations(FIXTURE_STATIONS, { search: '', stage: 'all', status: 'running' })
    expect(result.map((s) => s.id)).toEqual(['M01', 'M02', 'M04'])
  })

  it('filters by stage', () => {
    const result = filterStations(FIXTURE_STATIONS, { search: '', stage: 'Mark', status: 'all' })
    expect(result.map((s) => s.id)).toEqual(['M05'])
  })

  it('filters by search across id, name, and type (case-insensitive)', () => {
    expect(
      filterStations(FIXTURE_STATIONS, { search: 'lathe', stage: 'all', status: 'all' }).map(
        (s) => s.id,
      ),
    ).toEqual(['M02'])
    expect(
      filterStations(FIXTURE_STATIONS, { search: 'm06', stage: 'all', status: 'all' }).map(
        (s) => s.id,
      ),
    ).toEqual(['M06'])
    expect(
      filterStations(FIXTURE_STATIONS, { search: 'dispatch', stage: 'all', status: 'all' }).map(
        (s) => s.id,
      ),
    ).toEqual(['M06'])
  })

  it('combines search, stage, and status filters', () => {
    const result = filterStations(FIXTURE_STATIONS, {
      search: 'printer',
      stage: 'Print',
      status: 'running',
    })
    expect(result.map((s) => s.id)).toEqual(['M01'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(
      filterStations(FIXTURE_STATIONS, { search: 'nonexistent', stage: 'all', status: 'all' }),
    ).toEqual([])
  })
})

describe('isFiltersActive', () => {
  it('is false for defaults', () => {
    expect(isFiltersActive({ search: '', stage: 'all', status: 'all' })).toBe(false)
  })

  it('is true when any filter is set', () => {
    expect(isFiltersActive({ search: 'x', stage: 'all', status: 'all' })).toBe(true)
    expect(isFiltersActive({ search: '', stage: 'Print', status: 'all' })).toBe(true)
    expect(isFiltersActive({ search: '', stage: 'all', status: 'running' })).toBe(true)
  })
})

describe('formatTimeInState', () => {
  it('formats under an hour as minutes only', () => {
    expect(formatTimeInState(0)).toBe('0m')
    expect(formatTimeInState(59)).toBe('0m')
    expect(formatTimeInState(60)).toBe('1m')
    expect(formatTimeInState(43 * 60)).toBe('43m')
  })

  it('formats an hour or more as hours and minutes', () => {
    expect(formatTimeInState(60 * 60)).toBe('1h 0m')
    expect(formatTimeInState(2 * 60 * 60 + 14 * 60)).toBe('2h 14m')
  })
})

describe('uniqueStages', () => {
  it('returns each stage once, in first-seen order', () => {
    expect(uniqueStages(FIXTURE_STATIONS)).toEqual([
      'Print',
      'Turn',
      'Hone',
      'Test',
      'Mark',
      'Ship',
    ])
  })
})
