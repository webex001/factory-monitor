import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { useStations } from '@/hooks/useStations'
import { useUtilisation } from '@/hooks/useUtilisation'
import { useStationHistory } from '@/hooks/useStationHistory'
import { FIXTURE_STATIONS } from '@/test/fixtures'

vi.mock('@/hooks/useStations', () => ({ useStations: vi.fn() }))
vi.mock('@/hooks/useUtilisation', () => ({ useUtilisation: vi.fn() }))
vi.mock('@/hooks/useStationHistory', () => ({ useStationHistory: vi.fn() }))

const mockedUseStations = vi.mocked(useStations)
const mockedUseUtilisation = vi.mocked(useUtilisation)
const mockedUseStationHistory = vi.mocked(useStationHistory)

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockedUseStations.mockReset()
  mockedUseUtilisation.mockReset()
  mockedUseStationHistory.mockReset()
  // Dashboard calls these unconditionally regardless of which branch of the
  // stations state renders, so every test needs a valid default.
  mockedUseUtilisation.mockReturnValue({ state: { status: 'loading' }, retry: vi.fn() })
  mockedUseStationHistory.mockReturnValue({ state: { status: 'loading' }, retry: vi.fn() })
})

describe('Dashboard page', () => {
  it('shows a loading skeleton before any data has ever loaded', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'loading' },
      connectionStatus: 'connecting',
      retry: vi.fn(),
    })
    renderDashboard()
    expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
  })

  it('renders real KPI data once loaded, replacing the skeleton', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: FIXTURE_STATIONS },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderDashboard()
    expect(screen.queryByRole('status', { name: /loading dashboard/i })).not.toBeInTheDocument()
    expect(screen.getByText('Stations running')).toBeInTheDocument()
    expect(screen.getByText('3/6')).toBeInTheDocument()
  })

  it('shows an alert strip on Active faults and Throughput when they need attention', () => {
    // FIXTURE_STATIONS has one faulted station (M05) and M06's
    // parts_dispatched_shift (64) sits well under DAILY_THROUGHPUT_TARGET
    // (160) — both KPI cards should get a colored top strip; the other two
    // (Utilisation, Stations running) never do.
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: FIXTURE_STATIONS },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderDashboard()

    const faultsCard = screen.getByText('Active faults').closest('.rounded-lg')
    const throughputCard = screen.getByText('Throughput · today').closest('.rounded-lg')
    const stationsRunningCard = screen.getByText('Stations running').closest('.rounded-lg')

    expect(faultsCard?.className).toContain('border-t-red-500')
    expect(throughputCard?.className).toContain('border-t-amber-500')
    expect(stationsRunningCard?.className).not.toMatch(/border-t-(red|amber)-500/)
  })

  it('shows an error message when the station list fails to load', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'error', message: 'Network error' },
      connectionStatus: 'connecting',
      retry: vi.fn(),
    })
    renderDashboard()
    expect(screen.queryByRole('status', { name: /loading dashboard/i })).not.toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
