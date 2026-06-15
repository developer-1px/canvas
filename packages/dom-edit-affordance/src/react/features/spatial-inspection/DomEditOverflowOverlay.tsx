import {
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react'
import {
  areDomEditOverlayRectsEqual,
  createDomEditOverlayRectStyle,
  getDomEditWorldOverlayRect,
  type DomEditOverlayRect,
  type DomEditScaledOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'
import {
  intersectDomEditOverflowRects,
} from './DomEditOverflowGeometry'

type DomEditOverflowMode = 'clip' | 'scroll'

type DomEditOverflowMeasurement = {
  clipRect: DomEditScaledOverlayRect
  fullRect: DomEditScaledOverlayRect
  mode: DomEditOverflowMode
  scrollExtentRect: DomEditScaledOverlayRect | null
  visibleRect: DomEditOverlayRect | null
}

export function DomEditOverflowOverlay({
  rect,
  shellRef,
  target,
  viewport,
}: {
  rect: DomEditScaledOverlayRect
  shellRef: RefObject<HTMLElement | null>
  target: HTMLElement
  viewport: DomEditViewport
}) {
  const [measurement, setMeasurement] =
    useState<DomEditOverflowMeasurement | null>(null)

  useLayoutEffect(() => {
    let frame = 0
    let disposed = false

    const measure = () => {
      if (disposed) {
        return
      }

      const nextMeasurement = measureDomEditOverflow({
        shell: shellRef.current,
        target,
        viewport,
      })

      setMeasurement((current) =>
        areDomEditOverflowMeasurementsEqual(current, nextMeasurement)
          ? current
          : nextMeasurement)
      frame = requestAnimationFrame(measure)
    }

    frame = requestAnimationFrame(measure)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
    }
  }, [
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    shellRef,
    target,
    viewport,
  ])

  if (!measurement) {
    return null
  }

  const isSelectedClipped = !measurement.visibleRect ||
    !areDomEditOverflowRectsEqual(measurement.fullRect, measurement.visibleRect)

  return (
    <>
      {measurement.scrollExtentRect ? (
        <div
          className="figma-overflow-scroll-extent"
          style={createDomEditOverlayRectStyle(measurement.scrollExtentRect)}
        >
          <span>{measurement.mode === 'scroll' ? 'Scroll' : 'Extent'}</span>
        </div>
      ) : null}
      <div
        className={[
          'figma-overflow-clip-boundary',
          `figma-overflow-clip-boundary--${measurement.mode}`,
        ].join(' ')}
        style={createDomEditOverlayRectStyle(measurement.clipRect)}
      >
        <span>{measurement.mode === 'scroll' ? 'Scroll clip' : 'Clip'}</span>
      </div>
      {isSelectedClipped ? (
        <div
          className="figma-overflow-selected-full"
          style={createDomEditOverlayRectStyle(measurement.fullRect)}
        >
          <span>Full</span>
        </div>
      ) : null}
      {isSelectedClipped && measurement.visibleRect ? (
        <div
          className="figma-overflow-selected-visible"
          style={createDomEditOverlayRectStyle(measurement.visibleRect)}
        >
          <span>Visible</span>
        </div>
      ) : null}
    </>
  )
}

function measureDomEditOverflow({
  shell,
  target,
  viewport,
}: {
  shell: HTMLElement | null
  target: HTMLElement
  viewport: DomEditViewport
}): DomEditOverflowMeasurement | null {
  if (!shell) {
    return null
  }

  const clipElement = findDomEditOverflowClipElement(target)

  if (!clipElement) {
    return null
  }

  const shellRect = shell.getBoundingClientRect()
  const clipElementRect = clipElement.getBoundingClientRect()
  const fullElementRect = target.getBoundingClientRect()
  const clipRect = getDomEditWorldOverlayRect({
    elementRect: clipElementRect,
    shellRect,
    viewport,
  })
  const fullRect = getDomEditWorldOverlayRect({
    elementRect: fullElementRect,
    shellRect,
    viewport,
  })
  const scrollExtentRect = measureDomEditScrollExtentRect({
    clipElement,
    clipElementRect,
    shellRect,
    viewport,
  })

  return {
    clipRect,
    fullRect,
    mode: getDomEditOverflowMode(clipElement),
    scrollExtentRect: scrollExtentRect &&
      !areDomEditOverflowRectsEqual(scrollExtentRect, clipRect)
      ? scrollExtentRect
      : null,
    visibleRect: intersectDomEditOverflowRects(fullRect, clipRect),
  }
}

function findDomEditOverflowClipElement(
  target: HTMLElement,
): HTMLElement | null {
  const domSection = target.closest('[data-figma-section="dom"]')
  let element: HTMLElement | null = target

  while (element) {
    if (doesDomEditElementClipOverflow(element)) {
      return element
    }

    if (element === domSection) {
      return null
    }

    element = element.parentElement
  }

  return null
}

function doesDomEditElementClipOverflow(element: HTMLElement) {
  const style = getComputedStyle(element)

  return isDomEditClippingOverflow(style.overflowX) ||
    isDomEditClippingOverflow(style.overflowY)
}

function isDomEditClippingOverflow(value: string) {
  return value === 'auto' ||
    value === 'clip' ||
    value === 'hidden' ||
    value === 'overlay' ||
    value === 'scroll'
}

function getDomEditOverflowMode(element: HTMLElement): DomEditOverflowMode {
  const style = getComputedStyle(element)

  return isDomEditScrollableOverflow(style.overflowX) ||
    isDomEditScrollableOverflow(style.overflowY)
    ? 'scroll'
    : 'clip'
}

function isDomEditScrollableOverflow(value: string) {
  return value === 'auto' || value === 'overlay' || value === 'scroll'
}

function measureDomEditScrollExtentRect({
  clipElement,
  clipElementRect,
  shellRect,
  viewport,
}: {
  clipElement: HTMLElement
  clipElementRect: DOMRect
  shellRect: DOMRect
  viewport: DomEditViewport
}): DomEditScaledOverlayRect | null {
  const width = Math.max(clipElementRect.width, clipElement.scrollWidth)
  const height = Math.max(clipElementRect.height, clipElement.scrollHeight)

  if (width <= clipElementRect.width + 0.5 &&
    height <= clipElementRect.height + 0.5) {
    return null
  }

  return getDomEditWorldOverlayRect({
    elementRect: {
      height,
      left: clipElementRect.left - clipElement.scrollLeft,
      top: clipElementRect.top - clipElement.scrollTop,
      width,
    },
    shellRect,
    viewport,
  })
}

function areDomEditOverflowMeasurementsEqual(
  current: DomEditOverflowMeasurement | null,
  next: DomEditOverflowMeasurement | null,
) {
  if (!current || !next) {
    return current === next
  }

  return current.mode === next.mode &&
    areDomEditOverlayRectsEqual(current.clipRect, next.clipRect) &&
    areDomEditOverlayRectsEqual(current.fullRect, next.fullRect) &&
    areNullableDomEditOverflowRectsEqual(
      current.scrollExtentRect,
      next.scrollExtentRect,
    ) &&
    areNullableDomEditOverflowRectsEqual(current.visibleRect, next.visibleRect)
}

function areNullableDomEditOverflowRectsEqual(
  current: DomEditOverlayRect | null,
  next: DomEditOverlayRect | null,
) {
  if (!current || !next) {
    return current === next
  }

  return areDomEditOverflowRectsEqual(current, next)
}

function areDomEditOverflowRectsEqual(
  current: DomEditOverlayRect,
  next: DomEditOverlayRect,
) {
  return current.h === next.h &&
    current.w === next.w &&
    current.x === next.x &&
    current.y === next.y
}
