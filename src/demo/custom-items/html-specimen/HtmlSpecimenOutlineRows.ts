import {
  getHtmlSpecimenOutlineElementText,
  isHtmlSpecimenOutlineTextEditable,
  listHtmlSpecimenOutlineElements,
  type HtmlSpecimenOutline,
} from './HtmlSpecimenOutline'
import {
  formatHtmlSpecimenPreviewNodeSelector,
  readNodeAttribute,
} from './HtmlSpecimenPreviewNodeLabel'

export type HtmlSpecimenOutlineEditorNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id: string
  path?: readonly number[]
  provenance?: {
    componentId?: string
    sourceId?: string
  }
  tagName: string
  text?: string
}

export type HtmlSpecimenOutlineRow = {
  attributes: Readonly<Record<string, string>>
  editable: boolean
  hasChildren: boolean
  id: string
  path: readonly number[]
  tagName: string
  text: string
  voidElement: boolean
}

export function createHtmlSpecimenOutlineRows({
  nodes,
  outline,
}: {
  nodes: readonly HtmlSpecimenOutlineEditorNode[]
  outline: HtmlSpecimenOutline | null
}): HtmlSpecimenOutlineRow[] {
  const rows = outline
    ? listHtmlSpecimenOutlineElements(outline).map((node) => ({
        attributes: node.attributes,
        editable: isHtmlSpecimenOutlineTextEditable(node),
        hasChildren: false,
        id: node.id,
        path: node.path,
        tagName: node.tagName,
        text: getHtmlSpecimenOutlineElementText(node),
        voidElement: node.voidElement,
      }))
    : [...nodes]
      .sort((left, right) => compareHtmlSpecimenPath(
        left.path ?? [],
        right.path ?? [],
      ))
      .map((node) => ({
        attributes: node.attributes,
        editable: false,
        hasChildren: false,
        id: node.id,
        path: node.path ?? [],
        tagName: node.tagName.toLowerCase(),
        text: node.text ?? '',
        voidElement: false,
      }))

  return rows.map((row) => ({
    ...row,
    hasChildren: rows.some((candidate) =>
      isDirectHtmlSpecimenOutlineChildPath({
        childPath: candidate.path,
        parentPath: row.path,
      })),
  }))
}

export function formatHtmlSpecimenOutlineRowLabel(
  row: HtmlSpecimenOutlineRow | null,
) {
  if (!row) {
    return 'element'
  }

  return formatHtmlSpecimenPreviewNodeSelector({
    attributes: row.attributes,
    classList: getHtmlSpecimenOutlineClassList(row),
    tagName: row.tagName,
  })
}

export function formatHtmlSpecimenOutlineRowText(
  row: HtmlSpecimenOutlineRow,
) {
  const text = row.text.replace(/\s+/g, ' ').trim()
  const component = readNodeAttribute({
    attributes: row.attributes,
    classList: getHtmlSpecimenOutlineClassList(row),
    tagName: row.tagName,
  }, 'data-surface-component')

  return text || component || row.tagName
}

function getHtmlSpecimenOutlineClassList(row: HtmlSpecimenOutlineRow) {
  const value = row.attributes.class ?? row.attributes.className ?? ''

  return value.split(/\s+/).filter(Boolean)
}

function compareHtmlSpecimenPath(
  left: readonly number[],
  right: readonly number[],
) {
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? -1
    const rightValue = right[index] ?? -1

    if (leftValue !== rightValue) {
      return leftValue - rightValue
    }
  }

  return 0
}

function isDirectHtmlSpecimenOutlineChildPath({
  childPath,
  parentPath,
}: {
  childPath: readonly number[]
  parentPath: readonly number[]
}) {
  return childPath.length === parentPath.length + 1 &&
    parentPath.every((value, index) => childPath[index] === value)
}
