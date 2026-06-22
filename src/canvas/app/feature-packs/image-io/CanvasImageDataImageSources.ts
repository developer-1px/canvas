import type {
  CanvasImageImportSource,
} from './CanvasImageImportContracts'
import {
  getCanvasDataImageSourceFromDataUrl,
  isCanvasSVGDataUrl,
} from './CanvasImageDataUrls'
import {
  getCanvasHTMLImageSource,
  getCanvasHTMLImageSources,
} from './CanvasImageHtmlSources'
import {
  getCanvasSVGImageSourceFromMarkup,
} from './CanvasImageSvgSources'

export function getCanvasDataImageSourceFromHTML(
  value: string,
): CanvasImageImportSource | null {
  const image = getCanvasHTMLImageSource(value)

  if (!image || isCanvasSVGDataUrl(image.src)) {
    return null
  }

  return getCanvasDataImageSourceFromDataUrl(
    image.src,
    'data-url-html-img',
    image.alt || image.title || undefined,
  )
}

export function getCanvasHTMLDataImageSourcesFromHTML(
  value: string,
): readonly CanvasImageImportSource[] {
  const seenDataUrls = new Set<string>()
  const sources: CanvasImageImportSource[] = []

  for (const image of getCanvasHTMLImageSources(value)) {
    const source = isCanvasSVGDataUrl(image.src)
      ? getCanvasSVGImageSourceFromMarkup(
          image.src,
          'svg-html-img',
          image.alt || image.title || undefined,
        )
      : getCanvasDataImageSourceFromDataUrl(
          image.src,
          'data-url-html-img',
          image.alt || image.title || undefined,
        )

    if (!source || seenDataUrls.has(source.dataUrl)) {
      continue
    }

    seenDataUrls.add(source.dataUrl)
    sources.push(source)
  }

  return sources
}
