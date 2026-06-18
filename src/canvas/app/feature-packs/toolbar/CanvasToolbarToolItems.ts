import {
  CANVAS_TOOL_AFFORDANCE_ORDER,
  type CanvasAffordanceConfig,
} from '../../../engine'
import type {
  CanvasBuiltinTool,
  CanvasCustomToolId,
  Tool,
} from '../../../entities'

export type CanvasToolbarCustomTool = {
  ariaLabel: string
  id: CanvasCustomToolId
  label: string
  title: string
}

export type CanvasToolbarToolItem =
  | {
      active: boolean
      kind: 'builtin-tool'
      tool: CanvasBuiltinTool
    }
  | {
      active: boolean
      ariaLabel: string
      kind: 'custom-tool'
      label: string
      title: string
      tool: CanvasCustomToolId
    }

export type CanvasToolbarToolItemsInput = {
  config: CanvasAffordanceConfig
  customTools: readonly CanvasToolbarCustomTool[]
  tool: Tool
}

export function getCanvasToolbarToolItems({
  config,
  customTools,
  tool,
}: CanvasToolbarToolItemsInput): CanvasToolbarToolItem[] {
  return [
    ...CANVAS_TOOL_AFFORDANCE_ORDER
      .filter((builtinTool) => config.tools[builtinTool])
      .map((builtinTool) => ({
        active: tool === builtinTool,
        kind: 'builtin-tool' as const,
        tool: builtinTool,
      })),
    ...customTools.map((customTool) => ({
      active: tool === customTool.id,
      ariaLabel: customTool.ariaLabel,
      kind: 'custom-tool' as const,
      label: customTool.label,
      title: customTool.title,
      tool: customTool.id,
    })),
  ]
}
