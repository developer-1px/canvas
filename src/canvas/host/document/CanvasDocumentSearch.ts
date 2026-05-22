import type { JSONPatchOperation, Pointer } from 'zod-crud'
import { parsePointer } from 'zod-crud'
import type { CanvasItem } from '../model/CanvasModel'
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

const CANVAS_TEXT_SEARCH_QUERIES: Array<{
  field: CanvasSearchField
  jsonPath: string
}> = [
  { field: 'title', jsonPath: '$..title' },
  { field: 'body', jsonPath: '$..body' },
  { field: 'text', jsonPath: '$..text' },
  { field: 'items', jsonPath: '$..items[*]' },
  { field: 'columns', jsonPath: '$..columns[*]' },
]

export function findCanvasDocumentText(
  document: CanvasItemsDocument,
  text: string,
  options: CanvasTextSearchOptions = {},
): CanvasTextSearchMatch[] {
  if (text.length === 0) {
    return []
  }

  return CANVAS_TEXT_SEARCH_QUERIES.flatMap(({ field, jsonPath }) => {
    const result = document.query(jsonPath)

    if (!result.ok) {
      return []
    }

    return result.pointers.flatMap((path) => {
      const read = document.at(path)

      if (!read.ok || typeof read.value !== 'string') {
        return []
      }

      const occurrences = countTextOccurrences(read.value, text, options)
      const itemId = getCanvasItemIdForPointer(document.value, path)

      return occurrences > 0 && itemId
        ? [{
            field,
            itemId,
            occurrences,
            path,
            value: read.value,
          }]
        : []
    })
  })
}

export function createReplaceCanvasDocumentTextPatch(
  document: CanvasItemsDocument,
  searchText: string,
  replacement: string,
  options: CanvasTextSearchOptions = {},
): JSONPatchOperation[] {
  return findCanvasDocumentText(document, searchText, options).flatMap(
    (match) => {
      const value = replaceText(match.value, searchText, replacement, options)

      return value === match.value
        ? []
        : [{
            op: 'replace',
            path: match.path,
            value,
          }]
    },
  )
}

function countTextOccurrences(
  value: string,
  searchText: string,
  options: CanvasTextSearchOptions,
) {
  const flags = options.caseSensitive ? 'g' : 'gi'
  const matches = value.match(new RegExp(escapeRegExp(searchText), flags))

  return matches?.length ?? 0
}

function replaceText(
  value: string,
  searchText: string,
  replacement: string,
  options: CanvasTextSearchOptions,
) {
  const flags = options.caseSensitive ? 'g' : 'gi'

  return value.replace(new RegExp(escapeRegExp(searchText), flags), replacement)
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
