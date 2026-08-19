import { Skeleton } from './Skeleton'
import { CARD_CLASS } from '@/theme/card'

export function FloorMapSkeleton() {
  return (
    <div role="status" aria-label="Loading floor map" className="flex gap-6">
      <div className={`flex-1 ${CARD_CLASS} p-4`}>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={144} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`r2-${i}`} height={144} />
          ))}
        </div>
      </div>
      <div className={`w-72 shrink-0 ${CARD_CLASS} p-5`}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={12} className="mt-3" />
      </div>
    </div>
  )
}
