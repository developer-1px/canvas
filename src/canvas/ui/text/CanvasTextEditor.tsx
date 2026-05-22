import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  RefObject,
} from 'react'
import type { EditingText } from '../../host/model/CanvasModel'

type CanvasTextEditorProps = {
  editing: EditingText | null
  editorRef: RefObject<HTMLTextAreaElement | null>
  style: CSSProperties | undefined
  onBlur: () => void
  onChange: (editing: EditingText) => void
  onCancel: () => void
  onCommit: () => void
}

export function CanvasTextEditor({
  editing,
  editorRef,
  style,
  onBlur,
  onCancel,
  onChange,
  onCommit,
}: CanvasTextEditorProps) {
  if (!editing || !style) {
    return null
  }

  function stopPointer(event: PointerEvent<HTMLTextAreaElement>) {
    event.stopPropagation()
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onCommit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  return (
    <textarea
      ref={editorRef}
      className="text-editor"
      value={editing.value}
      style={style}
      spellCheck={false}
      onBlur={onBlur}
      onChange={(event) => onChange({ id: editing.id, value: event.target.value })}
      onKeyDown={handleKeyDown}
      onPointerDown={stopPointer}
    />
  )
}
