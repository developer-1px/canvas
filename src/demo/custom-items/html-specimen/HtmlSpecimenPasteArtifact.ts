import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'

export type HtmlSpecimenPasteArtifactSource =
  | 'html-style'
  | 'html'
  | 'json'
  | 'markdown-fences'

export type HtmlSpecimenPasteArtifactResult = {
  data: HtmlSpecimenData
  source: HtmlSpecimenPasteArtifactSource
}

export function createHtmlSpecimenDataFromPastedText(
  text: string,
  viewport: {
    height?: number
    width?: number
  } = {},
): HtmlSpecimenPasteArtifactResult | null {
  const trimmed = text.trim()

  if (trimmed.length === 0) {
    return null
  }

  return (
    readJsonArtifact(trimmed, viewport) ??
    readMarkdownFenceArtifact(trimmed, viewport) ??
    readHtmlStyleArtifact(trimmed, viewport) ??
    readHtmlArtifact(trimmed, viewport)
  )
}

function readJsonArtifact(
  text: string,
  viewport: {
    height?: number
    width?: number
  },
): HtmlSpecimenPasteArtifactResult | null {
  try {
    const value: unknown = JSON.parse(text)

    if (
      !isRecord(value) ||
      typeof value.html !== 'string' ||
      typeof value.css !== 'string'
    ) {
      return null
    }

    return createPasteResult({
      css: value.css,
      html: value.html,
      source: 'json',
      viewport,
    })
  } catch {
    return null
  }
}

function readMarkdownFenceArtifact(
  text: string,
  viewport: {
    height?: number
    width?: number
  },
): HtmlSpecimenPasteArtifactResult | null {
  const fences = [...text.matchAll(/```([a-zA-Z]*)\s*\n([\s\S]*?)```/g)]
  const html = fences.find((match) => match[1].toLowerCase() === 'html')?.[2]
  const css = fences.find((match) => match[1].toLowerCase() === 'css')?.[2]

  if (!html) {
    return null
  }

  return createPasteResult({
    css: css ?? '',
    html,
    source: 'markdown-fences',
    viewport,
  })
}

function readHtmlStyleArtifact(
  text: string,
  viewport: {
    height?: number
    width?: number
  },
): HtmlSpecimenPasteArtifactResult | null {
  const styleBlocks = [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]

  if (styleBlocks.length === 0) {
    return null
  }

  const css = styleBlocks.map((match) => match[1].trim()).join('\n\n')
  const htmlWithoutStyle = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  const html = readBodyHtml(htmlWithoutStyle) ?? htmlWithoutStyle

  return createPasteResult({
    css,
    html,
    source: 'html-style',
    viewport,
  })
}

function readHtmlArtifact(
  text: string,
  viewport: {
    height?: number
    width?: number
  },
): HtmlSpecimenPasteArtifactResult | null {
  if (!/<[a-z][\s\S]*>/i.test(text)) {
    return null
  }

  return createPasteResult({
    css: '',
    html: readBodyHtml(text) ?? text,
    source: 'html',
    viewport,
  })
}

function createPasteResult({
  css,
  html,
  source,
  viewport,
}: {
  css: string
  html: string
  source: HtmlSpecimenPasteArtifactSource
  viewport: {
    height?: number
    width?: number
  }
}): HtmlSpecimenPasteArtifactResult | null {
  const normalizedHtml = normalizeHtml(html)

  if (normalizedHtml.length === 0) {
    return null
  }

  return {
    data: {
      css: css.trim(),
      html: normalizedHtml,
      viewportHeight: normalizeViewportSize(viewport.height, 486),
      viewportWidth: normalizeViewportSize(viewport.width, 760),
    },
    source,
  }
}

function readBodyHtml(html: string) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)

  return match?.[1] ?? null
}

function normalizeHtml(html: string) {
  return html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?html\b[^>]*>/gi, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .trim()
}

function normalizeViewportSize(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
