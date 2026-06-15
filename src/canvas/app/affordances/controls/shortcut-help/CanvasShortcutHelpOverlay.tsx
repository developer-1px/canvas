import {
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  groupCanvasShortcutHelpItems,
  type CanvasShortcutHelpItem,
} from './CanvasShortcutHelpItems'

type CanvasShortcutHelpOverlayProps = {
  items: readonly CanvasShortcutHelpItem[]
  open: boolean
  onClose: () => void
}

export function CanvasShortcutHelpOverlay({
  items,
  open,
  onClose,
}: CanvasShortcutHelpOverlayProps) {
  if (!open) {
    return null
  }

  return <CanvasShortcutHelpDialog items={items} onClose={onClose} />
}

function CanvasShortcutHelpDialog({
  items,
  onClose,
}: Omit<CanvasShortcutHelpOverlayProps, 'open'>) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const sections = useMemo(() => groupCanvasShortcutHelpItems(items), [items])

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      0,
    )

    return () => {
      window.clearTimeout(focusTimer)
      previousFocusRef.current?.focus()
    }
  }, [])

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
  }

  return (
    <div
      className="shortcut-help-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className="shortcut-help"
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <header className="shortcut-help-header">
          <h2>Keyboard shortcuts</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="shortcut-help-close"
            aria-label="Close keyboard shortcuts"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="shortcut-help-sections">
          {sections.map((section) => (
            <section
              key={section.section}
              className="shortcut-help-section"
              aria-label={section.section}
            >
              <h3>{section.section}</h3>
              <dl className="shortcut-help-list">
                {section.items.map((item) => (
                  <div key={item.id} className="shortcut-help-row">
                    <dt>{item.title}</dt>
                    <dd>
                      <kbd>{item.shortcut}</kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
