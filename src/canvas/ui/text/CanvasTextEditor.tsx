import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent,
  RefObject,
} from 'react'

type CanvasTextEditorValue = {
  id: string
  value: string
}

type CanvasTextEditorProps = {
  editing: CanvasTextEditorValue | null
  editorRef: RefObject<HTMLTextAreaElement | null>
  style: CSSProperties | undefined
  onBlur: () => void
  onChange: (editing: CanvasTextEditorValue) => void
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
    const shortcutModifier = event.metaKey || event.ctrlKey

    if (event.key === 'Enter' && !event.shiftKey && !shortcutModifier) {
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
