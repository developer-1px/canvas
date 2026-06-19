import {
  useEffect,
  useId,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import {
  createCanvasFindReplacePanelDescriptor,
} from './CanvasFindReplacePanelDescriptor'
import {
  runCanvasFindReplacePanelKeyboardIntent,
} from './CanvasFindReplacePanelKeyboard'

type CanvasFindReplacePanelProps = {
  matchCount: number
  open: boolean
  query: string
  replacement: string
  onClose: () => void
  onQueryChange: (query: string) => void
  onReplaceAll: () => void
  onReplacementChange: (replacement: string) => void
}

export function CanvasFindReplacePanel({
  matchCount,
  open,
  query,
  replacement,
  onClose,
  onQueryChange,
  onReplaceAll,
  onReplacementChange,
}: CanvasFindReplacePanelProps) {
  const controlId = useId()
  const queryRef = useRef<HTMLInputElement | null>(null)
  const canReplace = query.length > 0 && matchCount > 0
  const panelDescriptor = createCanvasFindReplacePanelDescriptor({
    controlId,
    matchCount,
    query,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const frame = requestAnimationFrame(() => {
      queryRef.current?.focus()
      queryRef.current?.select()
    })

    return () => cancelAnimationFrame(frame)
  }, [open])

  if (!open) {
    return null
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (canReplace) {
      onReplaceAll()
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    runCanvasFindReplacePanelKeyboardIntent({
      event,
      onClose,
    })
  }

  return (
    <form
      {...panelDescriptor.rootAttributes}
      className="find-replace-panel"
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    >
      <input
        ref={queryRef}
        {...panelDescriptor.queryInputAttributes}
        placeholder="Find"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <input
        {...panelDescriptor.replacementInputAttributes}
        placeholder="Replace"
        value={replacement}
        onChange={(event) => onReplacementChange(event.target.value)}
      />
      <span
        {...panelDescriptor.countStatusAttributes}
        className="find-replace-count"
      >
        {query.length > 0 ? matchCount : 0}
      </span>
      <button type="submit" disabled={!canReplace}>
        Replace
      </button>
      <button type="button" aria-label="Close find replace" onClick={onClose}>
        x
      </button>
    </form>
  )
}
