import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasTextPasteImporter } from './CanvasTextPasteImporters'

export type CanvasTextPasteInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasTextPasteInsertPositionInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasTextPasteImportResult = {
  importerId: string
  items: CanvasItem[]
}

export type CanvasRichTextPasteRun = {
  bold?: boolean
  color?: string
  italic?: boolean
  link?: string
  text: string
  underline?: boolean
}

export type CanvasRichTextPasteParagraph = {
  bullet?: 'bullet'
  runs: readonly CanvasRichTextPasteRun[]
}

export type CanvasRichTextPasteSource = {
  format: 'text-html-rich'
  paragraphs: readonly CanvasRichTextPasteParagraph[]
  text: string
}

const CANVAS_TEXT_PASTE_DATA_TYPES = [
  'text/plain',
  'text/html',
] as const
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
const CANVAS_RICH_TEXT_EXCLUDED_TAGS =
  /<(table|img|svg|video|audio|iframe)\b/i
const CANVAS_RICH_TEXT_LINK_COLOR = '#2563eb'

export function insertCanvasTextPasteSource({
  context,
  importers,
  position,
  text,
  viewport,
}: {
  context: CanvasTextPasteInsertionContext
  importers: readonly CanvasTextPasteImporter[]
  position: Point
  text: string
  viewport: Viewport
}) {
  const result = createCanvasTextPasteItems({
    createId: context.createId,
    importers,
    position,
    text,
    viewport,
  })

  if (!result) {
    return false
  }

  return context.commitItemsChange(
    { type: 'add', items: result.items },
    {
      after: result.items.map((item) => item.id),
      before: context.selection,
    },
  )
}

export function createCanvasTextPasteItems({
  createId,
  importers,
  position,
  text,
  viewport,
}: {
  createId: (prefix: string) => string
  importers: readonly CanvasTextPasteImporter[]
  position: Point
  text: string
  viewport: Viewport
}): CanvasTextPasteImportResult | null {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return null
  }

  for (const importer of importers) {
    let items: CanvasItem[] | null

    try {
      items = importer.createItems({
        createId,
        position,
        text: trimmedText,
        viewport,
      })
    } catch {
      items = null
    }

    if (items && items.length > 0) {
      return {
        importerId: importer.id,
        items,
      }
    }
  }

  return null
}

export function getCanvasTextPasteSourcesFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return []
  }

  const sources: string[] = []

  for (const type of CANVAS_TEXT_PASTE_DATA_TYPES) {
    const text = dataTransfer.getData(type).trim()

    if (text && !sources.includes(text)) {
      sources.push(text)
    }
  }

  return sources
}

export function getCanvasRichTextPasteSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return dataTransfer
    ? getCanvasRichTextPasteSourceFromHTML(dataTransfer.getData('text/html'))
    : null
}

export function getCanvasRichTextPasteSourceFromHTML(
  value: string,
): CanvasRichTextPasteSource | null {
  if (!value || CANVAS_RICH_TEXT_EXCLUDED_TAGS.test(value)) {
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

export function getCanvasTextPasteInsertPosition({
  event,
  stageElement,
  viewport,
}: CanvasTextPasteInsertPositionInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return getCanvasViewportWorldPoint(viewport, point)
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}

function getCanvasRichTextParagraphsFromDOM(value: string) {
  const doc = new DOMParser().parseFromString(value, 'text/html')

  doc.body.querySelectorAll('script, style, noscript')
    .forEach((node) => node.remove())

  return getCanvasRichTextParagraphsFromElement(doc.body)
}

function getCanvasRichTextParagraphsFromElement(root: Element) {
  const blockNodes = Array.from(root.children).filter(isCanvasRichTextBlock)

  if (blockNodes.length === 0) {
    const runs = getCanvasRichTextRunsFromNode(root, {})

    return runs.length > 0 ? [{ runs }] : []
  }

  return blockNodes.flatMap((node) =>
    getCanvasRichTextParagraphFromBlock(node))
}

function getCanvasRichTextParagraphFromBlock(
  node: Element,
): CanvasRichTextPasteParagraph[] {
  const tagName = node.tagName.toLowerCase()

  if (tagName === 'br') {
    return []
  }

  const nestedBlocks = Array.from(node.children).filter((child) =>
    isCanvasRichTextBlock(child) && child.tagName.toLowerCase() !== 'br',
  )

  if (nestedBlocks.length > 0 && !['li', 'p'].includes(tagName)) {
    return nestedBlocks.flatMap((child) =>
      getCanvasRichTextParagraphFromBlock(child))
  }

  const runs = getCanvasRichTextRunsFromNode(node, {})
  const bullet = tagName === 'li' ? 'bullet' : undefined

  return runs.length > 0
    ? [{
        ...(bullet ? { bullet } : {}),
        runs,
      }]
    : []
}

function getCanvasRichTextRunsFromNode(
  node: Node,
  style: Partial<CanvasRichTextPasteRun>,
): CanvasRichTextPasteRun[] {
  if (node.nodeType === 3) {
    const text = node.textContent?.replace(/\s+/g, ' ') ?? ''

    return text.trim().length > 0
      ? [{
          ...style,
          text,
        }]
      : []
  }

  if (!(node instanceof Element)) {
    return []
  }

  const tagName = node.tagName.toLowerCase()

  if (tagName === 'br') {
    return [{ text: '\n' }]
  }

  const href = tagName === 'a'
    ? normalizeCanvasRichTextHref(node.getAttribute('href'))
    : undefined
  const nextStyle = {
    ...style,
    ...(['b', 'strong'].includes(tagName) ? { bold: true } : {}),
    ...(['em', 'i'].includes(tagName) ? { italic: true } : {}),
    ...(['a', 'u'].includes(tagName) ? { underline: true } : {}),
    ...(href ? { color: CANVAS_RICH_TEXT_LINK_COLOR, link: href } : {}),
  }

  return Array.from(node.childNodes).flatMap((child) =>
    getCanvasRichTextRunsFromNode(child, nextStyle))
}

function getCanvasRichTextParagraphsFromString(value: string) {
  const sanitized = value.replace(
    /<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  )
  const paragraphs: CanvasRichTextPasteParagraph[] = []
  let runs: CanvasRichTextPasteRun[] = []
  let bullet: 'bullet' | undefined
  let boldDepth = 0
  let italicDepth = 0
  let underlineDepth = 0
  const linkStack: string[] = []

  const flushParagraph = () => {
    if (runs.length > 0) {
      paragraphs.push({
        ...(bullet ? { bullet } : {}),
        runs,
      })
      runs = []
    }
  }

  for (const match of sanitized.matchAll(/<[^>]+>|[^<]+/g)) {
    const token = match[0]

    if (!token.startsWith('<')) {
      const text = decodeCanvasRichTextEntities(token).replace(/\s+/g, ' ')

      if (text.trim()) {
        const link = linkStack.at(-1)

        runs.push({
          ...(boldDepth > 0 ? { bold: true } : {}),
          ...(italicDepth > 0 ? { italic: true } : {}),
          ...(underlineDepth > 0 || link ? { underline: true } : {}),
          ...(link ? { color: CANVAS_RICH_TEXT_LINK_COLOR, link } : {}),
          text,
        })
      }
      continue
    }

    const tag = getCanvasHTMLTag(token)

    if (!tag) {
      continue
    }

    if (tag.closing) {
      if (tag.name === 'b' || tag.name === 'strong') {
        boldDepth = Math.max(0, boldDepth - 1)
      } else if (tag.name === 'em' || tag.name === 'i') {
        italicDepth = Math.max(0, italicDepth - 1)
      } else if (tag.name === 'u') {
        underlineDepth = Math.max(0, underlineDepth - 1)
      } else if (tag.name === 'a') {
        linkStack.pop()
      } else if (isCanvasRichTextBlockName(tag.name)) {
        flushParagraph()
        if (tag.name === 'li') {
          bullet = undefined
        }
      }
      continue
    }

    if (tag.name === 'br') {
      flushParagraph()
    } else if (tag.name === 'li') {
      flushParagraph()
      bullet = 'bullet'
    } else if (isCanvasRichTextBlockName(tag.name)) {
      flushParagraph()
    } else if (tag.name === 'b' || tag.name === 'strong') {
      boldDepth += 1
    } else if (tag.name === 'em' || tag.name === 'i') {
      italicDepth += 1
    } else if (tag.name === 'u') {
      underlineDepth += 1
    } else if (tag.name === 'a') {
      const href = normalizeCanvasRichTextHref(
        getCanvasHTMLAttribute(tag.attributes, 'href'),
      )

      linkStack.push(href ?? '')
    }

    if (tag.selfClosing && tag.name === 'a') {
      linkStack.pop()
    }
  }

  flushParagraph()

  return paragraphs
}

function normalizeCanvasRichTextParagraphs(
  paragraphs: readonly CanvasRichTextPasteParagraph[],
) {
  return paragraphs.flatMap((paragraph) => {
    const splitParagraphs: CanvasRichTextPasteParagraph[] = []
    let runs: CanvasRichTextPasteRun[] = []

    for (const run of paragraph.runs) {
      const chunks = run.text.split('\n')

      chunks.forEach((chunk, index) => {
        if (index > 0) {
          if (runs.length > 0) {
            splitParagraphs.push({
              ...(paragraph.bullet ? { bullet: paragraph.bullet } : {}),
              runs,
            })
          }
          runs = []
        }

        if (chunk.trim()) {
          runs.push({
            ...run,
            text: chunk,
          })
        }
      })
    }

    if (runs.length > 0) {
      splitParagraphs.push({
        ...(paragraph.bullet ? { bullet: paragraph.bullet } : {}),
        runs,
      })
    }

    return splitParagraphs
  })
}

function hasCanvasRichTextFormatting(
  paragraphs: readonly CanvasRichTextPasteParagraph[],
) {
  return paragraphs.some((paragraph) =>
    paragraph.bullet === 'bullet' ||
    paragraph.runs.some((run) =>
      run.bold === true ||
      run.italic === true ||
      run.underline === true ||
      Boolean(run.color) ||
      Boolean(run.link)))
}

function isCanvasRichTextBlock(node: Element) {
  return isCanvasRichTextBlockName(node.tagName.toLowerCase())
}

function isCanvasRichTextBlockName(value: string) {
  return CANVAS_RICH_TEXT_BLOCK_TAGS.has(value)
}

function normalizeCanvasRichTextHref(value: string | null) {
  const href = value?.trim()

  return href && !href.toLowerCase().startsWith('javascript:')
    ? href
    : undefined
}

function getCanvasHTMLTag(value: string) {
  const match = /^<\s*(\/)?\s*([a-z0-9-]+)([^>]*)>/i.exec(value)

  return match
    ? {
        attributes: match[3] ?? '',
        closing: Boolean(match[1]),
        name: match[2].toLowerCase(),
        selfClosing: /\/\s*>$/.test(value),
      }
    : null
}

function getCanvasHTMLAttribute(value: string, name: string) {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(value)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null
}

function decodeCanvasRichTextEntities(value: string) {
  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith('#x')) {
      return decodeCanvasRichTextCodePoint(
        Number.parseInt(entity.slice(2), 16),
        match,
      )
    }

    if (entity.startsWith('#')) {
      return decodeCanvasRichTextCodePoint(
        Number.parseInt(entity.slice(1), 10),
        match,
      )
    }

    const namedEntity = CANVAS_RICH_TEXT_ENTITY_TEXT[entity.toLowerCase()]

    return namedEntity ?? match
  })
}

function decodeCanvasRichTextCodePoint(value: number, fallback: string) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  try {
    return String.fromCodePoint(value)
  } catch {
    return fallback
  }
}

const CANVAS_RICH_TEXT_ENTITY_TEXT: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}
