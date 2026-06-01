import {
  createHtmlSpecimenOutlineElementId,
  isHtmlSpecimenVoidElement,
} from './HtmlSpecimenOutlineIdentity'
import { refreshHtmlSpecimenOutlinePaths } from './HtmlSpecimenOutlineStructure'
import type {
  HtmlSpecimenOutline,
  HtmlSpecimenOutlineContent,
} from './HtmlSpecimenOutlineTypes'

export function createHtmlSpecimenOutlineFromHtml(
  html: string,
): HtmlSpecimenOutline | null {
  if (typeof DOMParser !== 'function') {
    return null
  }

  const document = new DOMParser().parseFromString(html, 'text/html')

  return refreshHtmlSpecimenOutlinePaths({
    content: readHtmlSpecimenOutlineContent(document.body.childNodes, []),
  })
}

function readHtmlSpecimenOutlineContent(
  childNodes: NodeListOf<ChildNode>,
  parentPath: readonly number[],
) {
  const content: HtmlSpecimenOutlineContent[] = []
  let elementIndex = 0

  childNodes.forEach((childNode) => {
    if (childNode.nodeType === Node.TEXT_NODE) {
      content.push({
        kind: 'text',
        text: childNode.textContent ?? '',
      })
      return
    }

    if (!(childNode instanceof Element)) {
      return
    }

    const attributes = readHtmlSpecimenElementAttributes(childNode)
    const tagName = childNode.tagName.toLowerCase()
    const path = [...parentPath, elementIndex]
    elementIndex += 1
    content.push({
      attributes,
      content: readHtmlSpecimenOutlineContent(childNode.childNodes, path),
      id: createHtmlSpecimenOutlineElementId({
        attributes,
        path,
        tagName,
      }),
      kind: 'element',
      path,
      tagName,
      voidElement: isHtmlSpecimenVoidElement(tagName),
    })
  })

  return content
}

function readHtmlSpecimenElementAttributes(element: Element) {
  const attributes: Record<string, string> = {}

  for (const attribute of element.attributes) {
    attributes[attribute.name] = attribute.value
  }

  return attributes
}
