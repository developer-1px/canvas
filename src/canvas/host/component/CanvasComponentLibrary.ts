import {
  assertCanvasStableId,
  type Point,
} from '../../core'
import type {
  CanvasComponentItem,
  CanvasComponentKind,
} from '../model'
import {
  assertCanvasComponentLibraryInput,
  assertCanvasComponentTemplateContracts,
  assertCanvasComponentTemplates,
} from './CanvasComponentLibraryContracts'
import { DEFAULT_CANVAS_COMPONENT_TEMPLATES } from './CanvasBuiltInComponentTemplates'

export { DEFAULT_CANVAS_COMPONENT_TEMPLATES } from './CanvasBuiltInComponentTemplates'

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
  const componentTemplates = cloneCanvasComponentTemplates(templates)

  return {
    createItem: (input) =>
      createCanvasComponentItem({ ...input, templates: componentTemplates }),
    getPresentation: (id) =>
      getCanvasComponentTemplate(componentTemplates, id).presentation,
    getTemplate: (id) => getCanvasComponentTemplate(componentTemplates, id),
    templates: componentTemplates,
  }
}

export const CANVAS_COMPONENT_LIBRARY = createCanvasComponentLibrary()

function cloneCanvasComponentTemplates(
  templates: readonly CanvasComponentTemplate[],
) {
  return Object.freeze(
    templates.map((template) =>
      freezeCanvasComponentTemplate(cloneCanvasComponentTemplate(template)),
    ),
  )
}

function cloneCanvasComponentTemplate(template: CanvasComponentTemplate) {
  const clone: CanvasComponentTemplate = { ...template }

  if (template.columns) {
    clone.columns = [...template.columns]
  }

  if (template.items) {
    clone.items = [...template.items]
  }

  return clone
}

function freezeCanvasComponentTemplate(
  template: CanvasComponentTemplate,
) {
  if (template.columns) {
    Object.freeze(template.columns)
  }

  if (template.items) {
    Object.freeze(template.items)
  }

  return Object.freeze(template)
}
