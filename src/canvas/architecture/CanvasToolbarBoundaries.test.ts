import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas toolbar boundaries', () => {
  it('keeps toolbar item grammar behind a named module', () => {
    const toolbarFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbar.tsx',
    )
    const itemRendererFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarItemRenderer.tsx',
    )
    const itemRenderDispatchFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarItemRenderDispatch.tsx',
    )
    const itemsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarItems.ts',
    )
    const commandItemsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandItems.ts',
    )
    const commandCatalogFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandCatalog.ts',
    )
    const commandContractsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandContracts.ts',
    )
    const commandDispatchFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandDispatch.ts',
    )
    const toolItemsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarToolItems.ts',
    )

    expect(toolbarFile.source).toContain("from './CanvasToolbarItems'")
    expect(toolbarFile.source).toContain("from './CanvasToolbarItemRenderer'")
    expect(toolbarFile.source).not.toContain(
      "from './CanvasToolbarCommandDispatch'",
    )
    expect(toolbarFile.source).not.toContain('config.commands.')
    expect(toolbarFile.source).not.toContain('config.tools.')
    expect(toolbarFile.source).not.toContain('customCommands.map')
    expect(toolbarFile.source).not.toContain('customTools.map')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES.select')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOLBAR_COMMAND_ICONS')
    expect(toolbarFile.source).not.toContain("item.kind === 'builtin-tool'")
    expect(toolbarFile.source).not.toContain('switch (action.kind)')
    expect(toolbarFile.source).not.toContain('onAlign:')
    expect(itemRendererFile.source).toContain(
      'export function renderCanvasToolbarItem',
    )
    expect(itemRendererFile.source).toContain(
      "from './CanvasToolbarItemRenderDispatch'",
    )
    expect(itemRendererFile.source).not.toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(itemRendererFile.source).not.toContain(
      'CANVAS_TOOLBAR_COMMAND_ICONS',
    )
    expect(itemRendererFile.source).not.toContain("item.kind === '")
    expect(itemRenderDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_ITEM_RENDER_STRATEGIES',
    )
    expect(itemRenderDispatchFile.source).toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(itemRenderDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_ICONS',
    )
    expect(itemRenderDispatchFile.source).toContain(
      'renderCanvasToolbarBuiltinToolItem',
    )
    expect(itemRenderDispatchFile.source).toContain(
      'runCanvasToolbarCommandAction',
    )
    expect(itemRenderDispatchFile.source).toContain(
      "from './CanvasToolbarCommandContracts'",
    )
    expect(itemsFile.source).toContain(
      'export function getCanvasToolbarGroups',
    )
    expect(itemsFile.source).toContain("from './CanvasToolbarToolItems'")
    expect(itemsFile.source).toContain("from './CanvasToolbarCommandItems'")
    expect(itemsFile.source).not.toContain('getCanvasToolbarAlignItem')
    expect(itemsFile.source).not.toContain('getCanvasToolbarDistributeItem')
    expect(itemsFile.source).not.toContain('config.tools[builtinTool]')
    expect(itemsFile.source).not.toContain('CANVAS_TOOLBAR_BUILTIN_TOOLS')
    expect(itemsFile.source).toContain('customCommands.flatMap')
    expect(itemsFile.source).not.toContain('customTools.map')
    expect(commandItemsFile.source).toContain(
      'export function getCanvasToolbarCommandGroups',
    )
    expect(commandItemsFile.source).toContain(
      "from './CanvasToolbarCommandCatalog'",
    )
    expect(commandItemsFile.source).not.toContain("command: 'alignLeft'")
    expect(commandItemsFile.source).not.toContain(
      "command: 'distributeHorizontal'",
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarAlignItem',
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarDistributeItem',
    )
    expect(commandCatalogFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_GROUPS',
    )
    expect(commandCatalogFile.source).toContain("command: 'alignLeft'")
    expect(commandCatalogFile.source).toContain(
      "command: 'distributeHorizontal'",
    )
    expect(commandCatalogFile.source).not.toContain('config.commands')
    expect(commandCatalogFile.source).not.toContain('availability')
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasToolbarCommandAction',
    )
    expect(commandContractsFile.source).toContain(
      'export type CanvasToolbarCommandHandlers',
    )
    expect(commandContractsFile.source).toContain('onAlign:')
    expect(commandContractsFile.source).not.toContain(
      'runCanvasToolbarCommandAction',
    )
    expect(commandContractsFile.source).not.toContain(
      'CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS',
    )
    expect(commandDispatchFile.source).toContain(
      "from './CanvasToolbarCommandContracts'",
    )
    expect(commandDispatchFile.source).not.toContain(
      'export type CanvasToolbarCommandHandlers',
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS',
    )
    expect(commandDispatchFile.source).not.toContain('switch (action.kind)')
    expect(commandDispatchFile.source).not.toContain(
      'assertUnhandledCanvasToolbarCommandAction',
    )
    expect(toolItemsFile.source).toContain(
      'export function getCanvasToolbarToolItems',
    )
    expect(toolItemsFile.source).toContain('CANVAS_TOOL_AFFORDANCE_ORDER')
    expect(toolItemsFile.source).not.toContain('CANVAS_TOOLBAR_BUILTIN_TOOLS')
    expect(toolItemsFile.source).toContain('config.tools[builtinTool]')
    expect(toolItemsFile.source).toContain('customTools.map')
  })


  it('passes command availability through toolbar command grammar as one contract', () => {
    const toolbarFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbar.tsx',
    )
    const toolbarItemsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarItems.ts',
    )
    const toolbarCommandItemsFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandItems.ts',
    )
    const toolbarCommandCatalogFile = getSourceFile(
      'src/canvas/app/controls/toolbar/CanvasToolbarCommandCatalog.ts',
    )

    for (const file of [
      toolbarFile,
      toolbarItemsFile,
      toolbarCommandItemsFile,
      toolbarCommandCatalogFile,
    ]) {
      expect(file.source).not.toContain('canAlign: boolean')
      expect(file.source).not.toContain('canDistribute: boolean')
      expect(file.source).not.toContain('canDuplicate: boolean')
      expect(file.source).not.toContain('canGroup: boolean')
    }

    expect(toolbarFile.source).toContain(
      'commandAvailability: CanvasCommandAvailability',
    )
    expect(toolbarItemsFile.source).toContain(
      'commandAvailability: CanvasCommandAvailability',
    )
    expect(toolbarCommandItemsFile.source).toContain(
      'availability: CanvasCommandAvailability',
    )
    expect(toolbarCommandCatalogFile.source).toContain(
      'keyof CanvasCommandAvailability & CanvasCommandId',
    )
    expect(toolbarCommandItemsFile.source).toContain(
      "from './CanvasToolbarCommandCatalog'",
    )
    expect(toolbarCommandItemsFile.source).toContain(
      'const disabled = !availability[descriptor.command]',
    )
  })

})
