import type { LucideIcon } from 'lucide-react'

export function CanvasIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden="true"
      absoluteStrokeWidth
      size={18}
      strokeWidth={1.65}
    />
  )
}
