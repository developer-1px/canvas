import type { CSSProperties } from 'react'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomElement,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'

export type FigmaCloneDomOverlayRect = {
  h: number
  w: number
  x: number
  y: number
}

export type FigmaCloneDomScaledOverlayRect = FigmaCloneDomOverlayRect & {
  scale: number
}

type FigmaCloneDomOverlayViewport = {
  scale: number
  x: number
  y: number
}

export function createFigmaCloneDomOverlayRectStyle(
  rect: FigmaCloneDomOverlayRect,
): CSSProperties {
  return {
    height: rect.h,
    left: rect.x,
    top: rect.y,
    width: rect.w,
  }
}

export function areFigmaCloneDomOverlayRectsEqual(
  current: FigmaCloneDomScaledOverlayRect | null,
  next: FigmaCloneDomScaledOverlayRect | null,
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

export function measureFigmaCloneDomNodeOverlayRect({
  nodeId,
  shell,
  state,
  viewport,
}: {
  nodeId: FigmaCloneDomNodeId
  shell: HTMLElement | null
  state: FigmaCloneDomEditState
  viewport?: FigmaCloneDomOverlayViewport
}): FigmaCloneDomScaledOverlayRect | null {
  if (!shell) {
    return null
  }

  const element = getFigmaCloneDomOverlayElement(nodeId)

  if (!element) {
    return null
  }

  const shellRect = shell.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  return viewport
    ? getFigmaCloneDomWorldOverlayRect({ elementRect, shellRect, viewport })
    : getFigmaCloneDomScreenOverlayRect({ elementRect, nodeId, shellRect, state })
}

export function getFigmaCloneDomOverlayElement(
  nodeId: FigmaCloneDomNodeId,
): HTMLElement | null {
  return getFigmaCloneDomElement(nodeId)
}

export function clampFigmaCloneDomOverlayPosition(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function getFigmaCloneDomWorldOverlayRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>
  shellRect: Pick<DOMRect, 'left' | 'top'>
  viewport: FigmaCloneDomOverlayViewport
}): FigmaCloneDomScaledOverlayRect {
  const scale = getFigmaCloneDomOverlayScale(viewport.scale)

  return {
    h: elementRect.height / scale,
    scale,
    w: elementRect.width / scale,
    x: (elementRect.left - shellRect.left - viewport.x) / scale,
    y: (elementRect.top - shellRect.top - viewport.y) / scale,
  }
}

function getFigmaCloneDomScreenOverlayRect({
  elementRect,
  nodeId,
  shellRect,
  state,
}: {
  elementRect: Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>
  nodeId: FigmaCloneDomNodeId
  shellRect: Pick<DOMRect, 'left' | 'top'>
  state: FigmaCloneDomEditState
}): FigmaCloneDomScaledOverlayRect {
  const style = getFigmaCloneDomEditStyle(state, nodeId)
  const scale = style.w > 0 ? elementRect.width / style.w : 1

  return {
    h: elementRect.height,
    scale: getFigmaCloneDomOverlayScale(scale),
    w: elementRect.width,
    x: elementRect.left - shellRect.left,
    y: elementRect.top - shellRect.top,
  }
}

function getFigmaCloneDomOverlayScale(scale: number): number {
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}
