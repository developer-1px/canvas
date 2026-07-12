import type {
  Point,
  Tool,
} from '../../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
} from '../../../../engine'
import { getCanvasToolPointerGesture } from '../../../../foundation'
import type {
  CanvasAppFoundationExtensionRuntime,
} from '../../../extensions/foundation-extensions'
import type {
  CanvasAppComponentLibrary,
} from '../../../workflow/CanvasAppComponentAssemblyContracts'

export function startCanvasPointerFoundationExtensionCreation({
  componentLibrary,
  config,
  createId,
  pointerGesture,
  runtime,
  selection,
  startWorld,
  tool,
}: {
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  pointerGesture: CanvasPointerGesture
  runtime: CanvasAppFoundationExtensionRuntime
  selection: string[]
  startWorld: Point
  tool: Tool
}) {
  if (!runtime.hasTool(tool)) {
    return null
  }

  if (getCanvasToolPointerGesture({ config, tool }) !== pointerGesture) {
    return { kind: 'none' as const }
  }

  const effects = runtime.planTool(tool, {
    componentLibrary,
    createId,
    point: startWorld,
    selection,
    surface: 'pointer',
  })

  return effects && effects.length > 0
    ? {
        capturePointer: false as const,
        effects,
        kind: 'extension-effects' as const,
      }
    : { kind: 'none' as const }
}
