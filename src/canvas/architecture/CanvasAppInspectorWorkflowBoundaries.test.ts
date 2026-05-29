import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App inspector workflow boundaries', () => {
  it('keeps app inspector wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const inspectorModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppInspectorModel.ts',
    )
    const customFocusModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppCustomFocusModel.ts',
    )
    const customFocusHookFile = getSourceFile(
      'src/canvas/app/affordances/interaction/focus/useCanvasAppCustomFocus.ts',
    )
    const objectInspectorHookFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/useCanvasObjectInspector.ts',
    )
    const objectInspectorModelFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasObjectInspectorModel.ts',
    )
    const objectInspectorLabelFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasObjectInspectorLabel.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppInspectorModel'",
    )
    expect(appModelFile.source).toContain(
      "from './useCanvasAppCustomFocusModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../affordances/editing/inspector/useCanvasObjectInspector'",
    )
    expect(appModelFile.source).not.toContain('useCanvasObjectInspector')
    expect(appModelFile.source).not.toContain('CANVAS_APP_CUSTOM_FOCUS_EVENT')
    expect(appModelFile.source).not.toContain('addEventListener')
    expect(inspectorModelFile.source).toContain(
      "from '../affordances/editing/inspector/useCanvasObjectInspector'",
    )
    expect(inspectorModelFile.source).toContain(
      "from './CanvasAppInspectorConsumerContracts'",
    )
    expect(inspectorModelFile.source).toContain(
      'CanvasAppInspectorModelInput',
    )
    expect(inspectorModelFile.source).not.toContain(
      'type UseCanvasAppInspectorModelArgs',
    )
    expect(inspectorModelFile.source).toContain(
      'export function useCanvasAppInspectorModel',
    )
    expect(inspectorModelFile.source).toContain('inspectorPanels')
    expect(inspectorModelFile.source).toContain('itemReadModel')
    expect(customFocusModelFile.source).toContain(
      "from '../affordances/interaction/focus/useCanvasAppCustomFocus'",
    )
    expect(customFocusModelFile.source).toContain('customFocus')
    expect(customFocusHookFile.source).toContain(
      'CANVAS_APP_CUSTOM_FOCUS_EVENT',
    )
    expect(customFocusHookFile.source).toContain('window.addEventListener')
    const consumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppInspectorConsumerContracts.ts',
    )
    expect(consumerContractsFile.source).toContain(
      'export type CanvasAppInspectorModelInput',
    )
    expect(consumerContractsFile.source).toContain(
      "from '../affordances/editing/inspector/CanvasAppInspectorPanels'",
    )
    expect(objectInspectorHookFile.source).toContain(
      "from './CanvasObjectInspectorModel'",
    )
    expect(objectInspectorHookFile.source).not.toContain('resize-selection')
    expect(objectInspectorHookFile.source).not.toContain('item.locked')
    expect(objectInspectorHookFile.source).not.toContain('capitalize(')
    expect(objectInspectorModelFile.source).toContain(
      'export function getCanvasObjectInspectorModel',
    )
    expect(objectInspectorModelFile.source).toContain(
      "from './CanvasObjectInspectorLabel'",
    )
    expect(objectInspectorModelFile.source).toContain('resize-selection')
    expect(objectInspectorModelFile.source).toContain('item.locked')
    expect(objectInspectorModelFile.source).not.toContain('capitalize(')
    expect(objectInspectorModelFile.source).not.toContain(
      "item.type === 'component'",
    )
    expect(objectInspectorLabelFile.source).toContain(
      'export function getCanvasObjectInspectorLabel',
    )
    expect(objectInspectorLabelFile.source).toContain("'title' in item")
    expect(objectInspectorLabelFile.source).toContain('item.type')
  })


  it('keeps App inspector panel execution behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasAppInspectorPanels.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasAppInspectorPanelExecution.ts',
    )
    const objectInspectorHook = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/useCanvasObjectInspector.ts',
    )
    const objectInspectorModel = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasObjectInspectorModel.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(descriptorFile.source).not.toContain('CanvasWorkflowContract')
    expect(descriptorFile.source).not.toContain("from '../../host'")
    expect(descriptorFile.source).toContain(
      "from '../../../workspace/document/CanvasAppDocumentContracts'",
    )
    expect(descriptorFile.source).toContain(
      'export type CanvasAppInspectorPanelCommitItemsChange',
    )
    expect(descriptorFile.source).not.toContain('panel.render(')
    expect(descriptorFile.source).not.toContain('panel.isVisible(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('panel.render(context)')
    expect(executionFile.source).toContain('panel.isVisible(context)')
    expect(executionFile.source).toContain('catch')
    expect(objectInspectorHook.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(objectInspectorModel.source).toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
  })


  it('keeps App inspector panel contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasAppInspectorPanels.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/affordances/editing/inspector/CanvasAppInspectorPanelContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppInspectorPanels',
    )
    expect(descriptorFile.source).not.toContain("field: 'render'")
    expect(descriptorFile.source).not.toContain("field: 'isVisible'")
    expect(descriptorFile.source).not.toContain(
      'assertCanvasAppExtensionEntries',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppInspectorPanels',
    )
    expect(contractsFile.source).toContain("field: 'render'")
    expect(contractsFile.source).toContain("field: 'isVisible'")
    expect(contractsFile.source).toContain(
      'assertCanvasAppExtensionEntries',
    )
  })

})
