export type FetchState<T> =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T } // empty is success with data: [] — not its own status
