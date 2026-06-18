import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Code,
  ExternalLink,
  FileText,
  Link,
  MessageCircle,
  Package,
  Search,
  SlidersHorizontal,
  Square,
  Star,
  type LucideIcon,
} from 'lucide-react'

const iconByName: Record<string, LucideIcon> = {
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'external-link': ExternalLink,
  code: Code,
  div: Square,
  file: FileText,
  frame: Boxes,
  layout: Boxes,
  link: Link,
  'message-circle': MessageCircle,
  package: Package,
  search: Search,
  section: Boxes,
  sliders: SlidersHorizontal,
  span: Square,
  star: Star,
}

export default function StoryCanvasIcon({
  className,
  name,
  svgClassName,
}: {
  className?: string
  includeBaseClass?: boolean
  name: string
  svgClassName?: string
}) {
  const Icon = iconByName[name] ?? Square

  return (
    <span className={className} aria-hidden="true">
      <Icon className={svgClassName} size={16} strokeWidth={1.8} />
    </span>
  )
}
