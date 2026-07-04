import { useEffect, useState } from 'react'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../canvas'
import type {
  CanvasAppWidgetInteraction,
} from '../canvas/app/authoring'

type OverlayRect = {
  height: number
  left: number
  top: number
  width: number
}

// Play-mode interaction layer. Like the text editor, it is a fixed DOM layer
// rendered above the canvas, positioned over the active widget via its on-screen
// rect so real controls receive clicks without canvas pointer gating.
export function EngineWidgetPlayOverlay({
  activeWidgetId,
  interaction,
  item,
  onChangeData,
}: {
  activeWidgetId: string | null
  interaction: CanvasAppWidgetInteraction | null
  item: CanvasCustomItem | null
  onChangeData: (itemId: string, data: CanvasJsonObject) => void
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

  if (!activeWidgetId || !item || !interaction || !rect) {
    return null
  }

  return (
    <div
      className="engine-widget-play-overlay"
      role="group"
      aria-label="Widget interaction"
      style={{
        boxSizing: 'border-box',
        height: rect.height,
        left: rect.left,
        position: 'fixed',
        top: rect.top,
        width: rect.width,
        zIndex: 40,
      }}
    >
      {interaction.render({
        data: item.data,
        item,
        onChangeData: (data) => onChangeData(item.id, data),
      })}
    </div>
  )
}
