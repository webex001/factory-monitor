import { Skeleton } from './Skeleton'
import { CARD_CLASS } from '@/theme/card'

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${CARD_CLASS} px-4 py-3`}>
            <Skeleton width={90} height={12} />
            <Skeleton width={50} height={24} className="mt-2" />
          </div>
        ))}
      </div>

      <div className={`mb-5 ${CARD_CLASS} p-4`}>
        <Skeleton width={140} height={14} />
        <Skeleton height={220} className="mt-3" />
      </div>

      <div className={CARD_CLASS}>
        <div className="border-b border-slate-100 px-4 py-2.5">
          <Skeleton width={180} height={14} />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton width={100} height={14} />
              <Skeleton height={20} className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
