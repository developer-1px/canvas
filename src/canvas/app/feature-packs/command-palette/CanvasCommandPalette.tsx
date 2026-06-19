import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  runCanvasModalBackdropPointerIntent,
  runCanvasModalKeyboardIntent,
  useCanvasModalFocusLifecycle,
} from '../../affordances/controls/modal/CanvasModalFocusLifecycle'
import {
  filterCanvasCommandPaletteItems,
  type CanvasCommandPaletteItem,
} from './CanvasCommandPaletteItems'
import {
  getCanvasCommandPaletteKeyboardIntent,
} from './CanvasCommandPaletteKeyboard'
import {
  createCanvasCommandPaletteListboxDescriptor,
} from './CanvasCommandPaletteListbox'

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
  const listboxDescriptor = createCanvasCommandPaletteListboxDescriptor({
    activeIndex: activeItemIndex,
    controlId,
    items: filteredItems,
  })
  const activeOptionId =
    listboxDescriptor.activeOptionId ?? undefined
  const keyboardActiveIndex = listboxDescriptor.activeIndex ?? activeItemIndex

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
    if (runCanvasModalKeyboardIntent({
      event,
      onClose,
      root: dialogRef.current,
    })) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const keyboardIntent = getCanvasCommandPaletteKeyboardIntent({
        activeIndex: keyboardActiveIndex,
        itemCount: filteredItems.length,
        items: filteredItems,
        key: event.key,
      })

      if (keyboardIntent.preventDefault) {
        event.preventDefault()
      }
      if (keyboardIntent.stopPropagation) {
        event.stopPropagation()
      }
      if (keyboardIntent.kind === 'move-active') {
        setActiveIndex(keyboardIntent.activeIndex)
      }
      return
    }

    if (event.key === 'Enter') {
      const keyboardIntent = getCanvasCommandPaletteKeyboardIntent({
        activeIndex: keyboardActiveIndex,
        itemCount: filteredItems.length,
        items: filteredItems,
        key: event.key,
      })

      if (keyboardIntent.preventDefault) {
        event.preventDefault()
      }
      if (keyboardIntent.stopPropagation) {
        event.stopPropagation()
      }

      if (keyboardIntent.kind === 'run-active') {
        runItem(filteredItems[keyboardIntent.activeIndex])
      }
    }
  }

  const handleBackdropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    runCanvasModalBackdropPointerIntent({
      event,
      onDismiss: onClose,
    })
  }

  return (
    <div
      className="command-palette-backdrop"
      onPointerDown={handleBackdropPointerDown}
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
          {...listboxDescriptor.rootAttributes}
          className="command-palette-list"
          id={listboxId}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const option = listboxDescriptor.options[index]

              return (
                <button
                  key={item.id}
                  {...(option?.attributes ?? {})}
                  type="button"
                  className="command-palette-item"
                  disabled={item.disabled}
                  onClick={() => runItem(item)}
                  onMouseEnter={() => {
                    if (!item.disabled) {
                      setActiveIndex(index)
                    }
                  }}
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
              )
            })
          ) : (
            <div
              {...listboxDescriptor.emptyAttributes}
              className="command-palette-empty"
            >
              No matches
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
