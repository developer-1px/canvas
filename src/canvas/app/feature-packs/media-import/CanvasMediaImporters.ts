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

export type CanvasMediaImportSource = {
  title?: string
  url: string
}

export type CanvasMediaImporterContext = {
  createId: (prefix: string) => string
  position: Point
  source: CanvasMediaImportSource
  viewport: Viewport
}

export type CanvasMediaImporter = {
  createItems: (
    context: CanvasMediaImporterContext,
  ) => CanvasItem[] | null
  id: string
}

export function assertCanvasMediaImporters(
  importers: readonly CanvasMediaImporter[],
) {
  assertCanvasAppArray(importers, 'media importers')

  for (const importer of importers) {
    assertCanvasMediaImporter(importer)
  }
}

export function assertCanvasMediaImporter(
  importer: CanvasMediaImporter,
) {
  assertCanvasAppDescriptorObject(importer, 'media importer')
  assertCanvasAppDescriptorStringField({
    field: 'id',
    owner: 'media importer',
    value: importer.id,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'createItems',
    owner: `media importer ${importer.id}`,
    value: importer.createItems,
  })
}
