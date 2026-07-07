import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas host item boundaries', () => {
  it('keeps component item validation in the host component module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const componentValidationFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentItemValidation.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../component/CanvasComponentItemValidation'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasComponentItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain('isCanvasStableId')
    expect(itemSchemaFile.source).not.toContain('function isStringArray')
    expect(itemSchemaFile.source).not.toContain("value.type === 'component'")
    expect(componentValidationFile.source).toContain(
      'export function isCanvasComponentItemStorageShape',
    )
    expect(componentValidationFile.source).toContain('isCanvasStableId')
    expect(componentValidationFile.source).toContain('function isStringArray')
  })


  it('keeps editable text item rules in the host text module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const treeTraversalFile = getSourceFile(
      'src/canvas/host/tree/CanvasTreeTraversal.ts',
    )
    const documentPatchesFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentPatches.ts',
    )
    const editableTextFile = getSourceFile(
      'src/canvas/host/text/CanvasEditableTextItem.ts',
    )
    const itemStartFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasItemPointerInteractionStart.ts',
    )
    const textEditingModelFile = getSourceFile(
      'src/canvas/app/affordances/editing/text-editor/CanvasTextEditingModel.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../text/CanvasEditableTextItem'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasEditableTextItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'rect'")
    expect(itemSchemaFile.source).not.toContain("value.type === 'text'")
    expect(treeTraversalFile.source).toContain('isCanvasTextItem(item)')
    expect(treeTraversalFile.source).toContain(
      'isCanvasEditableTextItem(item)',
    )
    expect(treeTraversalFile.source).not.toContain(
      "item?.type === 'rect' || item?.type === 'text'",
    )
    expect(documentPatchesFile.source).toContain(
      'isCanvasEditableTextItem(entry.item)',
    )
    expect(documentPatchesFile.source).toContain(
      'getCanvasEditableTextPatchUpdates(entry.item, text)',
    )
    expect(documentPatchesFile.source).not.toContain(
      'getCanvasEditableTextPatchOperation(entry.item)',
    )
    expect(documentPatchesFile.source).not.toContain(
      'getCanvasEditableTextPatchField(entry.item)',
    )
    expect(documentPatchesFile.source).toContain(
      'update.field',
    )
    expect(documentPatchesFile.source).not.toContain(
      "entry.item.type !== 'rect'",
    )
    expect(documentPatchesFile.source).not.toContain(
      "entry.item.type === 'rect' && entry.item.text === undefined",
    )
    expect(itemStartFile.source).toContain('CANVAS_APP_TEXT_TARGET.getValue(item)')
    expect(itemStartFile.source).not.toContain(
      "item.type === 'rect' ? item.text ?? '' : item.text",
    )
    expect(textEditingModelFile.source).toContain(
      'CANVAS_APP_TEXT_TARGET.getCommittedValue',
    )
    expect(textEditingModelFile.source).not.toContain(
      "editingItem.type === 'text'",
    )
    expect(editableTextFile.source).toContain(
      'export type { CanvasEditableTextItem }',
    )
    expect(editableTextFile.source).not.toContain(
      'export type CanvasEditableTextItem =',
    )
    expect(getSourceFile('src/canvas/entities/items/CanvasTextItems.ts').source)
      .toContain('export type CanvasEditableTextItem =')
    expect(getSourceFile('src/canvas/entities/items/CanvasTextItems.ts').source)
      .toContain('| CanvasComponentItem')
    expect(getSourceFile('src/canvas/entities/index.ts').source).toContain(
      'CanvasEditableTextItem',
    )
    expect(editableTextFile.source).toContain(
      'export function isCanvasEditableTextItem',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextValue',
    )
    expect(editableTextFile.source).toContain(
      'export function getCommittedCanvasEditableTextValue',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextPatchOperation',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextPatchField',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextPatchUpdates',
    )
  })


  it('keeps group item structure rules in the host tree module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const groupItemFile = getSourceFile(
      'src/canvas/host/tree/CanvasGroupItem.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')
    const groupPredicateConsumers = [
      'src/canvas/host/adapters/CanvasItemSceneAdapter.ts',
      'src/canvas/host/document/CanvasCustomItemValidation.ts',
      'src/canvas/host/document/CanvasDocumentGroupingPatch.ts',
      'src/canvas/host/document/CanvasDocumentLayerOrderPatch.ts',
      'src/canvas/host/document/CanvasDocumentPatchTreeDiff.ts',
      'src/canvas/host/document/CanvasDocumentPatches.ts',
      'src/canvas/host/operations/CanvasItemAlignmentOperations.ts',
      'src/canvas/host/operations/CanvasItemCloneOperations.ts',
      'src/canvas/host/operations/CanvasItemGroupOperations.ts',
      'src/canvas/host/operations/CanvasItemLockOperations.ts',
      'src/canvas/host/operations/CanvasItemOperationTree.ts',
      'src/canvas/host/operations/CanvasItemRemovalOperations.ts',
      'src/canvas/host/operations/CanvasItemTransformOperations.ts',
      'src/canvas/host/operations/CanvasItemZOrderOperations.ts',
      'src/canvas/host/tree/CanvasTreeBounds.ts',
      'src/canvas/host/tree/CanvasTreeSelection.ts',
      'src/canvas/host/tree/CanvasTreeTraversal.ts',
    ].map((path) => getSourceFile(path).source).join('\n')

    expect(itemSchemaFile.source).toContain(
      "from '../tree/CanvasGroupItem'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasGroupItemStorageShape(value, isCanvasItem)',
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'group'")
    expect(groupPredicateConsumers).toContain('isCanvasGroupItem(')
    expect(groupPredicateConsumers).not.toContain("item.type === 'group'")
    expect(groupPredicateConsumers).not.toContain("item.type !== 'group'")
    expect(groupPredicateConsumers).not.toContain(
      "entry.item.type === 'group'",
    )
    expect(groupPredicateConsumers).not.toContain(
      "candidate.item.type === 'group'",
    )
    expect(groupItemFile.source).toContain(
      'export function isCanvasGroupItem',
    )
    expect(groupItemFile.source).toContain(
      'export function isCanvasGroupItemStorageShape',
    )
    expect(hostEntryFile.source).toContain('isCanvasGroupItem')
  })


  it('keeps Host custom item validation behind a named module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const customValidationFile = getSourceFile(
      'src/canvas/host/document/CanvasCustomItemValidation.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')

    expect(itemSchemaFile.source).toContain(
      "from './CanvasCustomItemValidation'",
    )
    expect(itemSchemaFile.source).not.toContain('function isJsonRecord')
    expect(itemSchemaFile.source).not.toContain('function isJsonValue')
    expect(itemSchemaFile.source).not.toContain(
      'Invalid custom canvas item',
    )
    expect(customValidationFile.source).toContain(
      'export function isCanvasCustomItemStorageEnvelope',
    )
    expect(customValidationFile.source).toContain(
      'export function assertCustomCanvasItems',
    )
    expect(customValidationFile.source).toContain('function isJsonRecord')
    expect(customValidationFile.source).toContain(
      'Invalid custom canvas item',
    )
    expect(hostEntryFile.source).toContain(
      "from './document/CanvasCustomItemValidation'",
    )
  })


  it('keeps Host Component Library contracts behind a named module', () => {
    const libraryFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibrary.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibraryContracts.ts',
    )

    expect(libraryFile.source).toContain(
      "from './CanvasComponentLibraryContracts'",
    )
    expect(libraryFile.source).not.toContain(
      'function assertCanvasComponentTemplateContracts',
    )
    expect(libraryFile.source).not.toContain(
      'Canvas component template descriptor must be an object',
    )
    expect(libraryFile.source).not.toContain(
      'Duplicate canvas component template',
    )
    expect(libraryFile.source).not.toContain('requires positive')
    expect(contractsFile.source).toContain(
      'export function assertCanvasComponentTemplateContracts',
    )
    expect(contractsFile.source).toContain(
      'Canvas component template descriptor must be an object',
    )
    expect(contractsFile.source).toContain(
      'Duplicate canvas component template',
    )
    expect(contractsFile.source).toContain('requires positive')
  })


  it('keeps built-in component templates in a host catalogue module', () => {
    const libraryFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibrary.ts',
    )
    const catalogueFile = getSourceFile(
      'src/canvas/host/component/CanvasBuiltInComponentTemplates.ts',
    )

    expect(libraryFile.source).toContain(
      "from './CanvasBuiltInComponentTemplates'",
    )
    expect(libraryFile.source).not.toContain("id: 'sticky'")
    expect(libraryFile.source).not.toContain("presentation: 'note-card'")
    expect(catalogueFile.source).toContain(
      'DEFAULT_CANVAS_COMPONENT_TEMPLATES',
    )
    expect(catalogueFile.source).toContain("id: 'sticky'")
    expect(catalogueFile.source).toContain("presentation: 'note-card'")
  })

})
