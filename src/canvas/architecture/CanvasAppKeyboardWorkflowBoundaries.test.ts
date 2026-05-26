import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App keyboard workflow boundaries', () => {
  it('keeps app keyboard handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppKeyboardModel.ts',
    )
    const keyboardConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppKeyboardConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppKeyboardModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../keyboard/useCanvasKeyboardShortcuts'",
    )
    expect(appModelFile.source).not.toContain('useCanvasKeyboardShortcuts')
    expect(keyboardModelFile.source).toContain(
      "from '../keyboard/useCanvasKeyboardShortcuts'",
    )
    expect(keyboardModelFile.source).toContain(
      "from './CanvasAppKeyboardConsumerContracts'",
    )
    expect(keyboardModelFile.source).toContain(
      'export function useCanvasAppKeyboardModel',
    )
    expect(keyboardModelFile.source).not.toContain(
      'CanvasKeyboardShortcutHandlers',
    )
    expect(keyboardModelFile.source).not.toContain('Pick<')
    expect(keyboardModelFile.source).toContain('command.copySelection')
    expect(keyboardModelFile.source).toContain('interaction.setSpaceDown')
    expect(keyboardModelFile.source).toContain('viewport.zoomBy')
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardModelInput',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardCommandContext',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardInteractionContext',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardViewportContext',
    )
    expect(keyboardConsumerContractsFile.source).not.toContain(
      'useCanvasKeyboardShortcuts',
    )
  })

})
