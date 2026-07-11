export type FigJamClipboardTable = {
  readonly columns: readonly string[]
  readonly rows: readonly (readonly string[])[]
}

export function parseFigJamClipboardTable({
  html,
  plainText,
}: {
  readonly html?: string
  readonly plainText: string
}): FigJamClipboardTable | null {
  const htmlRows = html ? parseHtmlTable(html) : null
  const rows = htmlRows ?? parseDelimitedTable(plainText)

  if (!rows || rows.length === 0 || rows[0]?.length === 0) {
    return null
  }

  const width = Math.max(...rows.map((row) => row.length))
  const normalized = rows.map((row) => Array.from(
    { length: width },
    (_, index) => row[index]?.trim() ?? '',
  ))
  const [header = [], ...values] = normalized

  return {
    columns: header.map((value, index) => value || `Column ${index + 1}`),
    rows: values,
  }
}

function parseDelimitedTable(value: string) {
  const normalized = value.trim()
  const hasTabs = normalized.includes('\t')
  const hasCommas = normalized.includes(',')

  if (!normalized || !hasTabs && !hasCommas) {
    return null
  }

  return hasTabs
    ? normalized.split(/\r?\n/).map((row) => row.split('\t'))
    : parseCsvRows(normalized)
}

function parseCsvRows(value: string) {
  const rows: string[][] = [[]]
  let field = ''
  let quoted = false

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]

    if (character === '"') {
      if (quoted && value[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && character === ',') {
      rows.at(-1)?.push(field)
      field = ''
      continue
    }

    if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && value[index + 1] === '\n') {
        index += 1
      }
      rows.at(-1)?.push(field)
      field = ''
      rows.push([])
      continue
    }

    field += character
  }

  rows.at(-1)?.push(field)

  return rows.filter((row) => row.some((cell) => cell.length > 0))
}

function parseHtmlTable(html: string) {
  if (typeof DOMParser !== 'function' || !/<table[\s>]/i.test(html)) {
    return null
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  const table = document.querySelector('table')

  if (!table) {
    return null
  }

  return [...table.querySelectorAll('tr')].map((row) =>
    [...row.querySelectorAll(':scope > th, :scope > td')]
      .map((cell) => cell.textContent ?? ''))
}
