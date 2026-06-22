import {
  CANVAS_MARKDOWN_RICH_TEXT_DATA_TYPES,
  CANVAS_RICH_TEXT_LINK_COLOR,
  type CanvasRichTextPasteHeadingLevel,
  type CanvasRichTextPasteListType,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
  type CanvasRichTextPasteSource,
} from './CanvasRichTextPasteContracts'
import {
  hasCanvasRichTextFormatting,
  normalizeCanvasRichTextParagraphs,
} from './CanvasRichTextPasteParagraphs'

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

export function getCanvasRichTextPasteSourceFromMarkdownDataTransfer(
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
