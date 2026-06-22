import { getCanvasRichTextPasteSourceFromHTML } from './CanvasRichTextPasteHtmlSources'
import {
  getCanvasRichTextPasteSourceFromMarkdownDataTransfer,
} from './CanvasRichTextPasteMarkdownSources'

export {
  CANVAS_RICH_TEXT_PASTE_SUPPORTED_FORMATS,
} from './CanvasRichTextPasteContracts'
export {
  getCanvasRichTextPasteSourceFromHTML,
} from './CanvasRichTextPasteHtmlSources'
export {
  getCanvasRichTextPasteSourceFromMarkdown,
} from './CanvasRichTextPasteMarkdownSources'
export type {
  CanvasRichTextPasteFormat,
  CanvasRichTextPasteHeadingLevel,
  CanvasRichTextPasteListType,
  CanvasRichTextPasteParagraph,
  CanvasRichTextPasteParagraphAlign,
  CanvasRichTextPasteRun,
  CanvasRichTextPasteSource,
} from './CanvasRichTextPasteContracts'

export function getCanvasRichTextPasteSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return dataTransfer
    ? getCanvasRichTextPasteSourceFromHTML(dataTransfer.getData('text/html')) ??
      getCanvasRichTextPasteSourceFromMarkdownDataTransfer(dataTransfer)
    : null
}
