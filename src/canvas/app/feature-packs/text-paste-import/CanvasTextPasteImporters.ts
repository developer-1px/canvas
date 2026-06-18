import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../../entities'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../../extensions/CanvasAppDescriptorContracts'

export type CanvasTextPasteImporterContext = {
  createId: (prefix: string) => string
  position: Point
  text: string
  viewport: Viewport
}

export type CanvasTextPasteImporter = {
  createItems: (
    context: CanvasTextPasteImporterContext,
  ) => CanvasItem[] | null
  id: string
}

export function assertCanvasTextPasteImporters(
  importers: readonly CanvasTextPasteImporter[],
) {
  assertCanvasAppArray(importers, 'text paste importers')

  for (const importer of importers) {
    assertCanvasTextPasteImporter(importer)
  }
}

export function assertCanvasTextPasteImporter(
  importer: CanvasTextPasteImporter,
) {
  assertCanvasAppDescriptorObject(importer, 'text paste importer')
  assertCanvasAppDescriptorStringField({
    field: 'id',
    owner: 'text paste importer',
    value: importer.id,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'createItems',
    owner: `text paste importer ${importer.id}`,
    value: importer.createItems,
  })
}
