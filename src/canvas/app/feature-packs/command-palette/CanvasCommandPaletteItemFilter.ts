import type {
  CanvasCommandPaletteItem,
} from './CanvasCommandPaletteItemContracts'

export function filterCanvasCommandPaletteItems(
  items: readonly CanvasCommandPaletteItem[],
  query: string,
) {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) {
    return [...items]
  }

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.section,
      item.shortcut ?? '',
    ].join(' ').toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
}
