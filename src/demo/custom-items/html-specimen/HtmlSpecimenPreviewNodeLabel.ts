import type { PreviewSurfaceNode } from '@interactive-os/preview-surface'

export type HtmlSpecimenPreviewNodeLabelInput = Pick<
  PreviewSurfaceNode,
  'attributes' | 'classList' | 'tagName'
>

export function formatHtmlSpecimenPreviewNodeSelector(
  node: HtmlSpecimenPreviewNodeLabelInput,
) {
  const tag = node.tagName.toLowerCase()
  const classSelector = node.classList
    .slice(0, 2)
    .map((className) => `.${className}`)
    .join('')

  if (classSelector) {
    return `${tag}${classSelector}`
  }

  const name = readNodeAttribute(node, 'name')

  if (name) {
    return `${tag}[name="${name}"]`
  }

  const id = readNodeAttribute(node, 'id')

  return id ? `${tag}#${id}` : tag
}

export function readNodeAttribute(
  node: HtmlSpecimenPreviewNodeLabelInput,
  name: string,
) {
  return node.attributes[name] ?? node.attributes[name.toLowerCase()] ?? ''
}
