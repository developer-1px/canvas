import type { CSSProperties } from 'react'
import type {
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../model/DomEditTypes'

export type DomEditOverlayRect = {
  h: number
  w: number
  x: number
  y: number
}

export type DomEditScaledOverlayRect = DomEditOverlayRect & {
  scale: number
}

export function createDomEditOverlayRectStyle(
  rect: DomEditOverlayRect,
): CSSProperties {
  return {
    height: rect.h,
    left: rect.x,
    top: rect.y,
    width: rect.w,
  }
}

export function areDomEditOverlayRectsEqual(
  current: DomEditScaledOverlayRect | null,
  next: DomEditScaledOverlayRect | null,
): boolean {
  if (!current || !next) {
    return current === next
  }

  return current.h === next.h &&
    current.scale === next.scale &&
    current.w === next.w &&
    current.x === next.x &&
    current.y === next.y
}

export function measureDomEditNodeOverlayRect<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  nodeId,
  shell,
  state,
  viewport,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  nodeId: TNodeId
  shell: HTMLElement | null
  state: TState
  viewport?: DomEditViewport
}): DomEditScaledOverlayRect | null {
  if (!shell) {
    return null
  }

  const element = adapter.getElement(nodeId)

  if (!element) {
    return null
  }

  const shellRect = shell.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  return viewport
    ? getDomEditWorldOverlayRect({ elementRect, shellRect, viewport })
    : getDomEditScreenOverlayRect({
        adapter,
        elementRect,
        nodeId,
        shellRect,
        state,
      })
}

export function clampDomEditOverlayPosition(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function getDomEditWorldOverlayRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>
  shellRect: Pick<DOMRect, 'left' | 'top'>
  viewport: DomEditViewport
}): DomEditScaledOverlayRect {
  const scale = getDomEditOverlayScale(viewport.scale)

  return {
    h: elementRect.height / scale,
    scale,
    w: elementRect.width / scale,
    x: (elementRect.left - shellRect.left - viewport.x) / scale,
    y: (elementRect.top - shellRect.top - viewport.y) / scale,
  }
}

function getDomEditScreenOverlayRect<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  elementRect,
  nodeId,
  shellRect,
  state,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  elementRect: Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>
  nodeId: TNodeId
  shellRect: Pick<DOMRect, 'left' | 'top'>
  state: TState
}): DomEditScaledOverlayRect {
  const style = adapter.getStyle(state, nodeId)
  const scale = style.w > 0 ? elementRect.width / style.w : 1

  return {
    h: elementRect.height,
    scale: getDomEditOverlayScale(scale),
    w: elementRect.width,
    x: elementRect.left - shellRect.left,
    y: elementRect.top - shellRect.top,
  }
}

function getDomEditOverlayScale(scale: number): number {
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}
