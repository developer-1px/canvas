import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas App IO boundaries', () => {
  it('keeps browser image IO behind App image modules', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const imageModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppImageModel.ts',
    )
    const imageControlsFile = getSourceFile(
      'src/canvas/ui/image/CanvasImageControls.tsx',
    )
    const imageInsertionFile = getSourceFile(
      'src/canvas/app/image/CanvasImageInsertion.ts',
    )
    const imageImportFile = getSourceFile(
      'src/canvas/app/image/CanvasImageImport.ts',
    )
    const imageClipboardFile = getSourceFile(
      'src/canvas/app/image/CanvasImageClipboard.ts',
    )
    const imageExportFile = getSourceFile(
      'src/canvas/app/image/CanvasImageExport.ts',
    )
    const stageElementFile = getSourceFile(
      'src/canvas/app/stage/CanvasAppStageElement.ts',
    )
    const browserImageHow =
      /\b(FileReader|ClipboardItem|XMLSerializer|toBlob|readAsDataURL|createObjectURL|navigator\.clipboard)\b/

    expect(appModelFile.source).toContain(
      "from './useCanvasAppImageModel'",
    )
    expect(appModelFile.source).not.toMatch(browserImageHow)
    expect(imageModelFile.source).toContain(
      "from '../image/useCanvasImageControls'",
    )
    expect(imageControlsFile.source).not.toMatch(browserImageHow)
    expect(imageInsertionFile.source).toContain(
      'export function insertCanvasImageSource',
    )
    expect(imageInsertionFile.source).toContain(
      'export function getCanvasImageInsertCenter',
    )
    expect(imageImportFile.source).toContain('FileReader')
    expect(imageImportFile.source).toContain('readAsDataURL')
    expect(imageClipboardFile.source).toContain('navigator.clipboard')
    expect(imageClipboardFile.source).toContain('ClipboardItem')
    expect(imageExportFile.source).toContain('getSelectionSvgSnapshot')
    expect(imageExportFile.source).toContain('toBlob')
    expect(imageExportFile.source).toContain('createObjectURL')
    expect(stageElementFile.source).toContain('getSelectionSvgSnapshot')
    expect(stageElementFile.source).toContain('XMLSerializer')
    expect(stageElementFile.source).not.toContain('toBlob')
    expect(stageElementFile.source).not.toContain('ClipboardItem')
  })


  it('keeps browser table import IO behind App table modules', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const tableModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppTableImportModel.ts',
    )
    const tableImportHookFile = getSourceFile(
      'src/canvas/app/table/useCanvasTableImport.ts',
    )
    const tableImportFile = getSourceFile(
      'src/canvas/app/table/CanvasTableImport.ts',
    )
    const hostTableFile = getSourceFile(
      'src/canvas/host/component/CanvasTableComponent.ts',
    )
    const browserTableHow =
      /\b(FileReader|DataTransfer|ClipboardEvent|DragEvent|window\.addEventListener)\b/

    expect(appModelFile.source).toContain(
      "from './useCanvasAppTableImportModel'",
    )
    expect(appModelFile.source).not.toMatch(browserTableHow)
    expect(tableModelFile.source).toContain(
      "from '../table/useCanvasTableImport'",
    )
    expect(tableImportHookFile.source).toContain('window.addEventListener')
    expect(tableImportHookFile.source).toContain('ClipboardEvent')
    expect(tableImportHookFile.source).toContain('DragEvent')
    expect(tableImportFile.source).toContain('FileReader')
    expect(tableImportFile.source).toContain('readAsText')
    expect(tableImportFile.source).toContain('createCanvasTableComponentItem')
    expect(hostTableFile.source).toContain(
      'export function createCanvasTableComponentItem',
    )
    expect(hostTableFile.source).not.toMatch(browserTableHow)
  })


  it('keeps browser link preview import IO behind App link modules', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const linkPreviewModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppLinkPreviewImportModel.ts',
    )
    const linkPreviewImportHookFile = getSourceFile(
      'src/canvas/app/link/useCanvasLinkPreviewImport.ts',
    )
    const linkPreviewImportFile = getSourceFile(
      'src/canvas/app/link/CanvasLinkPreviewImport.ts',
    )
    const linkPreviewInspectorPanelFile = getSourceFile(
      'src/canvas/app/link/CanvasLinkPreviewInspectorPanel.tsx',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )
    const hostLinkPreviewFile = getSourceFile(
      'src/canvas/host/component/CanvasLinkPreviewComponent.ts',
    )
    const browserLinkPreviewHow =
      /\b(DataTransfer|ClipboardEvent|DragEvent|window\.addEventListener)\b/

    expect(appModelFile.source).toContain(
      "from './useCanvasAppLinkPreviewImportModel'",
    )
    expect(appModelFile.source).not.toMatch(browserLinkPreviewHow)
    expect(linkPreviewModelFile.source).toContain(
      "from '../link/useCanvasLinkPreviewImport'",
    )
    expect(linkPreviewImportHookFile.source).toContain(
      'window.addEventListener',
    )
    expect(linkPreviewImportHookFile.source).toContain('ClipboardEvent')
    expect(linkPreviewImportHookFile.source).toContain('DragEvent')
    expect(linkPreviewImportFile.source).toContain(
      'createCanvasLinkPreviewComponentItem',
    )
    expect(linkPreviewInspectorPanelFile.source).toContain(
      'replaceCanvasLinkPreviewComponentsWithSourceText',
    )
    expect(linkPreviewInspectorPanelFile.source).toContain(
      'replaceCanvasLinkPreviewComponentsOrientation',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../link/CanvasLinkPreviewInspectorPanel'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'CANVAS_LINK_PREVIEW_INSPECTOR_PANEL',
    )
    expect(hostLinkPreviewFile.source).toContain(
      'export function createCanvasLinkPreviewComponentItem',
    )
    expect(hostLinkPreviewFile.source).toContain(
      'export function replaceCanvasLinkPreviewComponentsWithSourceText',
    )
    expect(hostLinkPreviewFile.source).toContain(
      'export function replaceCanvasLinkPreviewComponentsOrientation',
    )
    expect(hostLinkPreviewFile.source).not.toMatch(browserLinkPreviewHow)
  })


  it('keeps browser workspace storage behind the persistence provider seam', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        file.path !== 'src/canvas/app/document/CanvasWorkspacePersistence.ts' &&
        file.path !== 'src/canvas/app/document/CanvasWorkspacePersistence.test.ts',
      )
      .flatMap((file) =>
        /window\.localStorage|CANVAS_WORKSPACE_STORAGE_KEY/.test(file.source)
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
  })

})
