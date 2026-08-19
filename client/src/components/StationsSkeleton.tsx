import { Skeleton } from './Skeleton'
import { CARD_CLASS } from '@/theme/card'

export function StationsSkeleton() {
  return (
    <div role="status" aria-label="Loading stations">
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${CARD_CLASS} px-4 py-3`}>
            <Skeleton width={70} height={12} />
            <Skeleton width={40} height={24} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Skeleton height={34} className="flex-1" />
        <Skeleton width={120} height={34} />
        <Skeleton width={120} height={34} />
      </div>

      <div className={`overflow-hidden ${CARD_CLASS}`}>
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <Skeleton width={200} height={12} />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton width={32} height={14} />
              <Skeleton width={90} height={14} />
              <Skeleton width={60} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={20} className="rounded-full" />
              <Skeleton width={50} height={14} />
              <Skeleton width={80} height={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
