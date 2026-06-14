import {
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  inlineEditHistoryDirectionFromInputType,
  inlineEditHistoryDirectionFromKeydown,
  inlineEditSingleLineText,
  insertInlineEditText,
  isInlineEditLineBreakInput,
  restoreInlineEditFocus,
} from './CanvasInlineEditDom'
import type {
  CanvasInlineTextEditingContextValue,
} from './CanvasInlineTextEditingContext'

type CanvasContentEditableTextProps = {
  className: string
  editor: CanvasInlineTextEditingContextValue | null
  id: string
  multiline?: boolean
  style: CSSProperties | undefined
  value: string
}

export function CanvasContentEditableText({
  className,
  editor,
  id,
  multiline = true,
  style,
  value,
}: CanvasContentEditableTextProps) {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const activatedIdRef = useRef<string | null>(null)
  const committedEnterRef = useRef(false)
  const lineBreakInputHandledRef = useRef(false)
  const active = editor?.enabled === true && editor.editing?.id === id
  const currentValue = active ? editor.editing?.value ?? '' : value

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) {
      return
    }

    if (!editor) {
      return
    }

    if (active) {
      editor.setEditorElement(element)
      const handleNativeKeyDown = (event: KeyboardEvent) => {
        if (inlineEditHistoryDirectionFromKeydown(event)) {
          return
        }

        const shortcutModifier = event.metaKey || event.ctrlKey

        if (
          !editor.commitOnEnter &&
          multiline &&
          event.key === 'Enter' &&
          !shortcutModifier
        ) {
          event.preventDefault()
          event.stopImmediatePropagation()
          insertInlineEditText(element, '\n')
          editor.onChange({ id, value: element.textContent ?? '' })
          return
        }

        if (
          editor.commitOnEnter &&
          event.key === 'Enter' &&
          !event.shiftKey &&
          !shortcutModifier
        ) {
          event.preventDefault()
          event.stopImmediatePropagation()
          committedEnterRef.current = true
          editor.onCommit()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopImmediatePropagation()
          element.blur()
        }
      }

      element.addEventListener('keydown', handleNativeKeyDown)

      if (activatedIdRef.current !== id) {
        element.textContent = currentValue
        restoreInlineEditFocus(() => elementRef.current, currentValue.length)
      }

      activatedIdRef.current = id
      return () => {
        element.removeEventListener('keydown', handleNativeKeyDown)
        editor.setEditorElement(null)
      }
    }

    editor.setEditorElement(null)
    activatedIdRef.current = null
    committedEnterRef.current = false
    lineBreakInputHandledRef.current = false

    if (element.textContent !== currentValue) {
      element.textContent = currentValue
    }
  }, [active, currentValue, editor, id, multiline])

  function handleBeforeInput(event: FormEvent<HTMLDivElement>) {
    if (!active) {
      return
    }

    const inputType = (event.nativeEvent as InputEvent).inputType

    if (inlineEditHistoryDirectionFromInputType(inputType)) {
      return
    }

    if (!isInlineEditLineBreakInput(inputType)) {
      return
    }

    event.preventDefault()

    if (committedEnterRef.current) {
      committedEnterRef.current = false
      return
    }

    if (lineBreakInputHandledRef.current) {
      return
    }

    lineBreakInputHandledRef.current = true
    requestAnimationFrame(() => {
      lineBreakInputHandledRef.current = false
    })

    if (multiline) {
      insertLineBreak(event.currentTarget)
    }
  }

  function handleBlur() {
    if (active) {
      editor?.onBlur()
    }
  }

  function handleInput(event: FormEvent<HTMLDivElement>) {
    if (active) {
      updateEditingValue(event.currentTarget)
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!active) {
      return
    }

    if (inlineEditHistoryDirectionFromKeydown(event.nativeEvent)) {
      return
    }

    const shortcutModifier = event.metaKey || event.ctrlKey

    if (
      !editor?.commitOnEnter &&
      multiline &&
      event.key === 'Enter' &&
      !shortcutModifier
    ) {
      event.preventDefault()
      insertLineBreak(event.currentTarget)
      return
    }

    if (
      editor?.commitOnEnter &&
      event.key === 'Enter' &&
      !event.shiftKey &&
      !shortcutModifier
    ) {
      event.preventDefault()
      committedEnterRef.current = true
      editor.onCommit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (!active) {
      return
    }

    const pastedText = event.clipboardData.getData('text/plain')
    if (!pastedText) {
      return
    }

    event.preventDefault()
    insertInlineEditText(
      event.currentTarget,
      multiline ? pastedText : inlineEditSingleLineText(pastedText),
    )
    updateEditingValue(event.currentTarget)
  }

  function stopActivePointer(event: PointerEvent<HTMLDivElement>) {
    if (active) {
      event.stopPropagation()
    }
  }

  function updateEditingValue(element: HTMLElement) {
    editor?.onChange({ id, value: element.textContent ?? '' })
  }

  function insertLineBreak(element: HTMLElement) {
    insertInlineEditText(element, '\n')
    updateEditingValue(element)
  }

  return (
    <div
      ref={elementRef}
      className={active
        ? `${className} canvas-content-editable-text-active`
        : className}
      contentEditable={active ? 'plaintext-only' : undefined}
      data-editing={active ? 'true' : undefined}
      data-text-item-id={id}
      role={active ? 'textbox' : undefined}
      spellCheck={false}
      style={style}
      suppressContentEditableWarning
      onBeforeInput={handleBeforeInput}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onPointerDown={stopActivePointer}
    >
      {active ? null : currentValue}
    </div>
  )
}
