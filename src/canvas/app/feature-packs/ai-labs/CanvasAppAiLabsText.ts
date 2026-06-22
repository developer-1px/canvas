export function summarizeCanvasAppAiLabsText(values: readonly string[]) {
  const text = normalizeCanvasAppAiLabsTextValues(values)
  const head = text.slice(0, 3)
  const remaining = Math.max(0, text.length - head.length)

  if (remaining === 0) {
    return head.join('\n')
  }

  return `${head.join('\n')}\n+${remaining} more`
}

export function normalizeCanvasAppAiLabsTextValues(
  values: readonly (string | undefined)[],
) {
  return values
    .map((value) => normalizeCanvasAppAiLabsText(value ?? ''))
    .filter((value) => value.length > 0)
}

export function normalizeCanvasAppAiLabsOutputText(value: string) {
  return value
    .split('\n')
    .map((line) => normalizeCanvasAppAiLabsText(line))
    .filter((line) => line.length > 0)
    .join('\n')
}

function normalizeCanvasAppAiLabsText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}
