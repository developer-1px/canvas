import {
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
} from '../../affordances/commands/CanvasDataTransferText'

export type CanvasRichTextPasteRun = {
  bold?: boolean
  color?: string
  code?: boolean
  fontSize?: number
  italic?: boolean
  link?: string
  strikethrough?: boolean
  text: string
  underline?: boolean
}

export type CanvasRichTextPasteParagraphAlign =
  | 'center'
  | 'justify'
  | 'left'
  | 'right'
export type CanvasRichTextPasteListType = 'bullet' | 'numbered'
export type CanvasRichTextPasteFormat =
  | 'text-html-rich'
  | 'text-markdown-rich'
export type CanvasRichTextPasteHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type CanvasRichTextPasteParagraph = {
  align?: CanvasRichTextPasteParagraphAlign
  bullet?: CanvasRichTextPasteListType
  headingLevel?: CanvasRichTextPasteHeadingLevel
  lineHeight?: number
  runs: readonly CanvasRichTextPasteRun[]
  spacingAfter?: number
  spacingBefore?: number
}

export type CanvasRichTextPasteSource = {
  format: CanvasRichTextPasteFormat
  paragraphs: readonly CanvasRichTextPasteParagraph[]
  text: string
}

export const CANVAS_RICH_TEXT_PASTE_SUPPORTED_FORMATS = Object.freeze([
  'text/html',
  'text/markdown',
  'text/x-markdown',
  CANVAS_DATA_TRANSFER_TEXT_MIME_TYPE,
] as const)

export const CANVAS_MARKDOWN_RICH_TEXT_DATA_TYPES =
  CANVAS_RICH_TEXT_PASTE_SUPPORTED_FORMATS.filter((type) =>
    type !== 'text/html')

export const CANVAS_RICH_TEXT_LINK_COLOR = '#2563eb'
