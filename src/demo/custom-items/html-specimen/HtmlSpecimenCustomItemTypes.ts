import type { CanvasCustomItem } from '../../../canvas'

export type HtmlSpecimenData = {
  css: string
  cssChanges?: HtmlSpecimenCssChange[]
  html: string
  textChanges?: HtmlSpecimenTextChange[]
  viewportHeight: number
  viewportWidth: number
}

export type HtmlSpecimenCssChange = {
  affectedNodeCount: number
  atRule?: string
  kind: 'insert' | 'update'
  previousValue?: string
  property: string
  selector: string
  target: string
  value: string
}

export type HtmlSpecimenTextChange = {
  nextText: string
  nodeId: string
  previousText: string
  target: string
}

export function isHtmlSpecimenItem(
  item: unknown,
): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'html-specimen'
  )
}

export function isHtmlSpecimenData(value: unknown): value is HtmlSpecimenData {
  return (
    isRecord(value) &&
    typeof value.html === 'string' &&
    value.html.trim().length > 0 &&
    typeof value.css === 'string' &&
    isPositiveNumber(value.viewportWidth) &&
    isPositiveNumber(value.viewportHeight)
  )
}

export function getHtmlSpecimenData(item: CanvasCustomItem): HtmlSpecimenData {
  return isHtmlSpecimenData(item.data)
    ? item.data
    : {
        css: '',
        html: '<main></main>',
        viewportHeight: item.h,
        viewportWidth: item.w,
      }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
