import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import { STATUS_ORDER, STATUS_TOKENS } from '@/theme/tokens'

describe('StatusBadge', () => {
  it.each(STATUS_ORDER)('renders the correct label and color for "%s"', (status) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(STATUS_TOKENS[status].label)
    expect(badge).toHaveClass(STATUS_TOKENS[status].badgeClass.split(' ')[0])
  })
})
