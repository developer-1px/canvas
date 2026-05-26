import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App Assembly composition boundaries', () => {
  it('keeps App component composition behind a named Assembly module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const componentAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppComponentAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'createCanvasAppComponentPresentationRenderers',
    )
    expect(assemblyFile.source).not.toContain('input.componentLibrary ??')
    expect(componentAssemblyFile.source).toContain(
      'export function createCanvasAppComponentAssembly',
    )
    expect(componentAssemblyFile.source).toContain(
      'createCanvasAppComponentPresentationRenderers',
    )
    expect(componentAssemblyFile.source).toContain(
      'input.componentLibrary ?? defaults.componentLibrary',
    )
    expect(componentAssemblyFile.source).not.toContain('Pick<')
    expect(componentAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(componentAssemblyFile.source).toContain(
      'CanvasAppComponentAssemblyContract',
    )
  })


  it('keeps App extension composition behind a named Assembly module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const extensionAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppExtensionAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    expect(assemblyFile.source).not.toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(assemblyFile.source).not.toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(extensionAssemblyFile.source).toContain(
      'export function createCanvasAppExtensionAssembly',
    )
    expect(extensionAssemblyFile.source).toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    expect(extensionAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(extensionAssemblyFile.source).toContain(
      'mergeCanvasAppExtensionBundle',
    )
    expect(extensionAssemblyFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    expect(extensionAssemblyFile.source).toContain(
      "owner: 'app assembly'",
    )
    expect(extensionAssemblyFile.source).not.toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(extensionAssemblyFile.source).not.toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(assemblyFile.source).toContain('...extensionAssembly')
    expect(assemblyFile.source).not.toContain(
      'customCommands: extensionAssembly.customCommands',
    )
    expect(assemblyFile.source).not.toContain(
      'customCreationTools: extensionAssembly.customCreationTools',
    )
    expect(assemblyFile.source).not.toContain(
      'inspectorPanels: extensionAssembly.inspectorPanels',
    )
  })


  it('keeps App extension bundle slot merging behind a named module', () => {
    const extensionAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    )
    const customItemModuleFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModules.ts',
    )
    const customItemModuleAssemblyFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const customItemModuleRuntimeFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleRuntime.ts',
    )
    const extensionBundleFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionBundle.ts',
    )

    expect(extensionAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(customItemModuleAssemblyFile.source).toContain(
      "from '../CanvasAppExtensionBundle'",
    )
    expect(customItemModuleFile.source).not.toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(customItemModuleRuntimeFile.source).toContain(
      'getCanvasAppCustomItemModuleExtensionBundle',
    )
    expect(customItemModuleRuntimeFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    for (const consumerFile of [
      extensionAssemblyFile,
      customItemModuleAssemblyFile,
    ]) {
      expect(consumerFile.source).not.toContain(
        'appendUniqueCanvasAppExtensionEntries',
      )
      expect(consumerFile.source).not.toContain(
        'mergeUniqueCanvasAppExtensionRecord',
      )
      expect(consumerFile.source).not.toContain("label: 'custom command'")
      expect(consumerFile.source).not.toContain(
        "label: 'custom item renderer'",
      )
    }
    expect(extensionBundleFile.source).toContain(
      'export type CanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function createEmptyCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function mergeCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function snapshotCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'CanvasAppExtensionBundleInput',
    )
    expect(extensionBundleFile.source).toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(extensionBundleFile.source).toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(extensionBundleFile.source).toContain("label: 'custom command'")
    expect(extensionBundleFile.source).toContain(
      "label: 'custom item renderer'",
    )
  })

})
