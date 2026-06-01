import type {
  HtmlSpecimenOutline,
  HtmlSpecimenOutlineContent,
  HtmlSpecimenOutlineElement,
} from './HtmlSpecimenOutlineTypes'

export function serializeHtmlSpecimenOutline(
  outline: HtmlSpecimenOutline,
) {
  return serializeHtmlSpecimenContent(outline.content)
}

function serializeHtmlSpecimenContent(
  content: readonly HtmlSpecimenOutlineContent[],
): string {
  return content.map((child) =>
    child.kind === 'text'
      ? escapeHtmlSpecimenText(child.text)
      : serializeHtmlSpecimenElement(child)).join('')
}

function serializeHtmlSpecimenElement(
  node: HtmlSpecimenOutlineElement,
): string {
  const attributes = Object.entries(node.attributes)
    .map(([name, value]) => ` ${name}="${escapeHtmlSpecimenAttribute(value)}"`)
    .join('')

  if (node.voidElement) {
    return `<${node.tagName}${attributes}>`
  }

  return `<${node.tagName}${attributes}>${serializeHtmlSpecimenContent(
    node.content,
  )}</${node.tagName}>`
}

function escapeHtmlSpecimenText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlSpecimenAttribute(value: string) {
  return escapeHtmlSpecimenText(value).replace(/"/g, '&quot;')
}
