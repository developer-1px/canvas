import {
  ArrowUpRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Highlighter,
  MessageSquareText,
  MousePointer2,
  PanelTop,
  PenLine,
  Pencil,
  Sparkles,
  Square,
  StickyNote,
  Type,
} from 'lucide-react'
import { CanvasIcon } from './CanvasIconBase'

export function SelectIcon() {
  return <CanvasIcon icon={MousePointer2} />
}

export function PanIcon() {
  return <CanvasIcon icon={Hand} />
}

export function RectIcon() {
  return <CanvasIcon icon={Square} />
}

export function EllipseIcon() {
  return <CanvasIcon icon={Circle} />
}

export function DiamondIcon() {
  return <CanvasIcon icon={Diamond} />
}

export function TextIcon() {
  return <CanvasIcon icon={Type} />
}

export function CommentIcon() {
  return <CanvasIcon icon={MessageSquareText} />
}

export function StickyNoteIcon() {
  return <CanvasIcon icon={StickyNote} />
}

export function SectionIcon() {
  return <CanvasIcon icon={PanelTop} />
}

export function HighlighterIcon() {
  return <CanvasIcon icon={Highlighter} />
}

export function MarkerIcon() {
  return <CanvasIcon icon={Pencil} />
}

export function PenIcon() {
  return <CanvasIcon icon={PenLine} />
}

export function EraserIcon() {
  return <CanvasIcon icon={Eraser} />
}

export function LaserIcon() {
  return <CanvasIcon icon={Sparkles} />
}

export function ArrowIcon() {
  return <CanvasIcon icon={ArrowUpRight} />
}
