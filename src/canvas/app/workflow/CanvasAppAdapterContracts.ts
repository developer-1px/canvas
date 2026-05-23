import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import type { CanvasItem } from '../../host'
import type {
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
} from '../../engine'
import type {
  CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppStageAdapter'

export type CanvasAppItemAdapters = {
  command: CanvasCommandAdapter<CanvasItem>
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssemblyAdapters = {
  itemAdapters: CanvasAppItemAdapters
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export function assertCanvasAppAssemblyAdapters({
  itemAdapters,
  itemLayerAdapter,
  stageAdapter,
}: CanvasAppAssemblyAdapters) {
  assertCanvasAppItemAdapters(itemAdapters)
  assertCanvasAppItemLayerAdapter(itemLayerAdapter)
  assertCanvasAppStageAdapter(stageAdapter)
}

function assertCanvasAppItemAdapters(itemAdapters: CanvasAppItemAdapters) {
  assertCanvasAppDescriptorObject(itemAdapters, 'item adapters')
  assertCanvasAppCommandAdapter(itemAdapters.command)
  assertCanvasAppCreationAdapter(itemAdapters.creation)
  assertCanvasAppTransformAdapter(itemAdapters.transform)
}

function assertCanvasAppCommandAdapter(
  adapter: CanvasAppItemAdapters['command'],
) {
  assertCanvasAppDescriptorObject(adapter, 'command adapter')

  for (const field of [
    'alignSelection',
    'cloneSelection',
    'deleteSelection',
    'distributeSelection',
    'groupSelection',
    'lockSelection',
    'nudgeSelection',
    'pasteItems',
    'reorderSelection',
    'selectAll',
    'ungroupSelection',
    'unlockAll',
  ] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'command adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppCreationAdapter(
  adapter: CanvasAppItemAdapters['creation'],
) {
  assertCanvasAppDescriptorObject(adapter, 'creation adapter')

  for (const field of [
    'createArrow',
    'createHighlight',
    'createMarker',
    'createRect',
    'createText',
  ] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'creation adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppTransformAdapter(
  adapter: CanvasAppItemAdapters['transform'],
) {
  assertCanvasAppDescriptorObject(adapter, 'transform adapter')

  for (const field of ['resizeSelection', 'translateSelection'] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'transform adapter',
      value: adapter[field],
    })
  }
}

function assertCanvasAppItemLayerAdapter(
  adapter: CanvasAppItemLayerAdapter,
) {
  assertCanvasAppDescriptorObject(adapter, 'item layer adapter')
  assertCanvasAppDescriptorFunctionField({
    field: 'renderItems',
    owner: 'item layer adapter',
    value: adapter.renderItems,
  })
}

function assertCanvasAppStageAdapter(
  adapter: CanvasAppStageAdapter,
) {
  assertCanvasAppDescriptorObject(adapter, 'stage adapter')
  assertCanvasAppDescriptorFunctionField({
    field: 'renderStage',
    owner: 'stage adapter',
    value: adapter.renderStage,
  })
}
