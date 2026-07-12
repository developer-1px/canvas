export const CANVAS_APP_CAPABILITIES = [
  'comment',
  'editDocument',
  'export',
  'follow',
  'present',
  'view',
] as const

export type CanvasAppCapability = typeof CANVAS_APP_CAPABILITIES[number]

export type CanvasAppCapabilitySnapshot = {
  comment: boolean
  editDocument: boolean
  export: boolean
  follow: boolean
  present: boolean
  view: boolean
}

export type CanvasAppCapabilityInput = Partial<CanvasAppCapabilitySnapshot>

export function assertCanvasAppRequiredCapability({
  owner,
  value,
}: {
  readonly owner: string
  readonly value: unknown
}) {
  if (!CANVAS_APP_CAPABILITIES.includes(value as CanvasAppCapability)) {
    throw new Error(`Canvas app ${owner} requires requiredCapability`)
  }
}
