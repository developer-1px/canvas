import {
  getCanvasElementRect,
  type CanvasElementRect,
  type CanvasElementRectTarget,
} from '../../../rendering/stage/CanvasAppStageElement'

export type CanvasTextMeasurementSize = {
  h: number
  w: number
}

export type CanvasElementOverflowAxis = 'horizontal' | 'vertical'

export type CanvasElementOverflowRect = {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
}

export type CanvasElementOverflowTarget = CanvasElementRectTarget & {
  clientHeight: number
  clientWidth: number
  scrollHeight: number
  scrollWidth: number
}

export type CanvasElementOverflowMeasurement = {
  clientSize: CanvasTextMeasurementSize
  containerSize: CanvasTextMeasurementSize | null
  elementSize: CanvasTextMeasurementSize
  hasOverflow: boolean
  overflowAxis: readonly CanvasElementOverflowAxis[]
  scrollSize: CanvasTextMeasurementSize
}

export type CanvasElementOverflowMeasurementInput = {
  container?: CanvasElementOverflowTarget | null
  element?: CanvasElementOverflowTarget | null
  epsilon?: number
}

export type CanvasTextMeasurementElement = CanvasElementRectTarget & {
  appendChild: (child: CanvasTextMeasurementElement) => unknown
  remove: () => void
  style: {
    display?: string
    fontFamily?: string
    fontSize?: string
    fontWeight?: string
    left?: string
    lineHeight?: string
    marginBottom?: string
    marginTop?: string
    overflowWrap?: string
    position?: string
    top?: string
    whiteSpace?: string
    width?: string
  }
  textContent: string | null
}

export type CanvasTextMeasurementDocument = {
  body?: {
    appendChild: (child: CanvasTextMeasurementElement) => unknown
  } | null
  createElement: (tagName: 'div' | 'span') => CanvasTextMeasurementElement
}

export type CanvasTextMeasurementBlock = {
  lineHeight?: number | string
  marginBottom?: number | string
  marginTop?: number | string
  text: string
}

export type CanvasTextMeasurementStyle = {
  fontFamily?: string
  fontSize?: number | string
  fontWeight?: number | string
  overflowWrap?: string
  whiteSpace?: string
  width?: string
}

export type CanvasTextBlockMeasurementInput = {
  blocks: readonly CanvasTextMeasurementBlock[]
  document?: CanvasTextMeasurementDocument | null
  style?: CanvasTextMeasurementStyle
}

export function measureCanvasTextBlocks({
  blocks,
  document = getCanvasTextMeasurementDocument(),
  style = {},
}: CanvasTextBlockMeasurementInput): CanvasTextMeasurementSize | null {
  if (!document?.body) {
    return null
  }

  const measurer = document.createElement('div')

  measurer.style.position = 'fixed'
  measurer.style.left = '-10000px'
  measurer.style.top = '-10000px'
  measurer.style.width = style.width ?? 'max-content'
  measurer.style.whiteSpace = style.whiteSpace ?? 'pre-wrap'
  measurer.style.overflowWrap = style.overflowWrap ?? 'anywhere'
  measurer.style.fontFamily = style.fontFamily
  measurer.style.fontSize = formatCanvasTextMeasurementStyleValue(
    style.fontSize,
  )
  measurer.style.fontWeight = formatCanvasTextMeasurementStyleValue(
    style.fontWeight,
  )

  for (const block of blocks) {
    const line = document.createElement('span')

    line.style.display = 'block'
    line.style.lineHeight = formatCanvasTextMeasurementStyleValue(
      block.lineHeight,
    )
    line.style.marginBottom = formatCanvasTextMeasurementStyleValue(
      block.marginBottom,
    )
    line.style.marginTop = formatCanvasTextMeasurementStyleValue(
      block.marginTop,
    )
    line.textContent = block.text || ' '
    measurer.appendChild(line)
  }

  document.body.appendChild(measurer)

  try {
    const rect = getCanvasElementRect(measurer)

    if (!rect) {
      return null
    }

    return {
      h: rect.height,
      w: rect.width,
    }
  } finally {
    measurer.remove()
  }
}

export function measureCanvasElementOverflow({
  container,
  element,
  epsilon = 0,
}: CanvasElementOverflowMeasurementInput):
  CanvasElementOverflowMeasurement | null {
  const elementRect = getCanvasElementOverflowRect(element)

  if (
    !element ||
    !elementRect ||
    !isCanvasTextMeasurementNumber(element.clientHeight) ||
    !isCanvasTextMeasurementNumber(element.clientWidth) ||
    !isCanvasTextMeasurementNumber(element.scrollHeight) ||
    !isCanvasTextMeasurementNumber(element.scrollWidth)
  ) {
    return null
  }

  const safeEpsilon = isCanvasTextMeasurementNumber(epsilon)
    ? Math.max(0, epsilon)
    : 0
  const containerRect = getCanvasElementOverflowRect(container)
  const overflowAxis: CanvasElementOverflowAxis[] = []

  if (
    element.scrollWidth > element.clientWidth + safeEpsilon ||
    (containerRect
      ? elementRect.width > containerRect.width + safeEpsilon ||
        elementRect.left < containerRect.left - safeEpsilon ||
        elementRect.right > containerRect.right + safeEpsilon
      : false)
  ) {
    overflowAxis.push('horizontal')
  }

  if (
    element.scrollHeight > element.clientHeight + safeEpsilon ||
    (containerRect
      ? elementRect.height > containerRect.height + safeEpsilon ||
        elementRect.top < containerRect.top - safeEpsilon ||
        elementRect.bottom > containerRect.bottom + safeEpsilon
      : false)
  ) {
    overflowAxis.push('vertical')
  }

  return {
    clientSize: {
      h: element.clientHeight,
      w: element.clientWidth,
    },
    containerSize: containerRect
      ? {
          h: containerRect.height,
          w: containerRect.width,
        }
      : null,
    elementSize: {
      h: elementRect.height,
      w: elementRect.width,
    },
    hasOverflow: overflowAxis.length > 0,
    overflowAxis,
    scrollSize: {
      h: element.scrollHeight,
      w: element.scrollWidth,
    },
  }
}

function formatCanvasTextMeasurementStyleValue(
  value: number | string | undefined,
) {
  return value === undefined ? undefined : String(value)
}

function isCanvasTextMeasurementNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getCanvasElementOverflowRect(
  target?: CanvasElementRectTarget | null,
): CanvasElementOverflowRect | null {
  const rect = getCanvasElementRect(target)

  if (!rect) {
    return null
  }

  return {
    bottom: getCanvasElementRectEdge(rect, 'bottom', rect.top + rect.height),
    height: rect.height,
    left: rect.left,
    right: getCanvasElementRectEdge(rect, 'right', rect.left + rect.width),
    top: rect.top,
    width: rect.width,
  }
}

function getCanvasElementRectEdge(
  rect: CanvasElementRect,
  edge: 'bottom' | 'right',
  fallback: number,
) {
  return isCanvasTextMeasurementNumber(rect[edge]) ? rect[edge] : fallback
}

function getCanvasTextMeasurementDocument():
  CanvasTextMeasurementDocument | null {
  return typeof document === 'undefined'
    ? null
    : document as unknown as CanvasTextMeasurementDocument
}
