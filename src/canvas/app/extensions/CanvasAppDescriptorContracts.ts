export function assertCanvasAppArray(
  value: unknown,
  label: string,
): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Canvas app ${label} must be an array`)
  }
}

export function assertCanvasAppDescriptorObject(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (!isCanvasAppRecord(value)) {
    throw new Error(`Canvas app ${label} descriptor must be an object`)
  }
}

export function assertCanvasAppRegistryRecord(
  value: unknown,
  label: string,
): asserts value is Readonly<Record<string, unknown>> {
  if (!isCanvasAppRecord(value)) {
    throw new Error(`Canvas app ${label} registry must be an object`)
  }
}

export function assertCanvasAppDescriptorFunctionField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (typeof value !== 'function') {
    throw new Error(`Canvas app ${owner} requires ${field}`)
  }
}

export function assertCanvasAppOptionalDescriptorFunctionField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value !== undefined) {
    assertCanvasAppDescriptorFunctionField({ field, owner, value })
  }
}

export function assertCanvasAppDescriptorStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Canvas app ${owner} requires ${field}`)
  }
}

export function assertCanvasAppOptionalDescriptorStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value !== undefined) {
    assertCanvasAppDescriptorStringField({ field, owner, value })
  }
}

export function assertCanvasAppOptionalDescriptorBooleanField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value !== undefined && typeof value !== 'boolean') {
    throw new Error(`Canvas app ${owner} requires ${field}`)
  }
}

function isCanvasAppRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
