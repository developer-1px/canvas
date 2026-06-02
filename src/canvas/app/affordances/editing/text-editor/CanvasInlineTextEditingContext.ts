import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { EditingText } from '../../../../entities'

export type CanvasInlineTextEditingContextValue = {
  commitOnEnter: boolean
  editing: EditingText | null
  enabled: boolean
  setEditorElement: (element: HTMLElement | null) => void
  onBlur: () => void
  onCancel: () => void
  onChange: Dispatch<SetStateAction<EditingText | null>>
  onCommit: () => void
}

export const CanvasInlineTextEditingContext =
  createContext<CanvasInlineTextEditingContextValue | null>(null)

export function useCanvasInlineTextEditing() {
  return useContext(CanvasInlineTextEditingContext)
}
