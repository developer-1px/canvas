import {
  useMemo,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  trapCanvasModalTabFocus,
  useCanvasModalFocusLifecycle,
} from '../../affordances/controls/modal/CanvasModalFocusLifecycle'
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
  const dialogRef = useRef<HTMLElement>(null)
  const sections = useMemo(() => groupCanvasShortcutHelpItems(items), [items])

  useCanvasModalFocusLifecycle({
    initialFocusRef: closeButtonRef,
  })

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const backdropPointerIntent = getCanvasModalBackdropPointerIntent({
      currentTarget: event.currentTarget,
      target: event.target,
    })

    if (backdropPointerIntent.kind === 'dismiss') {
      onClose()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const modalKeyboardIntent = getCanvasModalKeyboardIntent({ key: event.key })

    if (modalKeyboardIntent.kind === 'close') {
      if (modalKeyboardIntent.preventDefault) {
        event.preventDefault()
      }
      if (modalKeyboardIntent.stopPropagation) {
        event.stopPropagation()
      }
      onClose()
      return
    }

    if (modalKeyboardIntent.kind === 'trap-focus') {
      trapCanvasModalTabFocus({
        event,
        root: dialogRef.current,
      })
    }
  }

  return (
    <div
      className="shortcut-help-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
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
