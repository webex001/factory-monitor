import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Stations } from './Stations'
import { useStations } from '@/hooks/useStations'
import { FIXTURE_STATIONS } from '@/test/fixtures'

vi.mock('@/hooks/useStations', () => ({ useStations: vi.fn() }))

const mockedUseStations = vi.mocked(useStations)

function renderStations() {
  return render(
    <MemoryRouter>
      <Stations />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockedUseStations.mockReset()
})

describe('Stations page', () => {
  it('shows a loading skeleton before any data has ever loaded', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'loading' },
      connectionStatus: 'connecting',
      retry: vi.fn(),
    })
    renderStations()
    expect(screen.getByRole('status', { name: /loading stations/i })).toBeInTheDocument()
  })

  it('shows an error message with a working retry button', async () => {
    const retry = vi.fn()
    mockedUseStations.mockReturnValue({
      state: { status: 'error', message: 'Network error' },
      connectionStatus: 'connecting',
      retry,
    })
    renderStations()
    expect(screen.getByText('Network error')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('shows "No stations reporting" when the list is genuinely empty', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: [] },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderStations()
    expect(screen.getByText(/no stations reporting/i)).toBeInTheDocument()
  })

  it('shows a filtered-empty state with a working clear-filters action', async () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: FIXTURE_STATIONS },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderStations()

    await userEvent.type(screen.getByPlaceholderText(/search station/i), 'nonexistent station')
    expect(screen.getByText(/no stations match your filters/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(screen.getByText('M01')).toBeInTheDocument()
  })

  it('renders real station rows on success', () => {
    mockedUseStations.mockReturnValue({
      state: { status: 'success', data: FIXTURE_STATIONS },
      connectionStatus: 'live',
      retry: vi.fn(),
    })
    renderStations()
    expect(screen.getByText('3D Printer')).toBeInTheDocument()
    expect(screen.getByText('Shipping Station')).toBeInTheDocument()
  })
})
