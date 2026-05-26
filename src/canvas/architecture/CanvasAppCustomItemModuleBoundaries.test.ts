import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App custom item module boundaries', () => {
  it('keeps App custom item module runtime behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModules.ts',
    )
    const assemblyFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleContracts.ts',
    )
    const runtimeFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleRuntime.ts',
    )

    expect(moduleFile.source).not.toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(contractsFile.source).not.toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(assemblyFile.source).toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(moduleFile.source).not.toContain('Omit<')
    expect(moduleFile.source).not.toContain('normalizeCanvasItems')
    expect(moduleFile.source).not.toContain('createModuleItem(context)')
    expect(moduleFile.source).not.toContain('validateItem(item)')
    expect(runtimeFile.source).toContain('normalizeCanvasItems')
    expect(runtimeFile.source).toContain('createModuleItem(context)')
    expect(runtimeFile.source).toContain('validateItem(item)')
    expect(runtimeFile.source).toContain(
      'type CanvasAppCustomItemModuleValidatorContext',
    )
    expect(runtimeFile.source).not.toContain('Pick<')
    expect(runtimeFile.source).not.toContain('Parameters<')
    expect(runtimeFile.source).toContain('catch')
  })


  it('keeps App custom item module contracts behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModules.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleContracts.ts',
    )

    expect(moduleFile.source).toContain(
      "from './CanvasAppCustomItemModuleContracts'",
    )
    expect(moduleFile.source).not.toContain(
      'function assertCanvasAppCustomItemModule',
    )
    expect(moduleFile.source).not.toContain(
      'Duplicate canvas custom item module',
    )
    expect(moduleFile.source).not.toContain(
      'Unknown disabled canvas custom item module',
    )
    expect(moduleFile.source).not.toContain("label: 'renderer'")
    expect(moduleFile.source).not.toContain("label: 'validator'")
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomItemModule',
    )
    expect(contractsFile.source).toContain(
      'Duplicate canvas custom item module',
    )
    expect(contractsFile.source).toContain(
      'Unknown disabled canvas custom item module',
    )
    expect(contractsFile.source).toContain("label: 'renderer'")
    expect(contractsFile.source).toContain("label: 'validator'")
    expect(contractsFile.source).toContain('requires ${label}')
  })


  it('keeps App custom item module snapshot behavior behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModules.ts',
    )
    const assemblyFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModuleSnapshot.ts',
    )
    const descriptorSnapshotFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppDescriptorSnapshot.ts',
    )
    const extensionBundleFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionBundle.ts',
    )

    expect(moduleFile.source).toContain(
      "from './CanvasAppCustomItemModuleSnapshot'",
    )
    expect(assemblyFile.source).toContain(
      "from './CanvasAppCustomItemModuleSnapshot'",
    )
    expect(moduleFile.source).not.toContain(
      'function snapshotCanvasAppCustomItemModuleAssembly',
    )
    expect(moduleFile.source).not.toContain(
      'function snapshotCanvasAppCustomItemModule(',
    )
    expect(moduleFile.source).not.toContain('function freezeCanvasAppRecord')
    expect(moduleFile.source).not.toContain('function freezeCanvasAppArray')
    expect(snapshotFile.source).toContain(
      'export function snapshotCanvasAppCustomItemModuleAssembly',
    )
    expect(snapshotFile.source).toContain(
      'export function snapshotCanvasAppCustomItemModule(',
    )
    expect(snapshotFile.source).toContain(
      "from '../CanvasAppDescriptorSnapshot'",
    )
    expect(snapshotFile.source).toContain(
      "from '../CanvasAppExtensionBundle'",
    )
    expect(snapshotFile.source).toContain('snapshotCanvasAppExtensionBundle')
    expect(snapshotFile.source).not.toContain(
      'customCommands: snapshotCanvasAppDescriptorArray(assembly.customCommands)',
    )
    expect(snapshotFile.source).not.toContain(
      'customItemRenderers: snapshotCanvasAppRecord(assembly.customItemRenderers)',
    )
    expect(snapshotFile.source).not.toContain('function freezeCanvasAppRecord')
    expect(snapshotFile.source).not.toContain('function freezeCanvasAppArray')
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppDescriptorArray',
    )
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppShortcutDescriptorArray',
    )
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppRecord',
    )
    expect(extensionBundleFile.source).toContain(
      'export function snapshotCanvasAppExtensionBundle',
    )
  })


  it('keeps App custom item validator contracts behind a named module', () => {
    const assemblyContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const validatorContractsFile = getSourceFile(
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts.ts',
    )

    expect(assemblyContractsFile.source).toContain(
      "from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'",
    )
    expect(assemblyContractsFile.source).not.toContain(
      'custom item validator ${kind}',
    )
    expect(assemblyContractsFile.source).not.toContain('validate strategy')
    expect(validatorContractsFile.source).toContain(
      'export type CanvasAppCustomItemValidator',
    )
    expect(validatorContractsFile.source).toContain(
      'export type CanvasAppCustomItemValidators',
    )
    expect(validatorContractsFile.source).toContain(
      'export function assertCanvasAppCustomItemValidators',
    )
    expect(validatorContractsFile.source).toContain("from '../../../entities'")
    expect(validatorContractsFile.source).not.toContain("from '../../host'")
    expect(validatorContractsFile.source).toContain(
      'custom item validator ${kind}',
    )
    expect(validatorContractsFile.source).toContain('validate strategy')
  })

})
