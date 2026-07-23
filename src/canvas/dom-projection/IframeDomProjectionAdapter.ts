import type { Bounds } from '../core'
import type { DomProjectionElementAdapter } from './DomProjection'

export type CreateIframeDomProjectionAdapterOptions = {
  readonly getFrameElement: () => HTMLIFrameElement | null
  readonly getViewportSize?: () => {
    readonly height: number
    readonly width: number
  } | null
}

export function createIframeDomProjectionAdapter({
  getFrameElement,
  getViewportSize,
}: CreateIframeDomProjectionAdapterOptions): DomProjectionElementAdapter {
  return Object.freeze({
    getClientBounds(element: HTMLElement): Bounds | null {
      const frame = getFrameElement()

      if (!frame) {
        return null
      }

      const frameRect = frame.getBoundingClientRect()
      const innerRect = element.getBoundingClientRect()
      const viewportSize = getViewportSize?.() ?? readIframeViewportSize(frame)

      if (
        !viewportSize ||
        !isPositiveFinite(viewportSize.width) ||
        !isPositiveFinite(viewportSize.height) ||
        !isFiniteRect(frameRect) ||
        !isFiniteRect(innerRect)
      ) {
        return null
      }

      const scaleX = frameRect.width / viewportSize.width
      const scaleY = frameRect.height / viewportSize.height

      return {
        h: innerRect.height * scaleY,
        w: innerRect.width * scaleX,
        x: frameRect.left + innerRect.left * scaleX,
        y: frameRect.top + innerRect.top * scaleY,
      }
    },
  })
}

function readIframeViewportSize(frame: HTMLIFrameElement) {
  const contentWindow = frame.contentWindow
  const width = contentWindow?.innerWidth ?? frame.clientWidth
  const height = contentWindow?.innerHeight ?? frame.clientHeight

  return { height, width }
}

function isPositiveFinite(value: number) {
  return Number.isFinite(value) && value > 0
}

function isFiniteRect(rect: DOMRect) {
  return Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height)
}
