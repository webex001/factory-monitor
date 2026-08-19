import { test, expect } from '@playwright/test'

test('loads the Stations screen and shows real data from the mock server', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Stations' })).toBeVisible()
  // Real station data from GET /api/stations, not a placeholder.
  await expect(page.getByText('3D Printer')).toBeVisible()
  await expect(page.getByText('Shipping Station')).toBeVisible()
  await expect(page.getByText(/^\d+ stations/)).toBeVisible()
})

test('filtering by search narrows the table to matching rows', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('3D Printer')).toBeVisible()

  const table = page.locator('table')
  await expect(table.getByRole('row')).toHaveCount(7) // 6 stations + header row

  await page.getByPlaceholder('Search station, name or type').fill('lathe')

  await expect(table.getByRole('row')).toHaveCount(2) // CNC Lathe + header row
  await expect(page.getByText('CNC Lathe')).toBeVisible()
  await expect(page.getByText('3D Printer')).not.toBeVisible()
})

test('shows a reconnecting indicator when the live stream drops', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/^Live ·/)).toBeVisible()

  // page.route only affects *future* requests, not the already-open SSE
  // connection, so block reconnect attempts first...
  await page.route('**/api/stream', (route) => route.abort())
  // ...then sever the live connection server-side (see mock-server's
  // test-only /api/test/drop-stream). The client's EventSource then tries
  // to reconnect, which the route above keeps aborting.
  await page.request.post('http://localhost:4000/api/test/drop-stream')

  await expect(page.getByText(/^Reconnecting ·/)).toBeVisible({ timeout: 15_000 })
  // Last-known station data stays visible rather than blanking the screen.
  await expect(page.getByText('3D Printer')).toBeVisible()
})
