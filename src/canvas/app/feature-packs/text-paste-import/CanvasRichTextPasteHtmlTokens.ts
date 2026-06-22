export type CanvasRichTextHTMLTag = Readonly<{
  attributes: string
  closing: boolean
  name: string
  selfClosing: boolean
}>

export function getCanvasRichTextHTMLTag(
  value: string,
): CanvasRichTextHTMLTag | null {
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

export function getCanvasRichTextHTMLAttribute(value: string, name: string) {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(value)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null
}

export function decodeCanvasRichTextEntities(value: string) {
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
