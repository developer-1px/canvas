import type { EditorEnginePreviewSession } from '@interactive-os/canvas/editor'
import type {
  DesignNodeId,
  DomProjection,
} from '@interactive-os/canvas/react-design'
import {
  useEffect,
  useRef,
  type CompositionEvent,
  type KeyboardEvent,
} from 'react'

export type FigJamTextEdit = {
  readonly draft: string
  readonly label: string
  readonly nodeId: DesignNodeId
  readonly session: EditorEnginePreviewSession
}

export function FigJamTextEditor({
  edit,
  projection,
  onCancel,
  onChange,
  onCommit,
}: {
  readonly edit: FigJamTextEdit
  readonly projection: DomProjection
  readonly onCancel: () => void
  readonly onChange: (value: string) => void
  readonly onCommit: () => void
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const composingRef = useRef(false)
  const measurement = projection.measure(edit.nodeId)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [edit.nodeId])

  if (!measurement) {
    return null
  }

  const handleComposition = (event: CompositionEvent<HTMLTextAreaElement>) => {
    composingRef.current = event.type === 'compositionstart'
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || composingRef.current) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCancel()
      return
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      event.stopPropagation()
      onCommit()
    }
  }

  return (
    <textarea
      ref={inputRef}
      aria-label={edit.label}
      className="figjam-react-text-editor"
      data-dom-edit-editor-control
      data-figjam-text-editor={edit.nodeId}
      spellCheck={false}
      style={{
        height: measurement.worldBounds.h,
        left: measurement.worldBounds.x,
        top: measurement.worldBounds.y,
        width: measurement.worldBounds.w,
      }}
      value={edit.draft}
      onBlur={onCommit}
      onChange={(event) => onChange(event.currentTarget.value)}
      onCompositionEnd={handleComposition}
      onCompositionStart={handleComposition}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
    />
  )
}
