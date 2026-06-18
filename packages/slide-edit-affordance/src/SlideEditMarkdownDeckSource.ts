export type SlideEditMarkdownDeckSourceDataTransfer = Pick<
  DataTransfer,
  'getData'
>

export type SlideEditMarkdownDeckSourceMode = 'heading' | 'separator'

export type SlideEditMarkdownSlideBlock =
  | SlideEditMarkdownSlideListBlock
  | SlideEditMarkdownSlideParagraphBlock

export type SlideEditMarkdownSlideParagraphBlock = {
  kind: 'paragraph'
  markdown: string
  text: string
}

export type SlideEditMarkdownSlideListKind = 'bullet-list' | 'ordered-list'

export type SlideEditMarkdownSlideListItem = {
  level: number
  marker: string
  text: string
}

export type SlideEditMarkdownSlideListBlock = {
  items: readonly SlideEditMarkdownSlideListItem[]
  kind: SlideEditMarkdownSlideListKind
  markdown: string
}

export type SlideEditMarkdownSlideSource = {
  body: readonly SlideEditMarkdownSlideBlock[]
  index: number
  notes: readonly SlideEditMarkdownSlideBlock[]
  rawMarkdown: string
  title: string
}

export type SlideEditMarkdownDeckSource = {
  deckTitle: string | null
  format: 'markdown'
  hasSpeakerNotes: boolean
  mode: SlideEditMarkdownDeckSourceMode
  payloadLength: number
  slideCount: number
  slides: readonly SlideEditMarkdownSlideSource[]
  sourceType: string
  surface: 'markdown-deck-source'
}

export type SlideEditMarkdownDeckSourceInput = {
  markdown: string
  sourceType?: string
}

export type SlideEditMarkdownDeckSourceDataTransferInput = {
  dataTransfer: SlideEditMarkdownDeckSourceDataTransfer | null
  markdownMimeTypes?: readonly string[]
}

type MarkdownHeadingLine = {
  level: number
  text: string
}

type SlideSegment = {
  lines: readonly string[]
  title: string
}

export const SLIDE_EDIT_MARKDOWN_DECK_SOURCE_MIME_TYPES = Object.freeze([
  'text/markdown',
  'text/x-markdown',
  'text/plain',
] as const)

export function getSlideEditMarkdownDeckSourceFromDataTransfer({
  dataTransfer,
  markdownMimeTypes = SLIDE_EDIT_MARKDOWN_DECK_SOURCE_MIME_TYPES,
}: SlideEditMarkdownDeckSourceDataTransferInput):
  SlideEditMarkdownDeckSource | null {
  if (!dataTransfer) {
    return null
  }

  for (const sourceType of markdownMimeTypes) {
    const markdown = dataTransfer.getData(sourceType)

    if (!markdown.trim()) {
      continue
    }

    const deckSource = getSlideEditMarkdownDeckSource({
      markdown,
      sourceType,
    })

    if (deckSource !== null) {
      return deckSource
    }
  }

  return null
}

export function getSlideEditMarkdownDeckSource({
  markdown,
  sourceType = 'text/plain',
}: SlideEditMarkdownDeckSourceInput): SlideEditMarkdownDeckSource | null {
  const normalizedMarkdown = normalizeMarkdownLineEndings(markdown).trim()

  if (!normalizedMarkdown || isStandaloneMarkdownTable(normalizedMarkdown)) {
    return null
  }

  return getHeadingMarkdownDeckSource({
    markdown: normalizedMarkdown,
    payloadLength: markdown.length,
    sourceType,
  }) ?? getSeparatorMarkdownDeckSource({
    markdown: normalizedMarkdown,
    payloadLength: markdown.length,
    sourceType,
  })
}

function getHeadingMarkdownDeckSource({
  markdown,
  payloadLength,
  sourceType,
}: {
  markdown: string
  payloadLength: number
  sourceType: string
}): SlideEditMarkdownDeckSource | null {
  const lines = markdown.split('\n')
  const firstContentIndex = lines.findIndex((line) => line.trim() !== '')

  if (firstContentIndex < 0) {
    return null
  }

  const deckHeading = getMarkdownHeadingLine(lines[firstContentIndex])

  if (!deckHeading || deckHeading.level !== 1) {
    return null
  }

  const slideHeadingIndexes = lines
    .map((line, index) => ({
      heading: getMarkdownHeadingLine(line),
      index,
    }))
    .filter(({ heading, index }) =>
      index > firstContentIndex && heading?.level === 2
    )

  if (slideHeadingIndexes.length < 2) {
    return null
  }

  const slides = slideHeadingIndexes.flatMap(({ heading, index }, slideIndex) => {
    if (!heading) {
      return []
    }

    const nextHeadingIndex = slideHeadingIndexes[slideIndex + 1]?.index ??
      lines.length
    const bodyLines = trimBlankMarkdownLines(
      lines.slice(index + 1, nextHeadingIndex),
    )

    return [
      createMarkdownSlideSource({
        index: slideIndex,
        lines: bodyLines,
        title: heading.text,
      }),
    ]
  })

  if (slides.length < 2) {
    return null
  }

  return createMarkdownDeckSource({
    deckTitle: deckHeading.text,
    mode: 'heading',
    payloadLength,
    slides,
    sourceType,
  })
}

function getSeparatorMarkdownDeckSource({
  markdown,
  payloadLength,
  sourceType,
}: {
  markdown: string
  payloadLength: number
  sourceType: string
}): SlideEditMarkdownDeckSource | null {
  const segments = getMarkdownSeparatorSegments(markdown)

  if (segments.length < 2) {
    return null
  }

  const slides = segments.map((segment, index) =>
    createMarkdownSlideSource({
      index,
      lines: segment.lines,
      title: segment.title,
    })
  )

  return createMarkdownDeckSource({
    deckTitle: null,
    mode: 'separator',
    payloadLength,
    slides,
    sourceType,
  })
}

function createMarkdownDeckSource({
  deckTitle,
  mode,
  payloadLength,
  slides,
  sourceType,
}: {
  deckTitle: string | null
  mode: SlideEditMarkdownDeckSourceMode
  payloadLength: number
  slides: readonly SlideEditMarkdownSlideSource[]
  sourceType: string
}): SlideEditMarkdownDeckSource {
  return {
    deckTitle,
    format: 'markdown',
    hasSpeakerNotes: slides.some((slide) => slide.notes.length > 0),
    mode,
    payloadLength,
    slideCount: slides.length,
    slides,
    sourceType,
    surface: 'markdown-deck-source',
  }
}

function createMarkdownSlideSource({
  index,
  lines,
  title,
}: {
  index: number
  lines: readonly string[]
  title: string
}): SlideEditMarkdownSlideSource {
  const { bodyLines, notesLines } = splitMarkdownSlideNotes(lines)

  return {
    body: getMarkdownSlideBlocks(bodyLines),
    index,
    notes: getMarkdownSlideBlocks(notesLines),
    rawMarkdown: trimBlankMarkdownLines(lines).join('\n'),
    title: normalizeMarkdownInlineText(title) || `Slide ${index + 1}`,
  }
}

function getMarkdownSeparatorSegments(markdown: string): SlideSegment[] {
  const lines = markdown.split('\n')
  const rawSegments: string[][] = [[]]

  for (const line of lines) {
    if (isMarkdownThematicBreak(line)) {
      rawSegments.push([])
      continue
    }

    rawSegments[rawSegments.length - 1]?.push(line)
  }

  return rawSegments.flatMap((segment, index) => {
    const lines = trimBlankMarkdownLines(segment)

    if (lines.length === 0) {
      return []
    }

    return [getMarkdownSeparatorSegment(lines, index)]
  })
}

function getMarkdownSeparatorSegment(
  lines: readonly string[],
  index: number,
): SlideSegment {
  const firstLine = lines[0] ?? ''
  const heading = getMarkdownHeadingLine(firstLine)

  if (heading) {
    return {
      lines: trimBlankMarkdownLines(lines.slice(1)),
      title: heading.text || `Slide ${index + 1}`,
    }
  }

  if (isMarkdownListItemLine(firstLine) || getMarkdownNotesMarker(firstLine)) {
    return {
      lines,
      title: `Slide ${index + 1}`,
    }
  }

  return {
    lines: trimBlankMarkdownLines(lines.slice(1)),
    title: normalizeMarkdownInlineText(firstLine) || `Slide ${index + 1}`,
  }
}

function splitMarkdownSlideNotes(lines: readonly string[]): {
  bodyLines: readonly string[]
  notesLines: readonly string[]
} {
  const bodyLines: string[] = []
  const notesLines: string[] = []
  let isReadingNotes = false

  for (const line of lines) {
    const notesMarker = getMarkdownNotesMarker(line)

    if (notesMarker) {
      isReadingNotes = true

      if (notesMarker.text) {
        notesLines.push(notesMarker.text)
      }

      continue
    }

    if (isReadingNotes) {
      notesLines.push(line)
      continue
    }

    bodyLines.push(line)
  }

  return {
    bodyLines: trimBlankMarkdownLines(bodyLines),
    notesLines: trimBlankMarkdownLines(notesLines),
  }
}

function getMarkdownSlideBlocks(
  lines: readonly string[],
): SlideEditMarkdownSlideBlock[] {
  const blocks: SlideEditMarkdownSlideBlock[] = []
  let paragraphLines: string[] = []
  let listItems: SlideEditMarkdownSlideListItem[] = []
  let listKind: SlideEditMarkdownSlideListKind | null = null
  let listMarkdownLines: string[] = []

  const flushParagraph = () => {
    const normalizedParagraphLines = trimBlankMarkdownLines(paragraphLines)

    if (normalizedParagraphLines.length > 0) {
      blocks.push({
        kind: 'paragraph',
        markdown: normalizedParagraphLines.join('\n'),
        text: normalizeMarkdownInlineText(normalizedParagraphLines.join(' ')),
      })
    }

    paragraphLines = []
  }

  const flushList = () => {
    if (listKind && listItems.length > 0) {
      blocks.push({
        items: listItems,
        kind: listKind,
        markdown: listMarkdownLines.join('\n'),
      })
    }

    listItems = []
    listKind = null
    listMarkdownLines = []
  }

  for (const line of lines) {
    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    const listItem = getMarkdownListItem(line)

    if (listItem) {
      flushParagraph()

      if (listKind !== null && listKind !== listItem.kind) {
        flushList()
      }

      listKind = listItem.kind
      listItems.push(listItem.item)
      listMarkdownLines.push(line)
      continue
    }

    flushList()
    paragraphLines.push(line.trim())
  }

  flushParagraph()
  flushList()

  return blocks
}

function getMarkdownListItem(line: string): {
  item: SlideEditMarkdownSlideListItem
  kind: SlideEditMarkdownSlideListKind
} | null {
  const bulletMatch = line.match(/^(\s*)([-*+])\s+(.+)$/)

  if (bulletMatch) {
    return {
      item: {
        level: getMarkdownListLevel(bulletMatch[1] ?? ''),
        marker: bulletMatch[2] ?? '-',
        text: normalizeMarkdownInlineText(bulletMatch[3] ?? ''),
      },
      kind: 'bullet-list',
    }
  }

  const orderedMatch = line.match(/^(\s*)(\d+[.)])\s+(.+)$/)

  if (orderedMatch) {
    return {
      item: {
        level: getMarkdownListLevel(orderedMatch[1] ?? ''),
        marker: orderedMatch[2] ?? '1.',
        text: normalizeMarkdownInlineText(orderedMatch[3] ?? ''),
      },
      kind: 'ordered-list',
    }
  }

  return null
}

function getMarkdownListLevel(indent: string): number {
  return Math.floor(indent.replaceAll('\t', '  ').length / 2)
}

function isMarkdownListItemLine(line: string): boolean {
  return getMarkdownListItem(line) !== null
}

function getMarkdownHeadingLine(line: string): MarkdownHeadingLine | null {
  const match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/)

  if (!match) {
    return null
  }

  return {
    level: match[1]?.length ?? 1,
    text: normalizeMarkdownInlineText(match[2] ?? ''),
  }
}

function getMarkdownNotesMarker(line: string): {
  text: string
} | null {
  const inlineMatch = line.match(
    /^\s*(?:speaker\s+notes|presenter\s+notes|notes)\s*:\s+(.+)$/i,
  )

  if (inlineMatch) {
    return {
      text: inlineMatch[1]?.trim() ?? '',
    }
  }

  const markerMatch = line.match(
    /^\s*(?:speaker\s+notes|presenter\s+notes|notes)\s*:?\s*$/i,
  )

  if (!markerMatch) {
    return null
  }

  return {
    text: '',
  }
}

function isStandaloneMarkdownTable(markdown: string): boolean {
  if (hasHeadingDeckShape(markdown) || hasSeparatorDeckShape(markdown)) {
    return false
  }

  const lines = markdown.split('\n')

  return lines.some((line, index) =>
    index > 0 &&
    index < lines.length - 1 &&
    isMarkdownTableRow(lines[index - 1] ?? '') &&
    isMarkdownTableSeparator(line) &&
    isMarkdownTableRow(lines[index + 1] ?? '')
  )
}

function hasHeadingDeckShape(markdown: string): boolean {
  const lines = markdown.split('\n')
  const firstContentIndex = lines.findIndex((line) => line.trim() !== '')

  if (firstContentIndex < 0) {
    return false
  }

  const firstHeading = getMarkdownHeadingLine(lines[firstContentIndex] ?? '')

  if (!firstHeading || firstHeading.level !== 1) {
    return false
  }

  return lines.filter((line) => getMarkdownHeadingLine(line)?.level === 2)
    .length >= 2
}

function hasSeparatorDeckShape(markdown: string): boolean {
  return markdown.split('\n').some(isMarkdownThematicBreak)
}

function isMarkdownTableRow(line: string): boolean {
  const trimmedLine = line.trim()

  return trimmedLine.startsWith('|') &&
    trimmedLine.endsWith('|') &&
    trimmedLine.includes('|', 1)
}

function isMarkdownTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function isMarkdownThematicBreak(line: string): boolean {
  return /^\s{0,3}(?:-{3,}|\*{3,})\s*$/.test(line)
}

function normalizeMarkdownInlineText(value: string): string {
  return value
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMarkdownLineEndings(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

function trimBlankMarkdownLines(lines: readonly string[]): string[] {
  let start = 0
  let end = lines.length

  while (start < end && !lines[start]?.trim()) {
    start += 1
  }

  while (end > start && !lines[end - 1]?.trim()) {
    end -= 1
  }

  return lines.slice(start, end)
}
