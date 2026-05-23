import {
  assertCanvasStableId,
  type Point,
} from '../../core'
import type {
  CanvasComponentItem,
  CanvasComponentKind,
} from '../model'

export type CanvasComponentPresentation = string

export type CanvasComponentTemplate = {
  accent: string
  body?: string
  columns?: string[]
  fill: string
  h: number
  id: CanvasComponentKind
  items?: string[]
  label: string
  presentation: CanvasComponentPresentation
  stroke: string
  title: string
  w: number
}

export type CreateCanvasComponentItemInput = {
  id: string
  point: Point
  templateId: CanvasComponentKind
}

export type CanvasComponentLibrary = {
  createItem: (input: CreateCanvasComponentItemInput) => CanvasComponentItem
  getPresentation: (
    id: CanvasComponentKind,
  ) => CanvasComponentPresentation
  getTemplate: (id: CanvasComponentKind) => CanvasComponentTemplate
  templates: readonly CanvasComponentTemplate[]
}

export type CreateCanvasComponentLibraryInput = {
  templates?: readonly CanvasComponentTemplate[]
}

export const DEFAULT_CANVAS_COMPONENT_TEMPLATES = [
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
    presentation: 'note-card',
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
    presentation: 'inline-label',
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
    presentation: 'accent-card',
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
    presentation: 'line-connector',
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
    presentation: 'section-frame',
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
    presentation: 'checklist-list',
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
    presentation: 'kanban-stack',
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
    presentation: 'matrix-table',
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
    presentation: 'vote-badge',
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
    presentation: 'image-frame',
  },
] satisfies readonly CanvasComponentTemplate[]

function getCanvasComponentTemplate(
  templates: readonly CanvasComponentTemplate[],
  id: CanvasComponentKind,
) {
  assertCanvasStableId({
    id,
    label: 'component template',
  })

  return templates.find((template) => template.id === id) ?? templates[0]
}

function createCanvasComponentItem({
  id,
  point,
  templateId,
  templates,
}: CreateCanvasComponentItemInput & {
  templates: readonly CanvasComponentTemplate[]
}): CanvasComponentItem {
  const template = getCanvasComponentTemplate(templates, templateId)
  const item: CanvasComponentItem = {
    id,
    type: 'component',
    component: template.id,
    x: point.x,
    y: point.y,
    w: template.w,
    h: template.h,
    title: template.title,
    fill: template.fill,
    stroke: template.stroke,
    accent: template.accent,
  }

  if (template.body !== undefined) {
    item.body = template.body
  }

  if (template.items) {
    item.items = [...template.items]
  }

  if (template.columns) {
    item.columns = [...template.columns]
  }

  return item
}

export function createCanvasComponentLibrary(
  input: CreateCanvasComponentLibraryInput = {},
): CanvasComponentLibrary {
  assertCanvasComponentLibraryInput(input)
  const templates = input.templates ?? DEFAULT_CANVAS_COMPONENT_TEMPLATES

  assertCanvasComponentTemplates(templates)

  if (templates.length === 0) {
    throw new Error('Canvas component library requires at least one template')
  }

  assertCanvasComponentTemplateContracts(templates)

  return {
    createItem: (input) => createCanvasComponentItem({ ...input, templates }),
    getPresentation: (id) =>
      getCanvasComponentTemplate(templates, id).presentation,
    getTemplate: (id) => getCanvasComponentTemplate(templates, id),
    templates,
  }
}

export const CANVAS_COMPONENT_LIBRARY = createCanvasComponentLibrary()

function assertCanvasComponentLibraryInput(
  input: unknown,
): asserts input is CreateCanvasComponentLibraryInput {
  if (!isRecord(input)) {
    throw new Error('Canvas component library input must be an object')
  }
}

function assertCanvasComponentTemplates(
  templates: unknown,
): asserts templates is readonly CanvasComponentTemplate[] {
  if (!Array.isArray(templates)) {
    throw new Error('Canvas component library templates must be an array')
  }
}

function assertCanvasComponentTemplateContracts(
  templates: readonly CanvasComponentTemplate[],
) {
  const templateIds = new Set<string>()

  for (const template of templates) {
    assertCanvasComponentTemplateShape(template)
    assertCanvasStableId({
      id: template.id,
      label: 'component template',
    })
    assertCanvasStableId({
      id: template.presentation,
      label: 'component presentation',
    })

    if (templateIds.has(template.id)) {
      throw new Error(`Duplicate canvas component template: ${template.id}`)
    }

    templateIds.add(template.id)
  }
}

function assertCanvasComponentTemplateShape(template: unknown) {
  if (!isRecord(template)) {
    throw new Error('Canvas component template descriptor must be an object')
  }

  const owner = `component template ${String(template.id)}`

  assertCanvasComponentTemplateStringField({
    field: 'label',
    owner,
    value: template.label,
  })
  assertCanvasComponentTemplateStringField({
    field: 'title',
    owner,
    value: template.title,
  })
  assertCanvasComponentTemplateStringField({
    field: 'fill',
    owner,
    value: template.fill,
  })
  assertCanvasComponentTemplateStringField({
    field: 'stroke',
    owner,
    value: template.stroke,
  })
  assertCanvasComponentTemplateStringField({
    field: 'accent',
    owner,
    value: template.accent,
  })
  assertCanvasComponentTemplatePositiveNumberField({
    field: 'w',
    owner,
    value: template.w,
  })
  assertCanvasComponentTemplatePositiveNumberField({
    field: 'h',
    owner,
    value: template.h,
  })
  assertCanvasComponentTemplateOptionalStringField({
    field: 'body',
    owner,
    value: template.body,
  })
  assertCanvasComponentTemplateOptionalStringArrayField({
    field: 'items',
    owner,
    value: template.items,
  })
  assertCanvasComponentTemplateOptionalStringArrayField({
    field: 'columns',
    owner,
    value: template.columns,
  })
}

function assertCanvasComponentTemplateStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Canvas ${owner} requires ${field}`)
  }
}

function assertCanvasComponentTemplateOptionalStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value !== undefined) {
    assertCanvasComponentTemplateStringField({ field, owner, value })
  }
}

function assertCanvasComponentTemplatePositiveNumberField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Canvas ${owner} requires positive ${field}`)
  }
}

function assertCanvasComponentTemplateOptionalStringArrayField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value === undefined) {
    return
  }

  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== 'string')
  ) {
    throw new Error(`Canvas ${owner} requires ${field}`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
