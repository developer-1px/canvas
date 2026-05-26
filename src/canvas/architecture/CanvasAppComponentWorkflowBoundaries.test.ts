import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App component workflow boundaries', () => {
  it('keeps app component insertion wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const componentModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppComponentModel.ts',
    )
    const componentHookFile = getSourceFile(
      'src/canvas/app/authoring/component/useCanvasComponentInsertion.ts',
    )
    const componentExecutionFile = getSourceFile(
      'src/canvas/app/authoring/component/CanvasComponentInsertionExecution.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppComponentModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../authoring/component/useCanvasComponentInsertion'",
    )
    expect(appModelFile.source).not.toContain('useCanvasComponentInsertion')
    expect(componentModelFile.source).toContain(
      "from '../authoring/component/useCanvasComponentInsertion'",
    )
    expect(componentModelFile.source).toContain(
      "from './CanvasAppComponentConsumerContracts'",
    )
    expect(componentModelFile.source).toContain(
      'CanvasAppComponentModelInput',
    )
    expect(componentModelFile.source).toContain('CanvasAppComponentModel')
    expect(componentModelFile.source).not.toContain(
      'type CanvasAppComponentCommandModel',
    )
    expect(componentModelFile.source).not.toContain(
      'type CanvasAppComponentInteractionModel',
    )
    expect(componentModelFile.source).not.toContain(
      'type CanvasAppComponentWorkspaceModel',
    )
    expect(componentModelFile.source).not.toContain(
      'type UseCanvasAppComponentModelArgs',
    )
    expect(componentModelFile.source).toContain(
      'export function useCanvasAppComponentModel',
    )
    expect(componentModelFile.source).toContain('componentLibrary')
    expect(componentModelFile.source).toContain('selection: workspace.selection')
    expect(componentModelFile.source).toContain('control: {')
    expect(componentModelFile.source).toContain(
      'onInsertComponent: insertComponent',
    )
    const consumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentConsumerContracts.ts',
    )
    for (const componentContract of [
      'CanvasAppComponentModelInput',
      'CanvasAppComponentCommandModel',
      'CanvasAppComponentInteractionModel',
      'CanvasAppComponentWorkspaceModel',
      'CanvasAppComponentControlContext',
      'CanvasAppComponentModel',
    ]) {
      expect(consumerContractsFile.source).toContain(
        `export type ${componentContract}`,
      )
    }
    expect(componentHookFile.source).toContain(
      "from './CanvasComponentInsertionExecution'",
    )
    expect(componentHookFile.source).toContain('insertCanvasComponent({')
    expect(componentHookFile.source).not.toContain('x: 120')
    expect(componentHookFile.source).not.toContain("type: 'add'")
    expect(componentHookFile.source).not.toContain("setTool('select')")
    expect(componentExecutionFile.source).toContain(
      'export function insertCanvasComponent',
    )
    expect(componentExecutionFile.source).toContain('x: 120')
    expect(componentExecutionFile.source).toContain("type: 'add'")
    expect(componentExecutionFile.source).toContain("setTool('select')")
    expect(appModelFile.source).not.toContain('components.insertComponent')
  })


  it('keeps checklist component editing behind Host and App checklist modules', () => {
    const structuredRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgStructuredComponentRenderer.tsx',
    )
    const checklistInspectorPanelFile = getSourceFile(
      'src/canvas/app/editing/component-panels/checklist/CanvasChecklistInspectorPanel.tsx',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )
    const hostChecklistFile = getSourceFile(
      'src/canvas/host/component/CanvasChecklistComponent.ts',
    )
    const browserChecklistHow =
      /\b(DataTransfer|ClipboardEvent|DragEvent|window\.addEventListener)\b/

    expect(structuredRendererFile.source).toContain('getCanvasChecklistItems')
    expect(structuredRendererFile.source).toContain(
      'isCanvasChecklistItemChecked',
    )
    expect(checklistInspectorPanelFile.source).toContain(
      'replaceCanvasChecklistComponentItemChecked',
    )
    expect(checklistInspectorPanelFile.source).toContain(
      'replaceCanvasChecklistComponentItemText',
    )
    expect(checklistInspectorPanelFile.source).toContain(
      'replaceCanvasChecklistComponentsWithAddedItem',
    )
    expect(checklistInspectorPanelFile.source).toContain(
      'replaceCanvasChecklistComponentsWithoutItem',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../editing/component-panels/checklist/CanvasChecklistInspectorPanel'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'CANVAS_CHECKLIST_INSPECTOR_PANEL',
    )
    expect(hostChecklistFile.source).toContain(
      'export function replaceCanvasChecklistComponentItemChecked',
    )
    expect(hostChecklistFile.source).toContain(
      'export function replaceCanvasChecklistComponentsWithAddedItem',
    )
    expect(hostChecklistFile.source).not.toMatch(browserChecklistHow)
  })


  it('keeps kanban component editing behind Host and App kanban modules', () => {
    const structuredRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgStructuredComponentRenderer.tsx',
    )
    const kanbanInspectorPanelFile = getSourceFile(
      'src/canvas/app/editing/component-panels/kanban/CanvasKanbanInspectorPanel.tsx',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )
    const hostKanbanFile = getSourceFile(
      'src/canvas/host/component/CanvasKanbanComponent.ts',
    )
    const browserKanbanHow =
      /\b(DataTransfer|ClipboardEvent|DragEvent|window\.addEventListener)\b/

    expect(structuredRendererFile.source).toContain('getCanvasKanbanCards')
    expect(kanbanInspectorPanelFile.source).toContain(
      'replaceCanvasKanbanComponentCardText',
    )
    expect(kanbanInspectorPanelFile.source).toContain(
      'replaceCanvasKanbanComponentsWithAddedCard',
    )
    expect(kanbanInspectorPanelFile.source).toContain(
      'replaceCanvasKanbanComponentsWithoutCard',
    )
    expect(kanbanInspectorPanelFile.source).toContain(
      'replaceCanvasKanbanComponentsWithMovedCard',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../editing/component-panels/kanban/CanvasKanbanInspectorPanel'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'CANVAS_KANBAN_INSPECTOR_PANEL',
    )
    expect(hostKanbanFile.source).toContain(
      'export function replaceCanvasKanbanComponentCardText',
    )
    expect(hostKanbanFile.source).toContain(
      'export function replaceCanvasKanbanComponentsWithMovedCard',
    )
    expect(hostKanbanFile.source).not.toMatch(browserKanbanHow)
  })

})
