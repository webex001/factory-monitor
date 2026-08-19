import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { StationDetailPanel } from './StationDetailPanel'
import type { Station } from '@/types/station'

const DRAWER_TITLE_ID = 'station-drawer-title'
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function StationDrawer({ station, onClose }: { station: Station; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Standard dialog behavior: move focus in on open, trap Tab inside the
  // panel while open, close on Escape, and give focus back to whatever
  // opened the drawer (a table row or floor-map card) on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close station details"
        className="absolute inset-0 bg-slate-900/20"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DRAWER_TITLE_ID}
        className="relative z-10 h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <StationDetailPanel station={station} headingId={DRAWER_TITLE_ID} />
      </div>
    </div>
  )
}
