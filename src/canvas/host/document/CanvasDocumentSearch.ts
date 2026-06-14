import { createSearchReplace } from '@interactive-os/json-document-search-replace'
import type { JSONPatchOperation, Pointer } from '@interactive-os/json-document'
import { parsePointer } from '@interactive-os/json-document'
import type { CanvasItem } from '../model'
import type { CanvasItemsDocument } from './CanvasDocument'

export type CanvasSearchField =
  | 'body'
  | 'columns'
  | 'items'
  | 'text'
  | 'title'

export type CanvasTextSearchMatch = {
  field: CanvasSearchField
  itemId: string
  occurrences: number
  path: Pointer
  value: string
}

export type CanvasTextSearchOptions = {
  caseSensitive?: boolean
}

const CANVAS_TEXT_SEARCH_FIELD_ORDER: CanvasSearchField[] = [
  'title',
  'body',
  'text',
  'items',
  'columns',
]

export function findCanvasDocumentText(
  document: CanvasItemsDocument,
  text: string,
  options: CanvasTextSearchOptions = {},
): CanvasTextSearchMatch[] {
  const result = createSearchReplace(document).find(text, {
    ...options,
    include: ({ pointer }) => isCanvasSearchableTextPointer(pointer),
  })

  if (!result.ok) {
    return []
  }

  return result.matches.flatMap((match) => {
    const field = getCanvasSearchFieldForPointer(match.pointer)
    const itemId = getCanvasItemIdForPointer(document.value, match.pointer)

    return field && itemId
      ? [{
          field,
          itemId,
          occurrences: match.ranges.length,
          path: match.pointer,
          value: match.value,
        }]
      : []
  }).sort(compareCanvasTextSearchMatches)
}

export function createReplaceCanvasDocumentTextPatch(
  document: CanvasItemsDocument,
  searchText: string,
  replacement: string,
  options: CanvasTextSearchOptions = {},
): JSONPatchOperation[] {
  const change = createSearchReplace(document).canReplaceAll(
    searchText,
    replacement,
    {
      ...options,
      include: ({ pointer }) => isCanvasSearchableTextPointer(pointer),
    },
  )

  return change.ok ? [...change.operations] : []
}

function compareCanvasTextSearchMatches(
  left: CanvasTextSearchMatch,
  right: CanvasTextSearchMatch,
) {
  return (
    CANVAS_TEXT_SEARCH_FIELD_ORDER.indexOf(left.field) -
    CANVAS_TEXT_SEARCH_FIELD_ORDER.indexOf(right.field)
  ) || left.path.localeCompare(right.path)
}

function isCanvasSearchableTextPointer(pointer: Pointer) {
  return getCanvasSearchFieldForPointer(pointer) !== null
}

function getCanvasSearchFieldForPointer(pointer: Pointer) {
  const segments = parsePointer(pointer)
  const last = segments.at(-1)
  const parent = segments.at(-2)

  if (isCanvasSearchField(last)) {
    return last
  }

  return isArrayIndexSegment(last) && isCanvasSearchField(parent)
    ? parent
    : null
}

function isCanvasSearchField(value: unknown): value is CanvasSearchField {
  return typeof value === 'string' &&
    (CANVAS_TEXT_SEARCH_FIELD_ORDER as string[]).includes(value)
}

function isArrayIndexSegment(value: unknown) {
  return typeof value === 'string' && /^\d+$/.test(value)
}

function getCanvasItemIdForPointer(items: CanvasItem[], pointer: Pointer) {
  const segments = parsePointer(pointer)
  let nodes = items
  let item: CanvasItem | undefined

  for (let index = 0; index < segments.length;) {
    const itemIndex = Number(segments[index])

    if (!Number.isInteger(itemIndex)) {
      break
    }

    item = nodes[itemIndex]
    index += 1

    if (segments[index] === 'children' && item?.type === 'group') {
      nodes = item.children
      index += 1
      continue
    }

    break
  }

  return item?.id ?? null
}
