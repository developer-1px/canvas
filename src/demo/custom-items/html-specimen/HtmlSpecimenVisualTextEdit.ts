import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import type { HtmlSpecimenVisualCssNode } from './HtmlSpecimenVisualCssEdit'

export type HtmlSpecimenVisualTextEditIntent = {
  nextText: string
  nodeId: string
}

export type HtmlSpecimenVisualTextEditResult =
  | {
      ok: false
      reason:
        | 'element-has-children'
        | 'node-not-found'
        | 'path-not-found'
        | 'self-closing-element'
      specimen: HtmlSpecimenData
    }
  | {
      nextText: string
      ok: true
      previousText: string
      specimen: HtmlSpecimenData
    }

type HtmlElementRange = {
  closeStart: number
  openEnd: number
  selfClosing: boolean
}

type HtmlStackElement = {
  childIndex: number
  openEnd: number
  path: number[]
  tagName: string
}

const HTML_VOID_ELEMENTS = new Set([
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

export function applyHtmlSpecimenVisualTextEdit({
  intent,
  nodes,
  specimen,
}: {
  intent: HtmlSpecimenVisualTextEditIntent
  nodes: readonly HtmlSpecimenVisualCssNode[]
  specimen: HtmlSpecimenData
}): HtmlSpecimenVisualTextEditResult {
  const node = nodes.find((candidate) => candidate.id === intent.nodeId)

  if (!node) {
    return {
      ok: false,
      reason: 'node-not-found',
      specimen,
    }
  }

  if (!isHtmlSpecimenVisualTextEditable({ node, nodes })) {
    return {
      ok: false,
      reason: 'element-has-children',
      specimen,
    }
  }

  const range = findHtmlSpecimenElementRangeByPath({
    html: specimen.html,
    path: node.path ?? [],
  })

  if (!range) {
    return {
      ok: false,
      reason: 'path-not-found',
      specimen,
    }
  }

  if (range.selfClosing) {
    return {
      ok: false,
      reason: 'self-closing-element',
      specimen,
    }
  }

  const previousText = readHtmlSpecimenElementText(
    specimen.html.slice(range.openEnd, range.closeStart),
  )
  const nextText = intent.nextText

  return {
    nextText,
    ok: true,
    previousText,
    specimen: {
      ...specimen,
      html: [
        specimen.html.slice(0, range.openEnd),
        escapeHtmlSpecimenText(nextText),
        specimen.html.slice(range.closeStart),
      ].join(''),
    },
  }
}

export function isHtmlSpecimenVisualTextEditable({
  node,
  nodes,
}: {
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
}) {
  const path = node.path
  const tagName = node.tagName.toLowerCase()

  if (!path || path.length === 0 || HTML_VOID_ELEMENTS.has(tagName)) {
    return false
  }

  return !nodes.some((candidate) =>
    candidate.id !== node.id &&
    isDirectHtmlSpecimenChildPath(candidate.path, path))
}

function findHtmlSpecimenElementRangeByPath({
  html,
  path,
}: {
  html: string
  path: readonly number[]
}): HtmlElementRange | null {
  if (path.length === 0) {
    return null
  }

  const stack: HtmlStackElement[] = [{
    childIndex: 0,
    openEnd: 0,
    path: [],
    tagName: '#root',
  }]
  const tagExpression =
    /<!--[\s\S]*?-->|<![a-zA-Z][\s\S]*?>|<\/?([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>/g
  let match: RegExpExecArray | null

  while ((match = tagExpression.exec(html)) !== null) {
    const token = match[0]
    const rawTagName = match[1]

    if (!rawTagName || token.startsWith('<!--') || token.startsWith('<!')) {
      continue
    }

    const tagName = rawTagName.toLowerCase()

    if (token.startsWith('</')) {
      const current = stack.pop()

      if (!current || current.tagName !== tagName) {
        continue
      }

      if (hasSameHtmlSpecimenPath(current.path, path)) {
        return {
          closeStart: match.index,
          openEnd: current.openEnd,
          selfClosing: false,
        }
      }

      continue
    }

    const parent = stack[stack.length - 1]
    const nextPath = [...parent.path, parent.childIndex]
    const selfClosing = token.endsWith('/>') || HTML_VOID_ELEMENTS.has(tagName)

    parent.childIndex += 1

    if (hasSameHtmlSpecimenPath(nextPath, path) && selfClosing) {
      return {
        closeStart: tagExpression.lastIndex,
        openEnd: tagExpression.lastIndex,
        selfClosing: true,
      }
    }

    if (!selfClosing) {
      stack.push({
        childIndex: 0,
        openEnd: tagExpression.lastIndex,
        path: nextPath,
        tagName,
      })
    }
  }

  return null
}

function readHtmlSpecimenElementText(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function escapeHtmlSpecimenText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function isDirectHtmlSpecimenChildPath(
  candidate: readonly number[] | undefined,
  parent: readonly number[],
) {
  return Boolean(candidate) &&
    candidate?.length === parent.length + 1 &&
    parent.every((value, index) => candidate[index] === value)
}

function hasSameHtmlSpecimenPath(
  left: readonly number[],
  right: readonly number[],
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}
