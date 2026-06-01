const HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE =
  'data-html-specimen-preview-hover'
const HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE =
  'data-html-specimen-preview-target'

export function markHtmlSpecimenPreviewTargetElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_TARGET_ATTRIBUTE,
    path,
    root,
  })
}

export function markHtmlSpecimenPreviewHoverElement(
  root: ShadowRoot,
  path: readonly number[],
) {
  markHtmlSpecimenPreviewElement({
    attribute: HTML_SPECIMEN_PREVIEW_HOVER_ATTRIBUTE,
    path,
    root,
  })
}

export function clearHtmlSpecimenPreviewMarkedElement(
  root: ShadowRoot,
  attribute: string,
) {
  for (const element of root.querySelectorAll(`[${attribute}]`)) {
    element.removeAttribute(attribute)
  }
}

export function getHtmlSpecimenPreviewSurfaceRoot(root: ShadowRoot) {
  return root.querySelector('[data-preview-surface-root]')
}

function markHtmlSpecimenPreviewElement({
  attribute,
  path,
  root,
}: {
  attribute: string
  path: readonly number[]
  root: ShadowRoot
}) {
  clearHtmlSpecimenPreviewMarkedElement(root, attribute)
  findHtmlSpecimenPreviewElementByPath(root, path)?.setAttribute(
    attribute,
    'true',
  )
}

function findHtmlSpecimenPreviewElementByPath(
  root: ShadowRoot,
  path: readonly number[],
) {
  let element = getHtmlSpecimenPreviewSurfaceRoot(root)

  for (const index of path) {
    const child = element?.children[index]

    if (!child) {
      return null
    }

    element = child
  }

  return element
}
