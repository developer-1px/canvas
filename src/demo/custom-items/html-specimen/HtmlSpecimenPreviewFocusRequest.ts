export const HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT =
  'html-specimen-preview:focus-request'

export type HtmlSpecimenPreviewFocusRequest = {
  itemId: string
  nodeId: string
}

export function dispatchHtmlSpecimenPreviewFocusRequest(
  target: EventTarget,
  request: HtmlSpecimenPreviewFocusRequest,
) {
  target.dispatchEvent(new CustomEvent(
    HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT,
    {
      bubbles: true,
      composed: true,
      detail: request,
    },
  ))
}

export function isHtmlSpecimenPreviewFocusRequestEvent(
  event: Event,
): event is CustomEvent<HtmlSpecimenPreviewFocusRequest> {
  const detail = (event as CustomEvent).detail

  return event.type === HTML_SPECIMEN_PREVIEW_FOCUS_REQUEST_EVENT &&
    isRecord(detail) &&
    typeof detail.itemId === 'string' &&
    detail.itemId.length > 0 &&
    typeof detail.nodeId === 'string' &&
    detail.nodeId.length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
