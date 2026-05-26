import {
  useEffect,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import type { Point } from '../../../../entities'

type CanvasCursorChatProps = {
  maxLength: number
  point: Point
  value: string
  visible: boolean
  onCancel: () => void
  onChange: (value: string) => void
}

export function CanvasCursorChat({
  maxLength,
  point,
  value,
  visible,
  onCancel,
  onChange,
}: CanvasCursorChatProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!visible) {
      return
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [visible])

  if (!visible) {
    return null
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation()

    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onCancel()
    }
  }

  function stopPointerPropagation(event: PointerEvent<HTMLFormElement>) {
    event.stopPropagation()
  }

  return (
    <form
      className="cursor-chat"
      aria-label="Cursor chat"
      style={{
        left: point.x,
        top: point.y,
      }}
      onBlur={handleBlur}
      onPointerDown={stopPointerPropagation}
    >
      <textarea
        ref={inputRef}
        aria-label="Cursor chat message"
        maxLength={maxLength}
        rows={2}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </form>
  )
}
