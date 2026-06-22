import type {
  CanvasImageImportFormat,
  CanvasImageImportSource,
} from './CanvasImageImportContracts'
import {
  getCanvasHTMLAttribute,
  getCanvasHTMLImageSource,
  getCanvasInlineSVGFromHTML,
} from './CanvasImageHtmlSources'

export function getCanvasSVGImageSourceFromHTML(
  value: string,
): CanvasImageImportSource | null {
  const image = getCanvasHTMLImageSource(value, { svgOnly: true })

  if (image) {
    return getCanvasSVGImageSourceFromMarkup(
      image.src,
      'svg-html-img',
      image.alt || image.title || undefined,
    )
  }

  const inlineSvg = getCanvasInlineSVGFromHTML(value)

  return inlineSvg
    ? getCanvasSVGImageSourceFromMarkup(inlineSvg, 'svg-html-inline')
    : null
}

export function getCanvasSVGImageSourceFromMarkup(
  value: string,
  format: CanvasImageImportFormat,
  name?: string,
): CanvasImageImportSource | null {
  const normalized = normalizeCanvasSVGMarkup(
    decodeCanvasSVGDataUrl(value.trim()) ?? value,
  )

  if (!normalized) {
    return null
  }

  return {
    dataUrl: `data:image/svg+xml;charset=utf-8,${
      encodeURIComponent(normalized.markup)
    }`,
    format,
    mimeType: 'image/svg+xml',
    name: getCanvasSVGImportName(name),
    naturalHeight: normalized.naturalHeight,
    naturalWidth: normalized.naturalWidth,
  }
}

function normalizeCanvasSVGMarkup(value: string) {
  if (!value.trim()) {
    return null
  }

  return typeof DOMParser === 'undefined'
    ? normalizeCanvasSVGMarkupString(value)
    : normalizeCanvasSVGMarkupDOM(value)
}

function normalizeCanvasSVGMarkupDOM(value: string) {
  const doc = new DOMParser().parseFromString(value.trim(), 'image/svg+xml')
  const svg = doc.documentElement

  if (
    svg.tagName.toLowerCase() !== 'svg' ||
    doc.querySelector('parsererror')
  ) {
    return null
  }

  svg.querySelectorAll('script, foreignObject').forEach((node) => node.remove())
  removeUnsafeCanvasSVGAttributes(svg)
  svg.querySelectorAll('*').forEach(removeUnsafeCanvasSVGAttributes)

  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  const size = getCanvasSVGNaturalSizeFromElement(svg)

  return {
    markup: new XMLSerializer().serializeToString(svg),
    naturalHeight: size?.h,
    naturalWidth: size?.w,
  }
}

function normalizeCanvasSVGMarkupString(value: string) {
  const svgMatch = /<svg\b[\s\S]*?<\/svg>/i.exec(value.trim())
  const svgMarkup = svgMatch?.[0] ?? ''

  if (!svgMarkup) {
    return null
  }

  const sanitized = svgMarkup
    .replace(/<(script|foreignObject)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|[a-z]+:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s+(href|[a-z]+:href)\s*=\s*javascript:[^\s>]+/gi, '')
  const markup = /<svg\b[^>]*\sxmlns\s*=/i.test(sanitized)
    ? sanitized
    : sanitized.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  const size = getCanvasSVGNaturalSizeFromMarkup(markup)

  return {
    markup,
    naturalHeight: size?.h,
    naturalWidth: size?.w,
  }
}

function removeUnsafeCanvasSVGAttributes(element: Element) {
  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value.trim().toLowerCase()

    if (
      name.startsWith('on') ||
      ((name === 'href' || name.endsWith(':href')) &&
        value.startsWith('javascript:'))
    ) {
      element.removeAttribute(attribute.name)
    }
  })
}

function getCanvasSVGNaturalSizeFromElement(svg: Element) {
  const width = getCanvasSVGLength(svg.getAttribute('width'))
  const height = getCanvasSVGLength(svg.getAttribute('height'))

  if (width && height) {
    return {
      h: height,
      w: width,
    }
  }

  return getCanvasSVGNaturalSizeFromViewBox(svg.getAttribute('viewBox'))
}

function getCanvasSVGNaturalSizeFromMarkup(markup: string) {
  const openTag = /<svg\b([^>]*)>/i.exec(markup)?.[1] ?? ''
  const width = getCanvasSVGLength(getCanvasHTMLAttribute(openTag, 'width'))
  const height = getCanvasSVGLength(getCanvasHTMLAttribute(openTag, 'height'))

  if (width && height) {
    return {
      h: height,
      w: width,
    }
  }

  return getCanvasSVGNaturalSizeFromViewBox(
    getCanvasHTMLAttribute(openTag, 'viewBox'),
  )
}

function getCanvasSVGNaturalSizeFromViewBox(value: string | null) {
  const viewBox = value
    ?.trim()
    .split(/[\s,]+/)
    .map((item) => Number.parseFloat(item))

  if (
    viewBox?.length === 4 &&
    Number.isFinite(viewBox[2]) &&
    Number.isFinite(viewBox[3]) &&
    viewBox[2] > 0 &&
    viewBox[3] > 0
  ) {
    return {
      h: viewBox[3],
      w: viewBox[2],
    }
  }

  return null
}

function getCanvasSVGLength(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function decodeCanvasSVGDataUrl(value: string) {
  const match = value.match(/^data:image\/svg\+xml[^,]*,(.*)$/i)

  if (!match) {
    return null
  }

  try {
    return value.includes(';base64,')
      ? atob(match[1])
      : decodeURIComponent(match[1])
  } catch {
    return null
  }
}

function getCanvasSVGImportName(value?: string) {
  const name = value?.trim()

  return name ? `${name.replace(/\.[^.]+$/, '')}.svg` : 'clipboard.svg'
}
