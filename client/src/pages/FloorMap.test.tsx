import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FloorMap } from './FloorMap'
import { useStations } from '@/hooks/useStations'
import { FIXTURE_STATIONS } from '@/test/fixtures'

vi.mock('@/hooks/useStations', () => ({ useStations: vi.fn() }))

const mockedUseStations = vi.mocked(useStations)

function renderFloorMap() {
  return render(
    <MemoryRouter>
      <FloorMap />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockedUseStations.mockReset()
})

describe('Floor map page', () => {
  it('shows a loading skeleton before any data has ever loaded', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'loading' },
      connectionStatus: 'connecting',
      retry: vi.fn(),
    })
    renderFloorMap()
    expect(screen.getByRole('status', { name: /loading floor map/i })).toBeInTheDocument()
  })

  it('renders real station cards once loaded, replacing the skeleton', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: FIXTURE_STATIONS },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderFloorMap()
    expect(screen.queryByRole('status', { name: /loading floor map/i })).not.toBeInTheDocument()
    expect(screen.getByText('3D Printer')).toBeInTheDocument()
    expect(screen.getByText('Shipping Station')).toBeInTheDocument()
  })

  it('shows an error message when the station list fails to load', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'error', message: 'Network error' },
      connectionStatus: 'connecting',
      retry: vi.fn(),
    })
    renderFloorMap()
    expect(screen.queryByRole('status', { name: /loading floor map/i })).not.toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
