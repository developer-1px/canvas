import {
  CANVAS_RICH_TEXT_LINK_COLOR,
  type CanvasRichTextPasteListType,
  type CanvasRichTextPasteParagraph,
  type CanvasRichTextPasteRun,
} from './CanvasRichTextPasteContracts'
import {
  getCanvasRichTextListType,
  isCanvasRichTextBlockName,
  normalizeCanvasRichTextHref,
} from './CanvasRichTextPasteHtmlShared'
import {
  getCanvasRichTextParagraphStyleFromAttributes,
  getCanvasRichTextRunStyleFromAttributes,
} from './CanvasRichTextPasteHtmlStyle'
import {
  decodeCanvasRichTextEntities,
  getCanvasRichTextHTMLAttribute,
  getCanvasRichTextHTMLTag,
} from './CanvasRichTextPasteHtmlTokens'

export function getCanvasRichTextParagraphsFromString(value: string) {
  const sanitized = value.replace(
    /<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  )
  const paragraphs: CanvasRichTextPasteParagraph[] = []
  let runs: CanvasRichTextPasteRun[] = []
  let bullet: CanvasRichTextPasteListType | undefined
  let paragraphStyle: Partial<CanvasRichTextPasteParagraph> = {}
  let boldDepth = 0
  let italicDepth = 0
  let strikethroughDepth = 0
  let underlineDepth = 0
  const linkStack: string[] = []
  const listStack: CanvasRichTextPasteListType[] = []
  const runStyleStack: Array<{
    style: Partial<CanvasRichTextPasteRun>
    tagName: string
  }> = []

  const flushParagraph = () => {
    if (runs.length > 0) {
      paragraphs.push({
        ...paragraphStyle,
        ...(bullet ? { bullet } : {}),
        runs,
      })
      runs = []
    }
  }

  for (const match of sanitized.matchAll(/<[^>]+>|[^<]+/g)) {
    const token = match[0]

    if (!token.startsWith('<')) {
      const text = decodeCanvasRichTextEntities(token).replace(/\s+/g, ' ')

      if (text.trim()) {
        const link = linkStack.at(-1)

        runs.push({
          ...mergeCanvasRichTextRunStyles(runStyleStack.map((item) =>
            item.style)),
          ...(boldDepth > 0 ? { bold: true } : {}),
          ...(italicDepth > 0 ? { italic: true } : {}),
          ...(strikethroughDepth > 0 ? { strikethrough: true } : {}),
          ...(underlineDepth > 0 || link ? { underline: true } : {}),
          ...(link ? { color: CANVAS_RICH_TEXT_LINK_COLOR, link } : {}),
          text,
        })
      }
      continue
    }

    const tag = getCanvasRichTextHTMLTag(token)

    if (!tag) {
      continue
    }

    if (tag.closing) {
      if (tag.name === 'b' || tag.name === 'strong') {
        boldDepth = Math.max(0, boldDepth - 1)
      } else if (tag.name === 'em' || tag.name === 'i') {
        italicDepth = Math.max(0, italicDepth - 1)
      } else if (
        tag.name === 'del' ||
        tag.name === 's' ||
        tag.name === 'strike'
      ) {
        strikethroughDepth = Math.max(0, strikethroughDepth - 1)
      } else if (tag.name === 'u') {
        underlineDepth = Math.max(0, underlineDepth - 1)
      } else if (tag.name === 'a') {
        linkStack.pop()
      } else if (tag.name === 'ul' || tag.name === 'ol') {
        flushParagraph()
        listStack.pop()
      } else if (isCanvasRichTextBlockName(tag.name)) {
        flushParagraph()
        paragraphStyle = {}
        if (tag.name === 'li') {
          bullet = undefined
        }
      }
      popCanvasRichTextRunStyle(runStyleStack, tag.name)
      continue
    }

    const runStyle = getCanvasRichTextRunStyleFromAttributes(tag.attributes)

    runStyleStack.push({
      style: runStyle,
      tagName: tag.name,
    })

    if (tag.name === 'br') {
      flushParagraph()
    } else if (tag.name === 'ul' || tag.name === 'ol') {
      flushParagraph()
      listStack.push(getCanvasRichTextListType(tag.name) ?? 'bullet')
    } else if (tag.name === 'li') {
      flushParagraph()
      bullet = listStack.at(-1) ?? 'bullet'
      paragraphStyle = getCanvasRichTextParagraphStyleFromAttributes(
        tag.attributes,
      )
    } else if (isCanvasRichTextBlockName(tag.name)) {
      flushParagraph()
      paragraphStyle = getCanvasRichTextParagraphStyleFromAttributes(
        tag.attributes,
      )
    } else if (tag.name === 'b' || tag.name === 'strong') {
      boldDepth += 1
    } else if (tag.name === 'em' || tag.name === 'i') {
      italicDepth += 1
    } else if (
      tag.name === 'del' ||
      tag.name === 's' ||
      tag.name === 'strike'
    ) {
      strikethroughDepth += 1
    } else if (tag.name === 'u') {
      underlineDepth += 1
    } else if (tag.name === 'a') {
      const href = normalizeCanvasRichTextHref(
        getCanvasRichTextHTMLAttribute(tag.attributes, 'href'),
      )

      linkStack.push(href ?? '')
    }

    if (tag.selfClosing && tag.name === 'a') {
      linkStack.pop()
    }

    if (tag.selfClosing) {
      popCanvasRichTextRunStyle(runStyleStack, tag.name)
    }
  }

  flushParagraph()

  return paragraphs
}

function mergeCanvasRichTextRunStyles(
  styles: readonly Partial<CanvasRichTextPasteRun>[],
) {
  return styles.reduce<Partial<CanvasRichTextPasteRun>>(
    (merged, style) => ({
      ...merged,
      ...style,
    }),
    {},
  )
}

function popCanvasRichTextRunStyle(
  stack: Array<{ style: Partial<CanvasRichTextPasteRun>; tagName: string }>,
  tagName: string,
) {
  let index = -1

  for (let candidate = stack.length - 1; candidate >= 0; candidate -= 1) {
    if (stack[candidate]?.tagName === tagName) {
      index = candidate
      break
    }
  }

  if (index >= 0) {
    stack.splice(index, 1)
  }
}
