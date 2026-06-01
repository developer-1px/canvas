import { useEffect, useState } from 'react'
import type { TodoWidgetData } from './widget-catalog/TodoWidget'

type OverlayRect = {
  height: number
  left: number
  top: number
  width: number
}

// Play-mode interaction layer for a Todo widget. Like the text editor, it is a
// fixed DOM layer rendered above the canvas, positioned over the active widget
// via its on-screen rect — so real checkboxes receive clicks without any canvas
// pointer gating. Toggling commits through the host-provided onToggle.
export function EngineWidgetPlayOverlay({
  activeWidgetId,
  data,
  onToggle,
}: {
  activeWidgetId: string | null
  data: TodoWidgetData | null
  onToggle: (index: number) => void
}) {
  const [rect, setRect] = useState<OverlayRect | null>(null)

  useEffect(() => {
    if (!activeWidgetId) {
      return undefined
    }

    let frame = 0
    const track = () => {
      const element = document.querySelector(
        `[data-canvas-item-id="${activeWidgetId}"]`,
      )

      if (element) {
        const bounds = element.getBoundingClientRect()
        setRect({
          height: bounds.height,
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
        })
      }

      frame = requestAnimationFrame(track)
    }

    frame = requestAnimationFrame(track)
    return () => cancelAnimationFrame(frame)
  }, [activeWidgetId])

  if (!activeWidgetId || !data || !rect) {
    return null
  }

  return (
    <div
      className="engine-widget-play-overlay"
      role="group"
      aria-label="Todo widget interaction"
      style={{
        background: '#fff',
        border: '1px solid #2457c5',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(23,32,51,0.12)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        gap: 6,
        height: rect.height,
        left: rect.left,
        padding: '12px 14px',
        position: 'fixed',
        top: rect.top,
        width: rect.width,
        zIndex: 40,
      }}
    >
      <div style={{ color: '#39404c', fontSize: 12, fontWeight: 600 }}>
        {data.title}
      </div>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {data.items.map((todo, index) => (
          <li key={index} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            <label
              style={{
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                fontSize: 13,
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onToggle(index)}
              />
              <span
                style={{
                  color: todo.done ? '#6d7380' : '#1d2028',
                  textDecoration: todo.done ? 'line-through' : 'none',
                }}
              >
                {todo.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
