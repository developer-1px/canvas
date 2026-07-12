import type { Dispatch, SetStateAction } from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../../entities'
import type {
  CanvasAppCommitSelection,
  CanvasAppDocumentAuthority,
} from '../../workspace/document/CanvasAppDocumentContracts'
import type {
  CanvasKeyboardShortcutChord,
} from '../../affordances/interaction/keyboard/CanvasKeyboardShortcutChords'
import type { CanvasAppCapability } from '../../CanvasAppCapabilityContracts'

export type CanvasAppCustomCommandShortcut = CanvasKeyboardShortcutChord

export type CanvasAppCustomCommandCommitSelection =
  CanvasAppCommitSelection

export type CanvasAppCustomCommandContext = {
  commitSelection: CanvasAppCustomCommandCommitSelection
  createId: (prefix: string) => string
  document: CanvasAppDocumentAuthority
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export type CanvasAppCustomCommand = {
  ariaLabel?: string
  id: string
  isEnabled?: (context: CanvasAppCustomCommandContext) => boolean
  label: string
  requiredCapability: CanvasAppCapability
  run: (context: CanvasAppCustomCommandContext) => void
  shortcut?: CanvasAppCustomCommandShortcut
  title: string
}
