import type { Bounds } from '../core'
import { formatCanvasSvgNumber } from './CanvasSvgStringPrimitives'

export type CanvasCssBoundsTransformInput = {
  flipX?: boolean
  flipY?: boolean
  rotation?: number
}

export type CanvasSvgBoundsTransformInput = CanvasCssBoundsTransformInput & {
  bounds: Bounds
}

export function createCanvasCssBoundsTransform({
  flipX = false,
  flipY = false,
  rotation = 0,
}: CanvasCssBoundsTransformInput) {
  const safeRotation = normalizeCanvasTransformRotation(rotation)
  const transforms = [
    safeRotation ? `rotate(${formatCanvasSvgNumber(safeRotation)}deg)` : '',
    flipX ? 'scaleX(-1)' : '',
    flipY ? 'scaleY(-1)' : '',
  ].filter(Boolean)

  return transforms.join(' ')
}

export function createCanvasSvgBoundsTransform({
  bounds,
  flipX = false,
  flipY = false,
  rotation = 0,
}: CanvasSvgBoundsTransformInput) {
  const safeRotation = normalizeCanvasTransformRotation(rotation)
  const scaleX = flipX ? -1 : 1
  const scaleY = flipY ? -1 : 1

  if (scaleX === 1 && scaleY === 1 && !safeRotation) {
    return ''
  }

  const centerX = bounds.x + bounds.w / 2
  const centerY = bounds.y + bounds.h / 2

  return [
    `translate(${formatCanvasSvgNumber(centerX)} ${formatCanvasSvgNumber(centerY)})`,
    safeRotation ? `rotate(${formatCanvasSvgNumber(safeRotation)})` : '',
    scaleX !== 1 || scaleY !== 1 ? `scale(${scaleX} ${scaleY})` : '',
    `translate(${formatCanvasSvgNumber(-centerX)} ${formatCanvasSvgNumber(-centerY)})`,
  ].filter(Boolean).join(' ')
}

function normalizeCanvasTransformRotation(value: number) {
  return Number.isFinite(value) ? value : 0
}
