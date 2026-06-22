import {
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import type {
  CanvasAppCapabilityAssembly,
  CanvasAppCapabilityAssemblyInput,
  CanvasAppCapabilityInput,
  CanvasAppCapabilitySnapshot,
} from './CanvasAppCapabilityContracts'

const CANVAS_APP_CAPABILITY_FIELDS = [
  'comment',
  'editDocument',
  'export',
  'follow',
  'present',
  'view',
] as const satisfies readonly (keyof CanvasAppCapabilitySnapshot)[]

export const CANVAS_APP_EDITOR_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: true,
    editDocument: true,
    export: true,
    follow: true,
    present: true,
    view: true,
  })

export const CANVAS_APP_COMMENT_ONLY_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: true,
    editDocument: false,
    export: false,
    follow: false,
    present: false,
    view: true,
  })

export const CANVAS_APP_READ_ONLY_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: false,
    editDocument: false,
    export: false,
    follow: false,
    present: false,
    view: true,
  })

export function createCanvasAppCapabilityAssembly(
  input: CanvasAppCapabilityAssemblyInput,
  defaults: CanvasAppCapabilityAssembly,
): CanvasAppCapabilityAssembly {
  return {
    capabilities: createCanvasAppCapabilities(
      input.capabilities ?? defaults.capabilities,
    ),
  }
}

export function createCanvasAppCapabilities(
  input: CanvasAppCapabilityInput = {},
): CanvasAppCapabilitySnapshot {
  const capabilities: CanvasAppCapabilitySnapshot = {
    comment: input.comment ?? CANVAS_APP_EDITOR_CAPABILITIES.comment,
    editDocument:
      input.editDocument ?? CANVAS_APP_EDITOR_CAPABILITIES.editDocument,
    export: input.export ?? CANVAS_APP_EDITOR_CAPABILITIES.export,
    follow: input.follow ?? CANVAS_APP_EDITOR_CAPABILITIES.follow,
    present: input.present ?? CANVAS_APP_EDITOR_CAPABILITIES.present,
    view: input.view ?? CANVAS_APP_EDITOR_CAPABILITIES.view,
  }

  if (!capabilities.view) {
    return deepFreezeCanvasAppCapabilities({
      comment: false,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: false,
    })
  }

  return deepFreezeCanvasAppCapabilities(capabilities)
}

export function assertCanvasAppCapabilityAssembly({
  capabilities,
}: CanvasAppCapabilityAssembly) {
  assertCanvasAppDescriptorObject(capabilities, 'assembly capabilities')

  for (const field of CANVAS_APP_CAPABILITY_FIELDS) {
    if (typeof capabilities[field] !== 'boolean') {
      throw new Error(`Canvas app assembly capabilities requires ${field}`)
    }
  }
}

function deepFreezeCanvasAppCapabilities(
  capabilities: CanvasAppCapabilitySnapshot,
): CanvasAppCapabilitySnapshot {
  return Object.freeze({ ...capabilities })
}
