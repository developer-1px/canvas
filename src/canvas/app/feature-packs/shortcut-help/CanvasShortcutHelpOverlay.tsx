import {
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  runCanvasModalBackdropPointerIntent,
  runCanvasModalKeyboardIntent,
  useCanvasModalFocusLifecycle,
} from '../../affordances/controls/modal/CanvasModalFocusLifecycle'
import {
  groupCanvasShortcutHelpItems,
  type CanvasShortcutHelpItem,
} from './CanvasShortcutHelpItems'
import {
  createCanvasShortcutHelpDialogDescriptor,
} from './CanvasShortcutHelpDialog'

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
  const controlId = useId()
  const sections = useMemo(() => groupCanvasShortcutHelpItems(items), [items])
  const dialogDescriptor = createCanvasShortcutHelpDialogDescriptor({
    controlId,
    sections: sections.map((section) => section.section),
  })

  useCanvasModalFocusLifecycle({
    initialFocusRef: closeButtonRef,
  })

  const handleBackdropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    runCanvasModalBackdropPointerIntent({
      event,
      onDismiss: onClose,
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    runCanvasModalKeyboardIntent({
      event,
      onClose,
      root: dialogRef.current,
    })
  }

  return (
    <div
      className="shortcut-help-backdrop"
      onPointerDown={handleBackdropPointerDown}
    >
      <section
        ref={dialogRef}
        {...dialogDescriptor.rootAttributes}
        className="shortcut-help"
        onKeyDown={handleKeyDown}
      >
        <header className="shortcut-help-header">
          <h2 {...dialogDescriptor.headingAttributes}>
            Keyboard shortcuts
          </h2>
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
          {dialogDescriptor.sectionDescriptors.map((sectionDescriptor, index) => {
            const section = sections[index]

            if (!section) {
              return null
            }

            return (
              <section
                key={section.section}
                {...sectionDescriptor.rootAttributes}
                className="shortcut-help-section"
              >
                <h3 {...sectionDescriptor.headingAttributes}>
                  {section.section}
                </h3>
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
            )
          })}
        </div>
      </section>
    </div>
  )
}
