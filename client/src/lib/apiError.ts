/**
 * Logs the real error for debugging and returns a user-facing fallback
 * message instead — raw fetch errors (status codes, "Bad Gateway", network
 * failures) are developer detail, not something to show in the UI.
 */
export function describeApiError(err: unknown, fallback: string): string {
  console.error(err)
  return fallback
}
