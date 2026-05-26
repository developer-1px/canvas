import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App Assembly output boundaries', () => {
  it('keeps App Assembly output contracts behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const componentContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssemblyContracts.ts',
    )
    const adapterContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterContracts.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAssemblyContracts'",
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppAssembly',
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(assemblyFile.source).not.toContain(
      'getPresentation mismatch',
    )
    expect(assemblyFile.source).not.toContain('getTemplate mismatch')
    expect(assemblyFile.source).not.toContain('validate strategy')
    expect(assemblyFile.source).not.toContain('command adapter')
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppAssembly',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppComponentAssembly',
    )
    expect(contractsFile.source).not.toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppAssemblyAdapters',
    )
    expect(contractsFile.source).not.toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(contractsFile.source).not.toContain('getPresentation mismatch')
    expect(contractsFile.source).not.toContain('getTemplate mismatch')
    expect(contractsFile.source).not.toContain('validate strategy')
    expect(contractsFile.source).not.toContain('command adapter')
    expect(componentContractsFile.source).toContain(
      'export function assertCanvasAppComponentAssembly',
    )
    expect(componentContractsFile.source).toContain(
      'export type CanvasAppComponentAssemblyContract',
    )
    expect(componentContractsFile.source).toContain(
      'export type CanvasAppComponentLibrary',
    )
    expect(componentContractsFile.source).toContain(
      'export type CanvasAppComponentTemplate',
    )
    expect(componentContractsFile.source).not.toContain(
      'type CanvasComponentLibrary,',
    )
    expect(componentContractsFile.source).not.toContain('Pick<')
    expect(componentContractsFile.source).not.toContain('CanvasAppAssembly')
    expect(componentContractsFile.source).toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(componentContractsFile.source).toContain(
      'function assertCanvasComponentPresentationRendererCoverage',
    )
    expect(componentContractsFile.source).toContain('getPresentation mismatch')
    expect(componentContractsFile.source).toContain('getTemplate mismatch')
    expect(componentContractsFile.source).toContain(
      'Missing canvas app component presentation renderer',
    )
    expect(adapterContractsFile.source).toContain(
      'export function assertCanvasAppAssemblyAdapters',
    )
    expect(adapterContractsFile.source).toContain(
      'export type CanvasAppAssemblyAdapters',
    )
    expect(adapterContractsFile.source).toContain(
      'export type CanvasAppItemAdapters',
    )
    expect(adapterContractsFile.source).toContain("from '../../entities'")
    expect(adapterContractsFile.source).not.toContain('Pick<')
    expect(adapterContractsFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterContractsFile.source).toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(adapterContractsFile.source).toContain('command adapter')
    expect(adapterContractsFile.source).toContain('item layer adapter')
    expect(adapterContractsFile.source).toContain('stage adapter')
  })


  it('keeps App workspace assembly contracts behind a named module', () => {
    const assemblyContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const workspaceContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssemblyContracts.ts',
    )

    expect(assemblyContractsFile.source).toContain(
      "from './CanvasAppWorkspaceAssemblyContracts'",
    )
    expect(assemblyContractsFile.source).toContain(
      'assertCanvasAppWorkspaceAssembly',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'normalizeCanvasItems',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'createCanvasItemReadModel',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'workspaceStorageProvider',
    )
    expect(assemblyContractsFile.source).not.toContain('initialSelection')
    expect(workspaceContractsFile.source).toContain(
      'export function assertCanvasAppWorkspaceAssembly',
    )
    expect(workspaceContractsFile.source).toContain(
      'export type CanvasAppWorkspaceAssemblyContract',
    )
    expect(workspaceContractsFile.source).toContain("from '../../entities'")
    expect(workspaceContractsFile.source).not.toContain('Pick<')
    expect(workspaceContractsFile.source).not.toContain('CanvasAppAssembly')
    expect(workspaceContractsFile.source).toContain('normalizeCanvasItems')
    expect(workspaceContractsFile.source).toContain('getCanvasItemIds')
    expect(workspaceContractsFile.source).toContain(
      'getCanvasValidSelection',
    )
    expect(workspaceContractsFile.source).toContain(
      'workspaceStorageProvider',
    )
    expect(workspaceContractsFile.source).toContain('initialSelection')
    expect(workspaceContractsFile.source).toContain(
      'Invalid assembly initial selection',
    )
  })


  it('keeps App workspace assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const workspaceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppWorkspaceAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppWorkspaceAssembly',
    )
    expect(assemblyFile.source).not.toContain('normalizeCanvasItems')
    expect(assemblyFile.source).not.toContain(
      'input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems',
    )
    expect(assemblyFile.source).not.toContain(
      'input.initialItems === undefined',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'export function createCanvasAppWorkspaceAssembly',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'export type CanvasAppWorkspaceAssembly',
    )
    expect(workspaceAssemblyFile.source).not.toContain('Pick<')
    expect(workspaceAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(workspaceAssemblyFile.source).toContain('normalizeCanvasItems')
    expect(workspaceAssemblyFile.source).toContain(
      'input.initialItems === undefined',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'workspaceStorageProvider',
    )
  })


  it('keeps App affordance assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const affordanceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAffordanceAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppAffordanceAssembly',
    )
    expect(assemblyFile.source).not.toContain('createCanvasAffordanceConfig')
    expect(assemblyFile.source).not.toContain(
      'input.affordanceConfig === undefined',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'export function createCanvasAppAffordanceAssembly',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'export type CanvasAppAffordanceAssembly',
    )
    expect(affordanceAssemblyFile.source).not.toContain('Pick<')
    expect(affordanceAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(affordanceAssemblyFile.source).toContain(
      'createCanvasAffordanceConfig',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'input.affordanceConfig === undefined',
    )
  })

})
