import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App Assembly contract boundaries', () => {
  it('keeps Canvas App Assembly input explicit instead of mirroring output', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )

    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssemblyInput =',
    )
    expect(typeContractFile.source).toContain(
      'CanvasAppExtensionAssemblyInput &',
    )
    expect(typeContractFile.source).not.toContain('Partial<CanvasAppAssembly>')
  })


  it('keeps App Assembly type contracts behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblySnapshot.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const modelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )

    expect(assemblyFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(assemblyFile.source).not.toContain(
      'export type CanvasAppAssembly = {',
    )
    expect(assemblyFile.source).not.toContain(
      'export type CanvasAppAssemblyInput = {',
    )
    expect(typeContractFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssembly = CanvasAppExtensionBundle & {',
    )
    expect(typeContractFile.source).toContain(
      "from './CanvasAppExtensionAssemblyTypes'",
    )
    expect(typeContractFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssemblyInput =',
    )
    for (const assemblyInputContract of [
      'CanvasAppExtensionAssemblyInput &',
      'CanvasAppAffordanceAssemblyInput &',
      'CanvasAppComponentAssemblyInput &',
      'CanvasAppAdapterAssemblyInput &',
      'CanvasAppWorkspaceAssemblyInput',
    ]) {
      expect(typeContractFile.source).toContain(assemblyInputContract)
    }
    expect(typeContractFile.source).not.toContain(
      'affordanceConfig?: CanvasAffordanceConfigInput',
    )
    expect(typeContractFile.source).not.toContain(
      'componentLibrary?: CanvasComponentLibrary',
    )
    expect(typeContractFile.source).not.toContain(
      'customCreationTools: readonly',
    )
    expect(typeContractFile.source).not.toContain(
      'customItemRenderers: CanvasAppCustomItemRenderers',
    )
    expect(typeContractFile.source).not.toContain(
      'customItemValidators: CanvasCustomItemValidators',
    )
    expect(typeContractFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(typeContractFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_ASSEMBLY',
    )
    expect(typeContractFile.source).not.toContain('snapshotCanvasAppAssembly')
    expect(snapshotFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(contractsFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(modelFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(defaultAssemblyFile.source).toContain(
      "from './CanvasAppAssemblyTypes'",
    )
    expect(getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    ).source).toContain("from './CanvasAppExtensionAssemblyTypes'")
  })


  it('keeps custom item registries as Assembly output, not input', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const inputContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyInputTypes.ts',
    )
    const extensionInputFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssemblyTypes.ts',
    )

    expect(typeContractFile.source).toContain(
      'CanvasAppExtensionAssemblyInput',
    )
    expect(extensionInputFile.source).toContain(
      'customItemModules?: readonly CanvasAppCustomItemModule[]',
    )
    expect(inputContractFile.source).toContain(
      'affordanceConfig?: CanvasAffordanceConfigInput',
    )
    expect(inputContractFile.source).toContain(
      'componentLibrary?: CanvasAppComponentLibrary',
    )
    expect(inputContractFile.source).not.toContain(
      'componentLibrary?: CanvasComponentLibrary',
    )
    expect(typeContractFile.source).not.toMatch(
      /\b(customCreationTools|customItemRenderers|customItemValidators)\?:/,
    )
    expect(extensionInputFile.source).not.toMatch(
      /\b(customCreationTools|customItemRenderers|customItemValidators)\?:/,
    )
  })


  it('keeps App Assembly child input contracts behind a named type module', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const inputContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyInputTypes.ts',
    )
    const componentAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssembly.ts',
    )
    const adapterAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterAssembly.ts',
    )
    const workspaceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssembly.ts',
    )
    const affordanceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceAssembly.ts',
    )

    expect(typeContractFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    for (const inputContract of [
      'export type CanvasAppAffordanceAssemblyInput',
      'export type CanvasAppComponentAssemblyInput',
      'export type CanvasAppAdapterAssemblyInput',
      'export type CanvasAppWorkspaceAssemblyInput',
    ]) {
      expect(inputContractFile.source).toContain(inputContract)
    }
    for (const assemblyFile of [
      componentAssemblyFile,
      adapterAssemblyFile,
      workspaceAssemblyFile,
      affordanceAssemblyFile,
    ]) {
      expect(assemblyFile.source).toContain(
        "from './CanvasAppAssemblyInputTypes'",
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppComponentAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppAdapterAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppWorkspaceAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppAffordanceAssemblyInput = {',
      )
    }
  })

})
