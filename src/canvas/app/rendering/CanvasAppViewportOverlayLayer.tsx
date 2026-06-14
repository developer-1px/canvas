import type {
  CSSProperties,
  ReactNode,
} from 'react'
import type { Viewport } from '../../entities'

export type CanvasAppViewportOverlayLayerProps = {
  children?: ReactNode
  className?: string
  viewport: Viewport
}

export function CanvasAppViewportOverlayLayer({
  children,
  className,
  viewport,
}: CanvasAppViewportOverlayLayerProps) {
  const classNames = [
    'canvas-viewport-overlay-layer',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      <div
        className="canvas-viewport-overlay-layer__world"
        style={createCanvasAppViewportOverlayWorldStyle(viewport)}
      >
        {children}
      </div>
    </div>
  )
}

function createCanvasAppViewportOverlayWorldStyle(
  viewport: Viewport,
): CSSProperties {
  return {
    '--canvas-viewport-overlay-scale': viewport.scale,
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
  } as CSSProperties
}
