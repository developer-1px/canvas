const HTML_SPECIMEN_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export function createHtmlSpecimenOutlineElementId({
  attributes,
  path,
  tagName,
}: {
  attributes: Record<string, string>
  path: readonly number[]
  tagName: string
}) {
  const surfaceId = readHtmlSpecimenAttribute(attributes, 'data-surface-id')

  if (surfaceId) {
    return surfaceId
  }

  const id = readHtmlSpecimenAttribute(attributes, 'id')

  return id ? `dom:${id}` : `dom:${tagName}:${path.join('/')}`
}

export function isHtmlSpecimenVoidElement(tagName: string) {
  return HTML_SPECIMEN_VOID_ELEMENTS.has(tagName)
}

function readHtmlSpecimenAttribute(
  attributes: Record<string, string>,
  name: string,
) {
  return attributes[name] ?? attributes[name.toLowerCase()] ?? ''
}
