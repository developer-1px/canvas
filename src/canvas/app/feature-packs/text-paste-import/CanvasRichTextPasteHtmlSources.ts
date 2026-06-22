import type {
  CanvasRichTextPasteSource,
} from './CanvasRichTextPasteContracts'
import {
  getCanvasRichTextParagraphsFromDOM,
} from './CanvasRichTextPasteHtmlDomSources'
import {
  CANVAS_RICH_TEXT_EXCLUDED_HTML_TAGS,
} from './CanvasRichTextPasteHtmlShared'
import {
  getCanvasRichTextParagraphsFromString,
} from './CanvasRichTextPasteHtmlStringSources'
import {
  hasCanvasRichTextFormatting,
  normalizeCanvasRichTextParagraphs,
} from './CanvasRichTextPasteParagraphs'

export function getCanvasRichTextPasteSourceFromHTML(
  value: string,
): CanvasRichTextPasteSource | null {
  if (!value || CANVAS_RICH_TEXT_EXCLUDED_HTML_TAGS.test(value)) {
    return null
  }

  const paragraphs = normalizeCanvasRichTextParagraphs(
    typeof DOMParser === 'undefined'
      ? getCanvasRichTextParagraphsFromString(value)
      : getCanvasRichTextParagraphsFromDOM(value),
  )
  const text = paragraphs
    .map((paragraph) => paragraph.runs.map((run) => run.text).join(''))
    .join('\n')

  if (!text.trim() || !hasCanvasRichTextFormatting(paragraphs)) {
    return null
  }

  return {
    format: 'text-html-rich',
    paragraphs,
    text,
  }
}
