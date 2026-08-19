import type { Station } from '@/types/station'

const COLUMNS: Array<{ header: string; get: (s: Station) => string | number }> = [
  { header: 'ID', get: (s) => s.id },
  { header: 'Name', get: (s) => s.name },
  { header: 'Stage', get: (s) => s.stage },
  { header: 'Type', get: (s) => s.type },
  { header: 'Status', get: (s) => s.status },
  { header: 'Time in state (s)', get: (s) => s.timeInStateSeconds },
  { header: '24h utilisation (%)', get: (s) => s.utilisationPct24h },
]

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function stationsToCsv(stations: Station[]): string {
  const rows = [COLUMNS.map((c) => c.header).join(',')]
  for (const station of stations) {
    rows.push(COLUMNS.map((c) => escapeCsvCell(c.get(station))).join(','))
  }
  return rows.join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
