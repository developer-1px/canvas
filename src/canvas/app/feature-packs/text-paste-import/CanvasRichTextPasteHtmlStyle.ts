import type {
  CanvasRichTextPasteParagraph,
  CanvasRichTextPasteParagraphAlign,
  CanvasRichTextPasteRun,
} from './CanvasRichTextPasteContracts'
import {
  getCanvasRichTextHTMLAttribute,
} from './CanvasRichTextPasteHtmlTokens'

export function getCanvasRichTextRunStyleFromElement(
  element: Element,
): Partial<CanvasRichTextPasteRun> {
  return getCanvasRichTextRunStyleFromAttributes(
    element.getAttribute('style') ?? '',
  )
}

export function getCanvasRichTextRunStyleFromAttributes(
  attributes: string,
): Partial<CanvasRichTextPasteRun> {
  const style = parseCanvasRichTextStyleAttribute(
    getCanvasRichTextHTMLAttribute(attributes, 'style') ?? attributes,
  )
  const fontSize = parseCanvasRichTextFontSize(style['font-size'])
  const strikethrough = parseCanvasRichTextStrikethrough(
    style['text-decoration-line'] ?? style['text-decoration'],
  )

  return {
    ...(fontSize !== undefined ? { fontSize } : {}),
    ...(strikethrough ? { strikethrough } : {}),
  }
}

export function getCanvasRichTextParagraphStyleFromElement(
  element: Element,
): Partial<CanvasRichTextPasteParagraph> {
  return getCanvasRichTextParagraphStyleFromAttributes(
    element.getAttribute('style') ?? '',
  )
}

export function getCanvasRichTextParagraphStyleFromAttributes(
  attributes: string,
): Partial<CanvasRichTextPasteParagraph> {
  const style = parseCanvasRichTextStyleAttribute(
    getCanvasRichTextHTMLAttribute(attributes, 'style') ?? attributes,
  )
  const align = parseCanvasRichTextParagraphAlign(style['text-align'])
  const lineHeight = parseCanvasRichTextLineHeight(style['line-height'])
  const spacingBefore = parseCanvasRichTextPixelLength(style['margin-top'])
  const spacingAfter = parseCanvasRichTextPixelLength(style['margin-bottom'])

  return {
    ...(align ? { align } : {}),
    ...(lineHeight !== undefined ? { lineHeight } : {}),
    ...(spacingAfter !== undefined ? { spacingAfter } : {}),
    ...(spacingBefore !== undefined ? { spacingBefore } : {}),
  }
}

function parseCanvasRichTextStyleAttribute(value: string | null | undefined) {
  return Object.fromEntries(
    (value ?? '')
      .split(';')
      .map((entry) => entry.split(':'))
      .flatMap(([property, ...valueParts]) => {
        const name = property?.trim().toLowerCase()
        const propertyValue = valueParts.join(':').trim()

        return name && propertyValue ? [[name, propertyValue]] : []
      }),
  ) as Record<string, string>
}

function parseCanvasRichTextParagraphAlign(
  value: string | undefined,
): CanvasRichTextPasteParagraphAlign | undefined {
  const normalized = value?.trim().toLowerCase()

  return normalized === 'left' ||
    normalized === 'center' ||
    normalized === 'right' ||
    normalized === 'justify'
    ? normalized
    : undefined
}

function parseCanvasRichTextFontSize(value: string | undefined) {
  const px = parseCanvasRichTextPixelLength(value)

  if (px !== undefined) {
    return px
  }

  const match = value?.trim().match(/^(\d+(?:\.\d+)?)pt$/i)
  const pt = Number.parseFloat(match?.[1] ?? '')

  return Number.isFinite(pt) && pt > 0
    ? normalizeCanvasRichTextNumber(pt * (4 / 3))
    : undefined
}

function parseCanvasRichTextStrikethrough(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()

  return normalized?.split(/\s+/).includes('line-through') ? true : undefined
}

function parseCanvasRichTextLineHeight(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()

  if (!normalized || normalized === 'normal') {
    return undefined
  }

  const percentMatch = normalized.match(/^(\d+(?:\.\d+)?)%$/)
  const percent = Number.parseFloat(percentMatch?.[1] ?? '')

  if (Number.isFinite(percent) && percent > 0) {
    return normalizeCanvasRichTextNumber(percent / 100)
  }

  const ratio = Number.parseFloat(normalized)

  return Number.isFinite(ratio) &&
    ratio > 0 &&
    /^(\d+(?:\.\d+)?)$/.test(normalized)
    ? normalizeCanvasRichTextNumber(ratio)
    : undefined
}

function parseCanvasRichTextPixelLength(value: string | undefined) {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return undefined
  }

  if (normalized === '0') {
    return 0
  }

  const match = normalized.match(/^(\d+(?:\.\d+)?)px$/)
  const parsed = Number.parseFloat(match?.[1] ?? '')

  return Number.isFinite(parsed) && parsed >= 0
    ? normalizeCanvasRichTextNumber(parsed)
    : undefined
}

function normalizeCanvasRichTextNumber(value: number) {
  return Number.parseFloat(value.toFixed(3))
}
