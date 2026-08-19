// Same-origin in both dev (Vite proxy, see vite.config.ts) and prod (served
// together per the README's deploy instructions) — no base URL needed.

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${path}`)
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}
