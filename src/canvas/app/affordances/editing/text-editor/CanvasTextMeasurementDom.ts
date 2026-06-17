export type CanvasTextMeasurementSize = {
  h: number
  w: number
}

export type CanvasTextMeasurementElement = {
  appendChild: (child: CanvasTextMeasurementElement) => unknown
  getBoundingClientRect: () => Pick<DOMRect, 'height' | 'width'>
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
    const rect = measurer.getBoundingClientRect()

    return {
      h: rect.height,
      w: rect.width,
    }
  } finally {
    measurer.remove()
  }
}

function formatCanvasTextMeasurementStyleValue(
  value: number | string | undefined,
) {
  return value === undefined ? undefined : String(value)
}

function getCanvasTextMeasurementDocument():
  CanvasTextMeasurementDocument | null {
  return typeof document === 'undefined'
    ? null
    : document as unknown as CanvasTextMeasurementDocument
}
