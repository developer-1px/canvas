import {
  CANVAS_RICH_TEXT_LINK_COLOR,
  type CanvasRichTextPasteListType,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
} from './CanvasRichTextPasteContracts'
import {
  getCanvasRichTextListType,
  isCanvasRichTextBlock,
  normalizeCanvasRichTextHref,
} from './CanvasRichTextPasteHtmlShared'
import {
  getCanvasRichTextParagraphStyleFromElement,
  getCanvasRichTextRunStyleFromElement,
} from './CanvasRichTextPasteHtmlStyle'

export function getCanvasRichTextParagraphsFromDOM(value: string) {
  const doc = new DOMParser().parseFromString(value, 'text/html')

  doc.body.querySelectorAll('script, style, noscript')
    .forEach((node) => node.remove())

  return getCanvasRichTextParagraphsFromElement(doc.body)
}

function getCanvasRichTextParagraphsFromElement(root: Element) {
  const blockNodes = Array.from(root.children).filter(isCanvasRichTextBlock)

  if (blockNodes.length === 0) {
    const runs = getCanvasRichTextRunsFromNode(root, {})

    return runs.length > 0 ? [{ runs }] : []
  }

  return blockNodes.flatMap((node) =>
    getCanvasRichTextParagraphFromBlock(node))
}

function getCanvasRichTextParagraphFromBlock(
  node: Element,
  listType?: CanvasRichTextPasteListType,
): CanvasRichTextPasteParagraph[] {
  const tagName = node.tagName.toLowerCase()

  if (tagName === 'br') {
    return []
  }

  const nestedBlocks = Array.from(node.children).filter((child) =>
    isCanvasRichTextBlock(child) && child.tagName.toLowerCase() !== 'br',
  )

  if (nestedBlocks.length > 0 && !['li', 'p'].includes(tagName)) {
    const childListType = getCanvasRichTextListType(tagName) ?? listType

    return nestedBlocks.flatMap((child) =>
      getCanvasRichTextParagraphFromBlock(child, childListType))
  }

  const runs = getCanvasRichTextRunsFromNode(node, {})
  const bullet = tagName === 'li' ? listType ?? 'bullet' : undefined
  const paragraphStyle = getCanvasRichTextParagraphStyleFromElement(node)

  return runs.length > 0
    ? [{
        ...paragraphStyle,
        ...(bullet ? { bullet } : {}),
        runs,
      }]
    : []
}

function getCanvasRichTextRunsFromNode(
  node: Node,
  style: Partial<CanvasRichTextPasteRun>,
): CanvasRichTextPasteRun[] {
  if (node.nodeType === 3) {
    const text = node.textContent?.replace(/\s+/g, ' ') ?? ''

    return text.trim().length > 0
      ? [{
          ...style,
          text,
        }]
      : []
  }

  if (!(node instanceof Element)) {
    return []
  }

  const tagName = node.tagName.toLowerCase()

  if (tagName === 'br') {
    return [{ text: '\n' }]
  }

  const href = tagName === 'a'
    ? normalizeCanvasRichTextHref(node.getAttribute('href'))
    : undefined
  const nextStyle = {
    ...style,
    ...getCanvasRichTextRunStyleFromElement(node),
    ...(['b', 'strong'].includes(tagName) ? { bold: true } : {}),
    ...(['em', 'i'].includes(tagName) ? { italic: true } : {}),
    ...(['del', 's', 'strike'].includes(tagName)
      ? { strikethrough: true }
      : {}),
    ...(['a', 'u'].includes(tagName) ? { underline: true } : {}),
    ...(href ? { color: CANVAS_RICH_TEXT_LINK_COLOR, link: href } : {}),
  }

  return Array.from(node.childNodes).flatMap((child) =>
    getCanvasRichTextRunsFromNode(child, nextStyle))
}
