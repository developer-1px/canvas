import { vi } from 'vitest'
import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import { createButtonSpecimenData } from './HtmlSpecimenCustomItemModel'

export function createFocusNode({
  computedStyle = {},
}: {
  computedStyle?: Record<string, string>
} = {}) {
  return {
    attributes: {
      class: 'button primary',
      id: 'primary',
    },
    classList: ['button', 'primary'],
    computedStyle,
    id: 'dom:primary',
    path: [0, 0],
    tagName: 'button',
    text: 'Create project',
  }
}

export function createContext({
  commitItemsChange = vi.fn(() => true),
  customFocus,
  item = createHtmlSpecimenItem(),
}: {
  commitItemsChange?: CanvasAppInspectorPanelContext['commitItemsChange']
  customFocus?: CanvasAppInspectorPanelContext['customFocus']
  item?: CanvasCustomItem
} = {}): CanvasAppInspectorPanelContext {
  const node = {
    attributes: {
      class: 'button primary',
      id: 'primary',
    },
    classList: ['button', 'primary'],
    computedStyle: {
      color: '#ffffff',
      backgroundColor: '#2457c5',
      borderColor: 'transparent',
      borderRadius: '5px',
      fontSize: '12px',
      margin: '0px',
      padding: '0px',
    },
    id: 'dom:primary',
    path: [0, 0],
    tagName: 'button',
    text: 'Create project',
  }

  return {
    bounds: item,
    commitItemsChange,
    customFocus: customFocus ?? {
      data: {
        node,
        nodes: [
          node,
          {
            ...node,
            attributes: {
              class: 'button secondary',
              id: 'secondary',
            },
            classList: ['button', 'secondary'],
            id: 'dom:secondary',
            path: [0, 1],
            text: 'Invite team',
          },
          {
            ...node,
            attributes: {
              class: 'button danger',
              id: 'danger',
            },
            classList: ['button', 'danger'],
            id: 'dom:danger',
            path: [0, 2],
            text: 'Delete',
          },
        ],
      },
      itemId: 'html-specimen-1',
      ownerId: 'html-specimen',
      targetId: 'dom:primary',
    },
    disabled: false,
    items: [item],
    label: 'HTML specimen',
    selectedItems: [item],
    selection: ['html-specimen-1'],
  }
}

export function createHtmlSpecimenItem(
  data = createButtonSpecimenData(),
): CanvasCustomItem {
  return {
    data,
    h: 250,
    id: 'html-specimen-1',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Button specimen',
    type: 'custom',
    w: 380,
    x: 80,
    y: 120,
  }
}
