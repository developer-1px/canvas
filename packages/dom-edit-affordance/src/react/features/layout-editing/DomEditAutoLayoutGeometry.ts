import type { CSSProperties } from 'react'
import {
  clampDomEditOverlayPosition,
  getDomEditWorldOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditPaddingScope,
  DomEditPaddingSide,
  DomEditPaddingSides,
} from '../../../features/box-editing/DomEditPadding'
import type {
  DomEditNodeState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'

export type DomEditAutoLayoutRect = {
  h: number
  w: number
  x: number
  y: number
}

export type DomEditAutoLayoutDragKind =
  | 'gap'
  | 'padding-bottom'
  | 'padding-corner-bottom-left'
  | 'padding-corner-bottom-right'
  | 'padding-corner-top-left'
  | 'padding-corner-top-right'
  | 'padding-left'
  | 'padding-right'
  | 'padding-top'

export type DomEditAutoLayoutPaddingDragKind = Exclude<
  DomEditAutoLayoutDragKind,
  'gap'
>

export type DomEditAutoLayoutPaddingSideDragKind = Extract<
  DomEditAutoLayoutPaddingDragKind,
  'padding-bottom' | 'padding-left' | 'padding-right' | 'padding-top'
>

export type DomEditAutoLayoutPaddingCornerDragKind = Exclude<
  DomEditAutoLayoutPaddingDragKind,
  DomEditAutoLayoutPaddingSideDragKind
>

export function getDomEditPaddingOverlayRects({
  padding,
  rect,
}: {
  padding: DomEditPaddingSides
  rect: DomEditAutoLayoutRect & { scale: number }
}): Record<DomEditAutoLayoutPaddingSideDragKind, CSSProperties> {
  const topThickness = getDomEditPaddingOverlayThickness({
    padding: padding.top,
    rect,
  })
  const rightThickness = getDomEditPaddingOverlayThickness({
    padding: padding.right,
    rect,
  })
  const bottomThickness = getDomEditPaddingOverlayThickness({
    padding: padding.bottom,
    rect,
  })
  const leftThickness = getDomEditPaddingOverlayThickness({
    padding: padding.left,
    rect,
  })

  return {
    'padding-bottom': {
      height: bottomThickness,
      left: 0,
      top: rect.h - bottomThickness,
      width: rect.w,
    },
    'padding-left': {
      height: rect.h,
      left: 0,
      top: 0,
      width: leftThickness,
    },
    'padding-right': {
      height: rect.h,
      left: rect.w - rightThickness,
      top: 0,
      width: rightThickness,
    },
    'padding-top': {
      height: topThickness,
      left: 0,
      top: 0,
      width: rect.w,
    },
  }
}

export function getDomEditPaddingCornerRects({
  rect,
}: {
  rect: DomEditAutoLayoutRect & { scale: number }
}): Record<DomEditAutoLayoutPaddingCornerDragKind, CSSProperties> {
  const maxSize = Math.max(4, Math.min(18, rect.w, rect.h))
  const size = clampDomEditOverlayPosition(
    Math.min(rect.w, rect.h) / 4,
    Math.min(10, maxSize),
    maxSize,
  )

  return {
    'padding-corner-bottom-left': {
      height: size,
      left: 0,
      top: rect.h - size,
      width: size,
    },
    'padding-corner-bottom-right': {
      height: size,
      left: rect.w - size,
      top: rect.h - size,
      width: size,
    },
    'padding-corner-top-left': {
      height: size,
      left: 0,
      top: 0,
      width: size,
    },
    'padding-corner-top-right': {
      height: size,
      left: rect.w - size,
      top: 0,
      width: size,
    },
  }
}

export function getDomEditPaddingLabelPosition({
  padding,
  rect,
}: {
  padding: DomEditPaddingSides
  rect: DomEditAutoLayoutRect & { scale: number }
}) {
  const thickness = getDomEditScaledSpacing({
    max: Math.min(rect.w, rect.h) / 2,
    value: Math.max(
      padding.bottom,
      padding.left,
      padding.right,
      padding.top,
    ),
  })
  const inset = Math.max(12, thickness / 2)

  return {
    x: rect.x + Math.min(inset, rect.w - 12),
    y: rect.y + Math.min(inset, rect.h - 12),
  }
}

function getDomEditPaddingOverlayThickness({
  padding,
  rect,
}: {
  padding: number
  rect: DomEditAutoLayoutRect & { scale: number }
}) {
  const visibleThickness = getDomEditScaledSpacing({
    max: Math.min(rect.w, rect.h) / 2,
    value: padding,
  })

  return padding <= 0 ? 8 : visibleThickness
}

export function getDomEditGapRectValue({
  direction,
  rect,
}: {
  direction: DomEditNodeState['direction']
  rect: DomEditAutoLayoutRect
}) {
  return Math.round(direction === 'row' ? rect.w : rect.h)
}

export function getDomEditPaddingDelta(
  kind: DomEditAutoLayoutPaddingDragKind,
  dx: number,
  dy: number,
) {
  if (kind === 'padding-corner-bottom-left') {
    return (dx - dy) / 2
  }

  if (kind === 'padding-corner-bottom-right') {
    return (-dx - dy) / 2
  }

  if (kind === 'padding-corner-top-left') {
    return (dx + dy) / 2
  }

  if (kind === 'padding-corner-top-right') {
    return (-dx + dy) / 2
  }

  if (kind === 'padding-left') {
    return dx
  }

  if (kind === 'padding-right') {
    return -dx
  }

  if (kind === 'padding-top') {
    return dy
  }

  return -dy
}

export function getDomEditPaddingDragScope(
  kind: DomEditAutoLayoutPaddingDragKind,
  {
    pinnedSide = null,
  }: {
    pinnedSide?: DomEditPaddingSide | null
  } = {},
): DomEditPaddingScope {
  if (
    kind === 'padding-corner-bottom-left' ||
    kind === 'padding-corner-bottom-right' ||
    kind === 'padding-corner-top-left' ||
    kind === 'padding-corner-top-right'
  ) {
    return 'all'
  }

  const side = getDomEditPaddingDragSide(kind)

  if (side && pinnedSide === side) {
    return side
  }

  if (kind === 'padding-left' || kind === 'padding-right') {
    return 'horizontal'
  }

  return 'vertical'
}

export function getDomEditPaddingDragSide(
  kind: DomEditAutoLayoutPaddingDragKind,
): DomEditPaddingSide | null {
  if (kind === 'padding-bottom') {
    return 'bottom'
  }

  if (kind === 'padding-left') {
    return 'left'
  }

  if (kind === 'padding-right') {
    return 'right'
  }

  if (kind === 'padding-top') {
    return 'top'
  }

  return null
}

export function getDomEditPaddingDragActiveSides(
  kind: DomEditAutoLayoutPaddingDragKind,
  {
    pinnedSide = null,
  }: {
    pinnedSide?: DomEditPaddingSide | null
  } = {},
) {
  const scope = getDomEditPaddingDragScope(kind, { pinnedSide })

  if (scope === 'all') {
    return ['top', 'right', 'bottom', 'left'] satisfies DomEditPaddingSide[]
  }

  if (scope === 'horizontal') {
    return ['left', 'right'] satisfies DomEditPaddingSide[]
  }

  if (scope === 'vertical') {
    return ['top', 'bottom'] satisfies DomEditPaddingSide[]
  }

  return [scope] satisfies DomEditPaddingSide[]
}

export function measureDomEditAutoLayoutGapRects({
  direction,
  shell,
  target,
  viewport,
}: {
  direction: DomEditNodeState['direction']
  shell: HTMLElement | null
  target: HTMLElement
  viewport: DomEditViewport
}): DomEditAutoLayoutRect[] {
  if (!shell || target.children.length < 2) {
    return []
  }

  const children = Array.from(target.children)
  const shellRect = shell.getBoundingClientRect()
  const targetRect = measureDomEditAutoLayoutWorldRect({
    elementRect: target.getBoundingClientRect(),
    shellRect,
    viewport,
  })

  return children
    .slice(0, -1)
    .map((child, index) => measureDomEditAutoLayoutGapRect({
      direction,
      first: measureDomEditAutoLayoutWorldRect({
        elementRect: child.getBoundingClientRect(),
        shellRect,
        viewport,
      }),
      second: measureDomEditAutoLayoutWorldRect({
        elementRect: children[index + 1].getBoundingClientRect(),
        shellRect,
        viewport,
      }),
      targetRect,
    }))
}

function getDomEditScaledSpacing({
  max,
  value,
}: {
  max: number
  value: number
}) {
  return clampDomEditOverlayPosition(value, 0, max)
}

function measureDomEditAutoLayoutGapRect({
  direction,
  first,
  second,
  targetRect,
}: {
  direction: DomEditNodeState['direction']
  first: DomEditAutoLayoutRect
  second: DomEditAutoLayoutRect
  targetRect: DomEditAutoLayoutRect
}): DomEditAutoLayoutRect {
  if (direction === 'row') {
    const w = clampDomEditOverlayPosition(
      second.x - (first.x + first.w),
      0,
      targetRect.w,
    )
    const h = Math.min(
      Math.max(first.h, second.h),
      targetRect.h,
    )
    const x = clampDomEditOverlayPosition(
      first.x + first.w,
      targetRect.x,
      targetRect.x + targetRect.w - w,
    )
    const y = clampDomEditOverlayPosition(
      Math.min(first.y, second.y),
      targetRect.y,
      targetRect.y + targetRect.h - h,
    )

    return {
      h,
      w,
      x,
      y,
    }
  }

  const w = Math.min(Math.max(first.w, second.w), targetRect.w)
  const x = clampDomEditOverlayPosition(
    Math.min(first.x, second.x),
    targetRect.x,
    targetRect.x + targetRect.w - w,
  )
  const h = clampDomEditOverlayPosition(
    second.y - (first.y + first.h),
    0,
    targetRect.h,
  )
  const y = clampDomEditOverlayPosition(
    first.y + first.h,
    targetRect.y,
    targetRect.y + targetRect.h - h,
  )

  return {
    h,
    w,
    x,
    y,
  }
}

export function measureDomEditAutoLayoutWorldRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: DOMRect
  shellRect: DOMRect
  viewport: DomEditViewport
}): DomEditAutoLayoutRect {
  const rect = getDomEditWorldOverlayRect({
    elementRect,
    shellRect,
    viewport,
  })

  return {
    h: rect.h,
    w: rect.w,
    x: rect.x,
    y: rect.y,
  }
}
