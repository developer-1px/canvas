import type {
  CanvasRichTextPasteListType,
} from './CanvasRichTextPasteContracts'

const CANVAS_RICH_TEXT_BLOCK_TAGS = new Set([
  'article',
  'blockquote',
  'br',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'main',
  'ol',
  'p',
  'section',
  'ul',
])

export const CANVAS_RICH_TEXT_EXCLUDED_HTML_TAGS =
  /<(table|img|svg|video|audio|iframe)\b/i

export function isCanvasRichTextBlock(node: Element) {
  return isCanvasRichTextBlockName(node.tagName.toLowerCase())
}

export function isCanvasRichTextBlockName(value: string) {
  return CANVAS_RICH_TEXT_BLOCK_TAGS.has(value)
}

export function getCanvasRichTextListType(
  tagName: string,
): CanvasRichTextPasteListType | null {
  if (tagName === 'ol') {
    return 'numbered'
  }

  if (tagName === 'ul') {
    return 'bullet'
  }

  return null
}

export function normalizeCanvasRichTextHref(value: string | null) {
  const href = value?.trim()

  return href && !href.toLowerCase().startsWith('javascript:')
    ? href
    : undefined
}
