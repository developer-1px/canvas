import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App custom command boundaries', () => {
  it('keeps App custom command contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasAppCustomCommands.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasAppCustomCommandContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCommandContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppCustomCommands',
    )
    expect(descriptorFile.source).not.toContain("field: 'label'")
    expect(descriptorFile.source).not.toContain("field: 'run'")
    expect(descriptorFile.source).not.toContain(
      'assertCanvasAppExtensionEntries',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomCommands',
    )
    expect(contractsFile.source).toContain("field: 'label'")
    expect(contractsFile.source).toContain("field: 'run'")
    expect(contractsFile.source).toContain(
      'assertCanvasAppExtensionEntries',
    )
  })

})
