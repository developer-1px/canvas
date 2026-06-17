import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  getCanvasModalKeyboardIntent,
  trapCanvasModalTabFocus,
  useCanvasModalFocusLifecycle,
} from '../../affordances/controls/modal/CanvasModalFocusLifecycle'
import {
  filterCanvasCommandPaletteItems,
  type CanvasCommandPaletteItem,
} from './CanvasCommandPaletteItems'
import {
  getCanvasCommandPaletteKeyboardIntent,
} from './CanvasCommandPaletteKeyboard'

type CanvasCommandPaletteProps = {
  items: readonly CanvasCommandPaletteItem[]
  open: boolean
  onClose: () => void
}

const MAX_VISIBLE_ITEMS = 10

export function CanvasCommandPalette({
  items,
  open,
  onClose,
}: CanvasCommandPaletteProps) {
  if (!open) {
    return null
  }

  return <CanvasCommandPaletteDialog items={items} onClose={onClose} />
}

function CanvasCommandPaletteDialog({
  items,
  onClose,
}: Omit<CanvasCommandPaletteProps, 'open'>) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const controlId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = `${controlId}-listbox`
  const filteredItems = useMemo(
    () =>
      filterCanvasCommandPaletteItems(items, query)
        .slice(0, MAX_VISIBLE_ITEMS),
    [items, query],
  )
  const maxActiveIndex = Math.max(0, filteredItems.length - 1)
  const activeItemIndex = Math.min(activeIndex, maxActiveIndex)
  const activeItem = filteredItems[activeItemIndex]
  const activeOptionId = activeItem
    ? getCanvasCommandPaletteOptionId(controlId, activeItem.id)
    : undefined

  useCanvasModalFocusLifecycle({
    initialFocusRef: inputRef,
  })

  const runItem = (item: CanvasCommandPaletteItem | undefined) => {
    if (!item || item.disabled) {
      return
    }

    item.onSelect()
    onClose()
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
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const keyboardIntent = getCanvasCommandPaletteKeyboardIntent({
        activeIndex: activeItemIndex,
        itemCount: filteredItems.length,
        key: event.key,
      })

      event.preventDefault()
      event.stopPropagation()
      if (keyboardIntent.kind === 'move-active') {
        setActiveIndex(keyboardIntent.activeIndex)
      }
      return
    }

    if (event.key === 'Enter') {
      const keyboardIntent = getCanvasCommandPaletteKeyboardIntent({
        activeIndex: activeItemIndex,
        itemCount: filteredItems.length,
        key: event.key,
      })

      if (keyboardIntent.preventDefault) {
        event.preventDefault()
        event.stopPropagation()
      }

      if (keyboardIntent.kind === 'run-active') {
        runItem(filteredItems[keyboardIntent.activeIndex])
      }
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault()
      onClose()
    }
  }

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
        className="command-palette"
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          className="command-palette-input"
          aria-activedescendant={activeOptionId}
          aria-controls={listboxId}
          aria-expanded="true"
          aria-label="Search commands"
          aria-autocomplete="list"
          placeholder="Search commands"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value)
            setActiveIndex(0)
          }}
        />
        <div
          className="command-palette-list"
          id={listboxId}
          role="listbox"
          aria-label="Command results"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="command-palette-item"
                id={getCanvasCommandPaletteOptionId(controlId, item.id)}
                aria-disabled={item.disabled ? 'true' : undefined}
                aria-selected={index === activeItemIndex}
                disabled={item.disabled}
                role="option"
                onClick={() => runItem(item)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="command-palette-item-main">
                  <span className="command-palette-item-title">
                    {item.title}
                  </span>
                  <span className="command-palette-item-section">
                    {item.section}
                  </span>
                </span>
                {item.shortcut ? (
                  <kbd className="command-palette-shortcut">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </button>
            ))
          ) : (
            <div className="command-palette-empty">No matches</div>
          )}
        </div>
      </section>
    </div>
  )
}

function getCanvasCommandPaletteOptionId(controlId: string, itemId: string) {
  return `${controlId}-option-${itemId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}
