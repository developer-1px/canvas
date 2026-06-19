import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
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
  const queryRef = useRef<HTMLInputElement | null>(null)
  const canReplace = query.length > 0 && matchCount > 0

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
      className="find-replace-panel"
      aria-label="Find and replace"
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    >
      <input
        ref={queryRef}
        aria-label="Find"
        placeholder="Find"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <input
        aria-label="Replace"
        placeholder="Replace"
        value={replacement}
        onChange={(event) => onReplacementChange(event.target.value)}
      />
      <span className="find-replace-count" aria-live="polite">
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
