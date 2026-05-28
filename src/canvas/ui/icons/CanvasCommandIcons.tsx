import {
  AlignCenter,
  AlignCenterVertical,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  BetweenHorizontalStart,
  BetweenVerticalStart,
  Copy,
  Group,
  Lock,
  Redo2,
  Trash2,
  Undo2,
  Ungroup,
  Unlock,
} from 'lucide-react'
import { CanvasIcon } from './CanvasIconBase'

export function GroupIcon() {
  return <CanvasIcon icon={Group} />
}

export function DuplicateIcon() {
  return <CanvasIcon icon={Copy} />
}

export function DeleteIcon() {
  return <CanvasIcon icon={Trash2} />
}

export function UndoIcon() {
  return <CanvasIcon icon={Undo2} />
}

export function RedoIcon() {
  return <CanvasIcon icon={Redo2} />
}

export function UngroupIcon() {
  return <CanvasIcon icon={Ungroup} />
}

export function AlignLeftIcon() {
  return <CanvasIcon icon={AlignLeft} />
}

export function AlignCenterIcon() {
  return <CanvasIcon icon={AlignCenter} />
}

export function AlignRightIcon() {
  return <CanvasIcon icon={AlignRight} />
}

export function AlignTopIcon() {
  return <CanvasIcon icon={AlignStartVertical} />
}

export function AlignMiddleIcon() {
  return <CanvasIcon icon={AlignCenterVertical} />
}

export function AlignBottomIcon() {
  return <CanvasIcon icon={AlignEndVertical} />
}

export function DistributeHorizontalIcon() {
  return <CanvasIcon icon={BetweenHorizontalStart} />
}

export function DistributeVerticalIcon() {
  return <CanvasIcon icon={BetweenVerticalStart} />
}

export function LockIcon() {
  return <CanvasIcon icon={Lock} />
}

export function UnlockIcon() {
  return <CanvasIcon icon={Unlock} />
}
