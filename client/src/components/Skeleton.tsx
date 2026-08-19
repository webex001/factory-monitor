export function Skeleton({
  width,
  height,
  className = '',
}: {
  width?: string | number
  height?: string | number
  className?: string
}) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
