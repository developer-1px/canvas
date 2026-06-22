import type { CanvasJsonObject } from '../../../entities'

export type CanvasAppHtmlWidgetData = CanvasJsonObject & {
  css?: string
  html: string
}

export function createCanvasAppHtmlWidgetData({
  css,
  html,
}: {
  css?: string
  html: string
}): CanvasAppHtmlWidgetData {
  return css ? { css, html } : { html }
}

export function isCanvasAppHtmlWidgetData(
  data: CanvasJsonObject,
): data is CanvasAppHtmlWidgetData {
  return (
    typeof data.html === 'string' &&
    (data.css === undefined || typeof data.css === 'string')
  )
}
