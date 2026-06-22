import {
  CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS,
} from './CanvasImageImportContracts'
import type {
  CanvasImageImportSource,
} from './CanvasImageImportContracts'
import {
  getCanvasDataImageSourceFromDataUrl,
} from './CanvasImageDataUrls'
import {
  getCanvasDataImageSourceFromHTML,
  getCanvasHTMLDataImageSourcesFromHTML,
} from './CanvasImageDataImageSources'
import {
  getCanvasSVGImageSourceFromHTML,
  getCanvasSVGImageSourceFromMarkup,
} from './CanvasImageSvgSources'

const CANVAS_IMAGE_SOURCE_SVG_MIME_TYPE =
  CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS[0]
const CANVAS_IMAGE_SOURCE_HTML_MIME_TYPE =
  CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS[1]
const CANVAS_IMAGE_SOURCE_TEXT_MIME_TYPE =
  CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS[2]

export function getCanvasSVGImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  if (!dataTransfer) {
    return null
  }

  const svgMimeSource = getCanvasSVGImageSourceFromMarkup(
    dataTransfer.getData(CANVAS_IMAGE_SOURCE_SVG_MIME_TYPE),
    'svg-mime',
  )

  if (svgMimeSource) {
    return svgMimeSource
  }

  const htmlSource = getCanvasSVGImageSourceFromHTML(
    dataTransfer.getData(CANVAS_IMAGE_SOURCE_HTML_MIME_TYPE),
  )

  if (htmlSource) {
    return htmlSource
  }

  return getCanvasSVGImageSourceFromMarkup(
    dataTransfer.getData(CANVAS_IMAGE_SOURCE_TEXT_MIME_TYPE),
    'svg-plain',
  )
}

export function getCanvasDataImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  if (!dataTransfer) {
    return null
  }

  return getCanvasDataImageSourceFromHTML(
    dataTransfer.getData(CANVAS_IMAGE_SOURCE_HTML_MIME_TYPE),
  ) ??
    getCanvasDataImageSourceFromDataUrl(
      dataTransfer.getData(CANVAS_IMAGE_SOURCE_TEXT_MIME_TYPE),
      'data-url-plain',
    )
}

export function getCanvasHTMLDataImageSourcesFromDataTransfer(
  dataTransfer: DataTransfer | null,
): readonly CanvasImageImportSource[] {
  if (!dataTransfer) {
    return []
  }

  return getCanvasHTMLDataImageSourcesFromHTML(
    dataTransfer.getData(CANVAS_IMAGE_SOURCE_HTML_MIME_TYPE),
  )
}

export function getCanvasImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  return getCanvasSVGImageSourceFromDataTransfer(dataTransfer) ??
    getCanvasDataImageSourceFromDataTransfer(dataTransfer)
}
