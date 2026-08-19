// Same-origin in both dev (Vite proxy, see vite.config.ts) and prod (served
// together per the README's deploy instructions) — no base URL needed.

const API_BASE = 'https://factory-monitor-c29s.onrender.com'

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}
