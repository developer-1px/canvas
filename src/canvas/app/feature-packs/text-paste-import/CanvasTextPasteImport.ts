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
  code?: boolean
  fontSize?: number
  italic?: boolean
  link?: string
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

export type CanvasPlainTextPasteSource = Readonly<{
  format: 'text-plain'
  text: string
}>

export type CanvasTextPasteSource =
  | CanvasPlainTextPasteSource
  | CanvasRichTextPasteSource

export type CanvasTextPasteReplaceTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasTextPasteReplaceTargetInput = Readonly<{
  selection: readonly string[]
  source: CanvasTextPasteSource
  text: string
}>

export type CanvasTextPasteReplaceIntent = Readonly<{
  kind: 'text-replace'
  source: CanvasTextPasteSource
  target: CanvasTextPasteReplaceTarget
  text: string
}>

export type CanvasTextPasteReplaceRoute =
  | CanvasTextPasteReplaceFallbackRoute
  | CanvasTextPasteReplaceRoutedRoute

export type CanvasTextPasteReplaceRoutedRoute = Readonly<{
  intent: CanvasTextPasteReplaceIntent
  kind: 'text-replace'
  source: CanvasTextPasteSource
  status: 'routed'
  text: string
}>

export type CanvasTextPasteReplaceFallbackReason =
  | 'disabled'
  | 'empty-source'
  | 'no-target'

export type CanvasTextPasteReplaceFallbackRoute = Readonly<{
  kind: 'text-insert'
  reason: CanvasTextPasteReplaceFallbackReason
  source: CanvasTextPasteSource
  status: 'fallback'
  text: string
}>

export type CanvasTextPasteReplaceRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasTextPasteReplaceTargetInput
  ) => CanvasTextPasteReplaceTarget | null
  selection: readonly string[]
  source: CanvasTextPasteSource
}>

export const CANVAS_TEXT_PASTE_IMPORT_MODEL = 'canvas-text-paste-import'

const CANVAS_TEXT_PASTE_DATA_TYPES = [
  'text/plain',
  'text/html',
] as const
const CANVAS_MARKDOWN_RICH_TEXT_DATA_TYPES = [
  'text/markdown',
  'text/x-markdown',
  'text/plain',
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

export function createCanvasPlainTextPasteSource(
  text: string,
): CanvasPlainTextPasteSource | null {
  const normalizedText = text.trim()

  return normalizedText
    ? Object.freeze({
        format: 'text-plain',
        text: normalizedText,
      })
    : null
}

export function getCanvasTextPasteSourceText(
  source: CanvasTextPasteSource,
): string {
  return source.text
}

export function routeCanvasTextPasteReplace({
  disabled = false,
  getTarget,
  selection,
  source,
}: CanvasTextPasteReplaceRouteInput): CanvasTextPasteReplaceRoute {
  const text = getCanvasTextPasteSourceText(source)

  if (disabled) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'disabled',
      source,
      text,
    })
  }

  if (!text.trim()) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'empty-source',
      source,
      text,
    })
  }

  const target = getTarget({
    selection,
    source,
    text,
  })

  if (!target) {
    return createCanvasTextPasteReplaceFallbackRoute({
      reason: 'no-target',
      source,
      text,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'text-replace',
      source,
      target,
      text,
    }),
    kind: 'text-replace',
    source,
    status: 'routed',
    text,
  })
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

export function getCanvasTextPasteSourceCandidatesFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasTextPasteSource[] {
  if (!dataTransfer) {
    return []
  }

  const sources: CanvasTextPasteSource[] = []
  const richSource = getCanvasRichTextPasteSourceFromDataTransfer(dataTransfer)

  if (richSource) {
    sources.push(richSource)
  }

  const fallbackTexts = richSource
    ? [dataTransfer.getData('text/plain').trim()]
    : getCanvasTextPasteSourcesFromDataTransfer(dataTransfer)

  for (const text of fallbackTexts) {
    const plainSource = createCanvasPlainTextPasteSource(text)

    if (
      plainSource &&
      !sources.some((source) => source.text === plainSource.text)
    ) {
      sources.push(plainSource)
    }
  }

  return sources
}

export function getCanvasRichTextPasteSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return dataTransfer
    ? getCanvasRichTextPasteSourceFromHTML(dataTransfer.getData('text/html')) ??
      getCanvasRichTextPasteSourceFromMarkdownDataTransfer(dataTransfer)
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

export function getCanvasRichTextPasteSourceFromMarkdown(
  value: string,
): CanvasRichTextPasteSource | null {
  const normalizedValue = value.replace(/\r\n?/g, '\n').trim()

  if (
    !normalizedValue ||
    isCanvasPlainURLText(normalizedValue) ||
    isCanvasMarkdownTableText(normalizedValue) ||
    isCanvasMarkdownDeckSourceText(normalizedValue)
  ) {
    return null
  }

  const paragraphs = normalizeCanvasRichTextParagraphs(
    getCanvasRichTextParagraphsFromMarkdown(normalizedValue),
  )
  const text = paragraphs
    .map((paragraph) => paragraph.runs.map((run) => run.text).join(''))
    .join('\n')

  if (!text.trim() || !hasCanvasRichTextFormatting(paragraphs)) {
    return null
  }

  return {
    format: 'text-markdown-rich',
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

function createCanvasTextPasteReplaceFallbackRoute({
  reason,
  source,
  text,
}: {
  reason: CanvasTextPasteReplaceFallbackReason
  source: CanvasTextPasteSource
  text: string
}): CanvasTextPasteReplaceFallbackRoute {
  return Object.freeze({
    kind: 'text-insert',
    reason,
    source,
    status: 'fallback',
    text,
  })
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
  listType?: CanvasRichTextPasteListType,
): CanvasRichTextPasteParagraph[] {
  const tagName = node.tagName.toLowerCase()

  if (tagName === 'br') {
    return []
  }

  const nestedBlocks = Array.from(node.children).filter((child) =>
    isCanvasRichTextBlock(child) && child.tagName.toLowerCase() !== 'br',
  )

  if (nestedBlocks.length > 0 && !['li', 'p'].includes(tagName)) {
    const childListType = getCanvasRichTextListType(tagName) ?? listType

    return nestedBlocks.flatMap((child) =>
      getCanvasRichTextParagraphFromBlock(child, childListType))
  }

  const runs = getCanvasRichTextRunsFromNode(node, {})
  const bullet = tagName === 'li' ? listType ?? 'bullet' : undefined
  const paragraphStyle = getCanvasRichTextParagraphStyleFromElement(node)

  return runs.length > 0
    ? [{
        ...paragraphStyle,
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
    ...getCanvasRichTextRunStyleFromElement(node),
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
  let bullet: CanvasRichTextPasteListType | undefined
  let paragraphStyle: Partial<CanvasRichTextPasteParagraph> = {}
  let boldDepth = 0
  let italicDepth = 0
  let underlineDepth = 0
  const linkStack: string[] = []
  const listStack: CanvasRichTextPasteListType[] = []
  const runStyleStack: Array<{
    style: Partial<CanvasRichTextPasteRun>
    tagName: string
  }> = []

  const flushParagraph = () => {
    if (runs.length > 0) {
      paragraphs.push({
        ...paragraphStyle,
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
          ...mergeCanvasRichTextRunStyles(runStyleStack.map((item) =>
            item.style)),
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
      } else if (tag.name === 'ul' || tag.name === 'ol') {
        flushParagraph()
        listStack.pop()
      } else if (isCanvasRichTextBlockName(tag.name)) {
        flushParagraph()
        paragraphStyle = {}
        if (tag.name === 'li') {
          bullet = undefined
        }
      }
      popCanvasRichTextRunStyle(runStyleStack, tag.name)
      continue
    }

    const runStyle = getCanvasRichTextRunStyleFromAttributes(tag.attributes)

    runStyleStack.push({
      style: runStyle,
      tagName: tag.name,
    })

    if (tag.name === 'br') {
      flushParagraph()
    } else if (tag.name === 'ul' || tag.name === 'ol') {
      flushParagraph()
      listStack.push(getCanvasRichTextListType(tag.name) ?? 'bullet')
    } else if (tag.name === 'li') {
      flushParagraph()
      bullet = listStack.at(-1) ?? 'bullet'
      paragraphStyle = getCanvasRichTextParagraphStyleFromAttributes(
        tag.attributes,
      )
    } else if (isCanvasRichTextBlockName(tag.name)) {
      flushParagraph()
      paragraphStyle = getCanvasRichTextParagraphStyleFromAttributes(
        tag.attributes,
      )
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

    if (tag.selfClosing) {
      popCanvasRichTextRunStyle(runStyleStack, tag.name)
    }
  }

  flushParagraph()

  return paragraphs
}

function getCanvasRichTextPasteSourceFromMarkdownDataTransfer(
  dataTransfer: DataTransfer,
): CanvasRichTextPasteSource | null {
  for (const type of CANVAS_MARKDOWN_RICH_TEXT_DATA_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const source = getCanvasRichTextPasteSourceFromMarkdown(text)

    if (source) {
      return source
    }
  }

  return null
}

function getCanvasRichTextParagraphsFromMarkdown(
  value: string,
): CanvasRichTextPasteParagraph[] {
  const paragraphs: CanvasRichTextPasteParagraph[] = []
  let paragraphLines: string[] = []

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').replace(/\s+/g, ' ').trim()

    if (text) {
      paragraphs.push({
        runs: getCanvasRichTextRunsFromMarkdownInline(text),
      })
    }

    paragraphLines = []
  }

  for (const line of value.split('\n')) {
    if (!line.trim()) {
      flushParagraph()
      continue
    }

    const heading = getCanvasMarkdownHeading(line)

    if (heading) {
      flushParagraph()
      paragraphs.push({
        headingLevel: heading.level,
        runs: getCanvasRichTextRunsFromMarkdownInline(heading.text),
      })
      continue
    }

    const listItem = getCanvasMarkdownListItem(line)

    if (listItem) {
      flushParagraph()
      paragraphs.push({
        bullet: listItem.listType,
        runs: getCanvasRichTextRunsFromMarkdownInline(listItem.text),
      })
      continue
    }

    if (isCanvasMarkdownThematicBreak(line)) {
      flushParagraph()
      continue
    }

    paragraphLines.push(line.trim())
  }

  flushParagraph()

  return paragraphs
}

function getCanvasRichTextRunsFromMarkdownInline(
  value: string,
): CanvasRichTextPasteRun[] {
  const runs: CanvasRichTextPasteRun[] = []
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_|`([^`\n]+)`)/g
  let currentIndex = 0

  for (const match of value.matchAll(pattern)) {
    const matchIndex = match.index ?? 0

    if (matchIndex > currentIndex) {
      runs.push({
        text: value.slice(currentIndex, matchIndex),
      })
    }

    const linkText = match[2]
    const link = match[3]
    const boldText = match[4] ?? match[5]
    const italicText = match[6] ?? match[7]
    const codeText = match[8]

    if (linkText && link) {
      runs.push({
        color: CANVAS_RICH_TEXT_LINK_COLOR,
        link,
        text: linkText,
        underline: true,
      })
    } else if (boldText) {
      runs.push({
        bold: true,
        text: boldText,
      })
    } else if (italicText) {
      runs.push({
        italic: true,
        text: italicText,
      })
    } else if (codeText) {
      runs.push({
        code: true,
        text: codeText,
      })
    }

    currentIndex = matchIndex + match[0].length
  }

  if (currentIndex < value.length) {
    runs.push({
      text: value.slice(currentIndex),
    })
  }

  return runs.filter((run) => run.text.length > 0)
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
              ...getCanvasRichTextParagraphMetadata(paragraph),
              runs,
            })
          }
          runs = []
        }

        if (chunk.length > 0) {
          runs.push({
            ...run,
            text: chunk,
          })
        }
      })
    }

    if (runs.length > 0) {
      splitParagraphs.push({
        ...getCanvasRichTextParagraphMetadata(paragraph),
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
    Boolean(paragraph.bullet) ||
    paragraph.align !== undefined ||
    paragraph.headingLevel !== undefined ||
    paragraph.lineHeight !== undefined ||
    paragraph.spacingAfter !== undefined ||
    paragraph.spacingBefore !== undefined ||
    paragraph.runs.some((run) =>
      run.bold === true ||
      run.code === true ||
      run.fontSize !== undefined ||
      run.italic === true ||
      run.underline === true ||
      Boolean(run.color) ||
      Boolean(run.link)))
}

function getCanvasRichTextParagraphMetadata(
  paragraph: CanvasRichTextPasteParagraph,
): Omit<CanvasRichTextPasteParagraph, 'runs'> {
  return {
    ...(paragraph.align ? { align: paragraph.align } : {}),
    ...(paragraph.bullet ? { bullet: paragraph.bullet } : {}),
    ...(paragraph.headingLevel ? { headingLevel: paragraph.headingLevel } : {}),
    ...(paragraph.lineHeight !== undefined
      ? { lineHeight: paragraph.lineHeight }
      : {}),
    ...(paragraph.spacingAfter !== undefined
      ? { spacingAfter: paragraph.spacingAfter }
      : {}),
    ...(paragraph.spacingBefore !== undefined
      ? { spacingBefore: paragraph.spacingBefore }
      : {}),
  }
}

function getCanvasRichTextRunStyleFromElement(
  element: Element,
): Partial<CanvasRichTextPasteRun> {
  return getCanvasRichTextRunStyleFromAttributes(
    element.getAttribute('style') ?? '',
  )
}

function getCanvasRichTextRunStyleFromAttributes(
  attributes: string,
): Partial<CanvasRichTextPasteRun> {
  const style = parseCanvasRichTextStyleAttribute(
    getCanvasHTMLAttribute(attributes, 'style') ?? attributes,
  )
  const fontSize = parseCanvasRichTextFontSize(style['font-size'])

  return {
    ...(fontSize !== undefined ? { fontSize } : {}),
  }
}

function getCanvasRichTextParagraphStyleFromElement(
  element: Element,
): Partial<CanvasRichTextPasteParagraph> {
  return getCanvasRichTextParagraphStyleFromAttributes(
    element.getAttribute('style') ?? '',
  )
}

function getCanvasRichTextParagraphStyleFromAttributes(
  attributes: string,
): Partial<CanvasRichTextPasteParagraph> {
  const style = parseCanvasRichTextStyleAttribute(
    getCanvasHTMLAttribute(attributes, 'style') ?? attributes,
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

function mergeCanvasRichTextRunStyles(
  styles: readonly Partial<CanvasRichTextPasteRun>[],
) {
  return styles.reduce<Partial<CanvasRichTextPasteRun>>(
    (merged, style) => ({
      ...merged,
      ...style,
    }),
    {},
  )
}

function popCanvasRichTextRunStyle(
  stack: Array<{ style: Partial<CanvasRichTextPasteRun>; tagName: string }>,
  tagName: string,
) {
  let index = -1

  for (let candidate = stack.length - 1; candidate >= 0; candidate -= 1) {
    if (stack[candidate]?.tagName === tagName) {
      index = candidate
      break
    }
  }

  if (index >= 0) {
    stack.splice(index, 1)
  }
}

function isCanvasRichTextBlock(node: Element) {
  return isCanvasRichTextBlockName(node.tagName.toLowerCase())
}

function isCanvasRichTextBlockName(value: string) {
  return CANVAS_RICH_TEXT_BLOCK_TAGS.has(value)
}

function getCanvasRichTextListType(
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

function getCanvasMarkdownHeading(line: string): {
  level: CanvasRichTextPasteHeadingLevel
  text: string
} | null {
  const match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/)

  if (!match) {
    return null
  }

  return {
    level: match[1]?.length as CanvasRichTextPasteHeadingLevel,
    text: match[2]?.trim() ?? '',
  }
}

function getCanvasMarkdownListItem(line: string): {
  listType: CanvasRichTextPasteListType
  text: string
} | null {
  const bulletMatch = line.match(/^\s{0,6}[-*+]\s+(.+)$/)

  if (bulletMatch) {
    return {
      listType: 'bullet',
      text: bulletMatch[1]?.trim() ?? '',
    }
  }

  const numberedMatch = line.match(/^\s{0,6}\d+[.)]\s+(.+)$/)

  if (numberedMatch) {
    return {
      listType: 'numbered',
      text: numberedMatch[1]?.trim() ?? '',
    }
  }

  return null
}

function isCanvasPlainURLText(value: string) {
  return /^(https?:\/\/|mailto:)[^\s<>()]+$/i.test(value.trim())
}

function isCanvasMarkdownTableText(value: string) {
  const lines = value.split('\n')

  return lines.some((line, index) =>
    index > 0 &&
    index < lines.length - 1 &&
    isCanvasMarkdownTableRow(lines[index - 1] ?? '') &&
    isCanvasMarkdownTableSeparator(line) &&
    isCanvasMarkdownTableRow(lines[index + 1] ?? '')
  )
}

function isCanvasMarkdownTableRow(line: string) {
  const trimmedLine = line.trim()

  return trimmedLine.startsWith('|') &&
    trimmedLine.endsWith('|') &&
    trimmedLine.includes('|', 1)
}

function isCanvasMarkdownTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function isCanvasMarkdownDeckSourceText(value: string) {
  const lines = value.split('\n')
  const firstContentIndex = lines.findIndex((line) => line.trim() !== '')
  const firstHeading = firstContentIndex >= 0
    ? getCanvasMarkdownHeading(lines[firstContentIndex] ?? '')
    : null

  return (
    Boolean(firstHeading && firstHeading.level === 1) &&
    lines.filter((line) => getCanvasMarkdownHeading(line)?.level === 2)
      .length >= 2
  ) || getCanvasMarkdownSeparatorSegmentCount(lines) >= 2
}

function getCanvasMarkdownSeparatorSegmentCount(lines: readonly string[]) {
  let count = 0
  let hasContent = false

  for (const line of lines) {
    if (isCanvasMarkdownThematicBreak(line)) {
      if (hasContent) {
        count += 1
        hasContent = false
      }
      continue
    }

    if (line.trim()) {
      hasContent = true
    }
  }

  return hasContent ? count + 1 : count
}

function isCanvasMarkdownThematicBreak(line: string) {
  return /^\s{0,3}(?:-{3,}|\*{3,})\s*$/.test(line)
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
