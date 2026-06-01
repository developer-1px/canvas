import type { HtmlSpecimenVisualCssNode } from './HtmlSpecimenVisualCssEdit'

export function createButtonNodes(): HtmlSpecimenVisualCssNode[] {
  return [
    createNode({
      className: 'button primary',
      id: 'primary',
      tagName: 'button',
    }),
    createNode({
      className: 'button secondary',
      id: 'secondary',
      tagName: 'button',
    }),
    createNode({
      className: 'button danger',
      id: 'danger',
      tagName: 'button',
    }),
  ]
}

export function createThemedButtonNodes(): HtmlSpecimenVisualCssNode[] {
  return [
    createNode({
      className: 'theme',
      id: 'theme',
      path: [0],
      tagName: 'section',
    }),
    createNode({
      className: 'button primary',
      id: 'primary',
      path: [0, 0],
      tagName: 'button',
    }),
    createNode({
      className: 'button secondary',
      id: 'secondary',
      path: [0, 1],
      tagName: 'button',
    }),
    createNode({
      className: 'button outside',
      id: 'outside',
      path: [1],
      tagName: 'button',
    }),
  ]
}

export function createNode({
  attributes = {},
  className,
  id,
  path,
  tagName,
}: {
  attributes?: Readonly<Record<string, string>>
  className: string
  id: string
  path?: readonly number[]
  tagName: string
}): HtmlSpecimenVisualCssNode {
  return {
    attributes: {
      ...attributes,
      class: className,
      id,
    },
    classList: className.split(' '),
    id,
    path,
    tagName,
  }
}

