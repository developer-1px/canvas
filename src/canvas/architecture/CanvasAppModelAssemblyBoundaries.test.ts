import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App model assembly boundaries', () => {
  it('keeps App Model from distributing Assembly output fields directly', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const assemblyModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )
    const assemblyModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModelContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './CanvasAppAssemblyModel'",
    )
    expect(assemblyModelFile.source).toContain(
      "from './CanvasAppAssemblyModelContracts'",
    )
    expect(assemblyModelFile.source).toContain('): CanvasAppAssemblyModel')
    expect(assemblyModelFile.source).not.toContain(
      'export type CanvasAppAssemblyModel',
    )
    expect(assemblyModelContractsFile.source).toContain(
      'export type CanvasAppAssemblyModel',
    )
    expect(assemblyModelContractsFile.source).not.toContain(
      "from './CanvasAppAssemblyTypes'",
    )
    expect(assemblyModelContractsFile.source).not.toContain(
      'CanvasAppAssembly[',
    )
    for (const assemblyModelContract of [
      'CanvasAppAssemblyAffordanceModel',
      'CanvasAppAssemblyCommandModel',
      'CanvasAppAssemblyComponentModel',
      'CanvasAppAssemblyControlModel',
      'CanvasAppAssemblyExtensionModel',
      'CanvasAppAssemblyInspectorModel',
      'CanvasAppAssemblyPointerModel',
      'CanvasAppAssemblyRenderingModel',
      'CanvasAppAssemblyWorkspaceModel',
    ]) {
      expect(assemblyModelContractsFile.source).toContain(
        `export type ${assemblyModelContract}`,
      )
    }
    for (const assemblyOutputField of [
      'affordanceConfig',
      'componentLibrary',
      'componentPresentationRenderers',
      'customCommands',
      'customCreationTools',
      'customItemRenderers',
      'customItemValidators',
      'inspectorPanels',
      'initialItems',
      'initialSelection',
      'itemAdapters',
      'itemLayerAdapter',
      'stageAdapter',
      'workspaceStorageProvider',
    ]) {
      expect(appModelFile.source).not.toContain(assemblyOutputField)
    }
    for (const consumerContext of [
      'affordance: {',
      'command: {',
      'component: {',
      'control: {',
      'extension: {',
      'inspector: {',
      'pointer: {',
      'rendering: {',
      'workspace: {',
    ]) {
      expect(assemblyModelFile.source).toContain(consumerContext)
    }
  })


  it('keeps App Model from distributing affordance config directly', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const affordanceModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceModel.ts',
    )
    const affordanceModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceModelContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './CanvasAppAffordanceModel'",
    )
    expect(appModelFile.source).toContain(
      'getCanvasAppAffordanceModel(appAssembly.affordance.config)',
    )
    expect(appModelFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(appModelFile.source).not.toContain('canvasAffordanceConfig')
    expect(appModelFile.source).not.toContain('config.overlays')
    expect(affordanceModelFile.source).toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(affordanceModelFile.source).toContain(
      "from './CanvasAppAffordanceModelContracts'",
    )
    expect(affordanceModelFile.source).toContain('): CanvasAppAffordanceModel')
    expect(affordanceModelFile.source).not.toContain(
      'export type CanvasAppAffordanceModel',
    )
    expect(affordanceModelContractsFile.source).toContain(
      'export type CanvasAppAffordanceModel',
    )
    expect(affordanceModelContractsFile.source).toContain(
      'export type CanvasAppAffordanceConfigContext',
    )
    expect(affordanceModelContractsFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    for (const affordanceModelContract of [
      'CanvasAppAffordanceCommandModel',
      'CanvasAppAffordanceControlModel',
      'CanvasAppAffordanceImageModel',
      'CanvasAppAffordanceInteractionModel',
      'CanvasAppAffordanceInspectorModel',
      'CanvasAppAffordanceKeyboardModel',
      'CanvasAppAffordanceLinkPreviewModel',
      'CanvasAppAffordancePointerModel',
      'CanvasAppAffordanceStampModel',
      'CanvasAppAffordanceTableModel',
      'CanvasAppAffordanceTextModel',
      'CanvasAppAffordanceViewportModel',
    ]) {
      expect(affordanceModelContractsFile.source).toContain(
        `export type ${affordanceModelContract}`,
      )
    }
    for (const consumerContext of [
      'command: {',
      'control: {',
      'image: {',
      'interaction: {',
      'inspector: {',
      'keyboard: {',
      'linkPreview: {',
      'pointer: {',
      'stamp: {',
      'table: {',
      'text: {',
      'viewport: {',
    ]) {
      expect(affordanceModelFile.source).toContain(consumerContext)
    }
  })

})
