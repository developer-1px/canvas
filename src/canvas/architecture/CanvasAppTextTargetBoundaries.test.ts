import { describe, expect, it } from 'vitest'

import { getSourceFile, sourceFiles } from './CanvasArchitectureTestSources'

const CANVAS_APP_TEXT_TARGET_SEAM_PATH =
  'src/canvas/app/affordances/editing/text-editor/CanvasAppTextTarget.ts'

const HOST_EDITABLE_TEXT_HOW =
  /\b(isCanvasEditableTextItem|getCanvasEditableTextValue|getCommittedCanvasEditableTextValue|getCanvasEditableTextBounds|shouldCommitCanvasEditableTextOnEnter|getCanvasEditableTextPatchUpdates|getCanvasEditableTextPatchField|getCanvasEditableTextPatchOperation)\b/

describe('Canvas app text target boundaries', () => {
  it('keeps app editable text consumption behind the app text target seam', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/rendering/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx') &&
        file.path !== CANVAS_APP_TEXT_TARGET_SEAM_PATH,
      )
      .flatMap((file) =>
        HOST_EDITABLE_TEXT_HOW.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps the app text target seam on the foundation contract', () => {
    const seamFile = getSourceFile(CANVAS_APP_TEXT_TARGET_SEAM_PATH)

    expect(seamFile.source).toContain('CanvasExtensionTextTargetContract')
    expect(seamFile.source).toContain('CANVAS_WHITEBOARD_TEXT_TARGET')
  })
})
