import {
  Clipboard,
  CopyPlus,
  Download,
  Minus,
  Plus,
  Scan,
  Upload,
} from 'lucide-react'
import { CanvasIcon } from './CanvasIconBase'

export function MinusIcon() {
  return <CanvasIcon icon={Minus} />
}

export function PlusIcon() {
  return <CanvasIcon icon={Plus} />
}

export function FitIcon() {
  return <CanvasIcon icon={Scan} />
}

export function UploadImageIcon() {
  return <CanvasIcon icon={Upload} />
}

export function PasteImageIcon() {
  return <CanvasIcon icon={Clipboard} />
}

export function CopyImageIcon() {
  return <CanvasIcon icon={CopyPlus} />
}

export function DownloadIcon() {
  return <CanvasIcon icon={Download} />
}
