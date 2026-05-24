import { assertCanvasStableId } from '../../core'
import type {
  CanvasComponentTemplate,
  CreateCanvasComponentLibraryInput,
} from './CanvasComponentLibrary'

export function assertCanvasComponentLibraryInput(
  input: unknown,
): asserts input is CreateCanvasComponentLibraryInput {
  if (!isRecord(input)) {
    throw new Error('Canvas component library input must be an object')
  }
}

export function assertCanvasComponentTemplates(
  templates: unknown,
): asserts templates is readonly CanvasComponentTemplate[] {
  if (!Array.isArray(templates)) {
    throw new Error('Canvas component library templates must be an array')
  }
}

export function assertCanvasComponentTemplateContracts(
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
  assertCanvasComponentTemplateOptionalNonNegativeIntegerArrayField({
    field: 'checkedItems',
    owner,
    value: template.checkedItems,
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

function assertCanvasComponentTemplateOptionalNonNegativeIntegerArrayField({
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
    value.some((entry) =>
      typeof entry !== 'number' || !Number.isInteger(entry) || entry < 0,
    )
  ) {
    throw new Error(`Canvas ${owner} requires ${field}`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
