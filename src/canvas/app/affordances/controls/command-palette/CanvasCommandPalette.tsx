import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  filterCanvasCommandPaletteItems,
  type CanvasCommandPaletteItem,
} from './CanvasCommandPaletteItems'

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
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const filteredItems = useMemo(
    () =>
      filterCanvasCommandPaletteItems(items, query)
        .slice(0, MAX_VISIBLE_ITEMS),
    [items, query],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    setQuery('')
    setActiveIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    setActiveIndex((index) =>
      Math.min(index, Math.max(0, filteredItems.length - 1)),
    )
  }, [filteredItems.length])

  if (!open) {
    return null
  }

  const runItem = (item: CanvasCommandPaletteItem | undefined) => {
    if (!item || item.disabled) {
      return
    }

    item.onSelect()
    onClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(0, filteredItems.length - 1)),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      setActiveIndex((index) => Math.max(0, index - 1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      runItem(filteredItems[activeIndex])
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className="command-palette"
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          className="command-palette-input"
          aria-label="Search commands"
          placeholder="Search commands"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value)
            setActiveIndex(0)
          }}
        />
        <div className="command-palette-list" role="listbox">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="command-palette-item"
                aria-selected={index === activeIndex}
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
