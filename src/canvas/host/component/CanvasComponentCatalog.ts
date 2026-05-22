import type { CanvasComponentKind } from '../model/CanvasModel'

export type CanvasComponentTemplate = {
  accent: string
  body?: string
  columns?: string[]
  fill: string
  h: number
  id: CanvasComponentKind
  items?: string[]
  label: string
  stroke: string
  title: string
  w: number
}

export const CANVAS_COMPONENT_TEMPLATES = [
  {
    id: 'sticky',
    label: 'N',
    title: 'Sticky',
    body: 'Decision note',
    w: 188,
    h: 148,
    fill: '#fef3c7',
    stroke: '#eab308',
    accent: '#ca8a04',
  },
  {
    id: 'label',
    label: 'T',
    title: 'Label',
    body: 'Section label',
    w: 192,
    h: 52,
    fill: 'transparent',
    stroke: 'transparent',
    accent: '#111827',
  },
  {
    id: 'card',
    label: 'C',
    title: 'Card',
    body: 'Concept block',
    w: 220,
    h: 128,
    fill: '#ffffff',
    stroke: '#cbd5e1',
    accent: '#2563eb',
  },
  {
    id: 'connector',
    label: 'A',
    title: 'Connector',
    w: 220,
    h: 64,
    fill: 'transparent',
    stroke: '#475569',
    accent: '#475569',
  },
  {
    id: 'section',
    label: 'F',
    title: 'Section',
    body: 'Workspace',
    w: 340,
    h: 220,
    fill: 'rgba(241, 245, 249, 0.42)',
    stroke: '#94a3b8',
    accent: '#64748b',
  },
  {
    id: 'checklist',
    label: '✓',
    title: 'Checklist',
    items: ['Scope', 'Owner', 'Next'],
    w: 224,
    h: 156,
    fill: '#ffffff',
    stroke: '#cbd5e1',
    accent: '#16a34a',
  },
  {
    id: 'kanban',
    label: 'K',
    title: 'Queue',
    items: ['Now', 'Next', 'Later'],
    w: 214,
    h: 190,
    fill: '#f8fafc',
    stroke: '#cbd5e1',
    accent: '#7c3aed',
  },
  {
    id: 'table',
    label: '#',
    title: 'Matrix',
    columns: ['A', 'B', 'C'],
    items: ['Impact', 'High', 'Med', 'Effort', 'Low', 'Med'],
    w: 260,
    h: 156,
    fill: '#ffffff',
    stroke: '#cbd5e1',
    accent: '#0891b2',
  },
  {
    id: 'vote',
    label: '•',
    title: 'Vote',
    body: '+1',
    w: 84,
    h: 84,
    fill: '#fee2e2',
    stroke: '#f87171',
    accent: '#dc2626',
  },
  {
    id: 'image',
    label: '▧',
    title: 'Image',
    body: 'Screenshot',
    w: 240,
    h: 154,
    fill: '#f8fafc',
    stroke: '#94a3b8',
    accent: '#0f766e',
  },
] satisfies readonly CanvasComponentTemplate[]

export function getCanvasComponentTemplate(id: CanvasComponentKind) {
  return CANVAS_COMPONENT_TEMPLATES.find((template) => template.id === id) ??
    CANVAS_COMPONENT_TEMPLATES[0]
}
