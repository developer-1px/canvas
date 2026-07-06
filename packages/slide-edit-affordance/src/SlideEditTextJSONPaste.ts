export const SLIDE_EDIT_TEXT_JSON_PASTE_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export function parseSlideEditJSONPasteTextValue(text: string): unknown | null {
  for (const candidate of getSlideEditJSONPasteTextCandidates(text)) {
    try {
      return JSON.parse(candidate) as unknown
    } catch {
      // Try the next candidate. Raw text is attempted before fenced blocks.
    }
  }

  return null
}

export function getSlideEditJSONPasteTextCandidates(
  text: string,
): readonly string[] {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return []
  }

  const candidates = [trimmedText]
  const fencedJSONPattern = /```\s*(?:json)?\s*([\s\S]*?)```/gi

  for (const match of trimmedText.matchAll(fencedJSONPattern)) {
    const candidate = match[1]?.trim()

    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate)
    }
  }

  return candidates
}
