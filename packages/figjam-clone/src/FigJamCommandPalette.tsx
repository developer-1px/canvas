import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

export type FigJamCommandItem = {
  readonly id: string
  readonly section: string
  readonly shortcut?: string
  readonly title: string
  readonly onSelect: () => void
}

export function FigJamCommandPalette({
  items,
  open,
  onClose,
}: {
  readonly items: readonly FigJamCommandItem[]
  readonly open: boolean
  readonly onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <FigJamCommandPaletteDialog items={items} onClose={onClose} />
  )
}

function FigJamCommandPaletteDialog({
  items,
  onClose,
}: {
  readonly items: readonly FigJamCommandItem[]
  readonly onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)

    return items.filter((item) => {
      const value = `${item.title} ${item.section}`.toLowerCase()

      return terms.every((term) => value.includes(term))
    }).slice(0, 10)
  }, [items, query])
  const currentIndex = Math.min(activeIndex, Math.max(0, results.length - 1))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const run = (item: FigJamCommandItem | undefined) => {
    if (!item) {
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

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const count = results.length

      if (count > 0) {
        setActiveIndex((current) => (current + direction + count) % count)
      }
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      run(results[currentIndex])
    }
  }
  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose()
    }
  }

  return (
    <div className="command-palette-backdrop" onMouseDown={handleBackdrop}>
      <section
        aria-label="Command palette"
        aria-modal="true"
        className="command-palette"
        role="dialog"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="figjam-command-results"
          aria-expanded="true"
          aria-label="Search commands"
          className="command-palette-input"
          placeholder="Search commands"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value)
            setActiveIndex(0)
          }}
        />
        <div
          aria-label="Command results"
          className="command-palette-list"
          id="figjam-command-results"
          role="listbox"
        >
          {results.length > 0 ? results.map((item, index) => (
            <button
              aria-selected={index === currentIndex}
              className="command-palette-item"
              key={item.id}
              role="option"
              type="button"
              onClick={() => run(item)}
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
          )) : (
            <div className="command-palette-empty">No matches</div>
          )}
        </div>
      </section>
    </div>
  )
}
