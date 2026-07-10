import type {
  DesignDocument,
  DesignDocumentCommandResult,
  DesignJSONObject,
  DesignNode,
  DesignNodeFrame,
} from '../../../../src/canvas/design-document'
import type {
  FigmaCloneDomAutoLayoutField,
  FigmaCloneDomEditField,
  FigmaCloneDomEditNodeState,
} from '../dom-edit/FigmaCloneDomEditModel'
import type { FigmaWorkspaceDesignNodeId } from './FigmaWorkspaceComponentMetadata'

const NUMERIC_FIELD_LIMITS = {
  gap: { max: 80, min: 0 },
  h: { max: 2400, min: 12 },
  margin: { max: 80, min: -40 },
  opacity: { max: 100, min: 0 },
  order: { max: 20, min: -20 },
  padding: { max: 96, min: 0 },
  paddingBottom: { max: 96, min: 0 },
  paddingLeft: { max: 96, min: 0 },
  paddingRight: { max: 96, min: 0 },
  paddingTop: { max: 96, min: 0 },
  radius: { max: 80, min: 0 },
  rotation: { max: 180, min: -180 },
  w: { max: 1600, min: 12 },
  x: { max: 240, min: -240 },
  y: { max: 240, min: -240 },
} satisfies Record<FigmaCloneDomEditField, { max: number; min: number }>

const STYLE_FIELDS = new Set<FigmaCloneDomEditField>([
  'opacity',
  'radius',
  'rotation',
])

const PADDING_SIDE_FIELDS = [
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
] as const satisfies readonly FigmaCloneDomEditField[]

export type FigmaWorkspaceNumericFieldUpdate = {
  readonly field: FigmaCloneDomEditField
  readonly historyGroup?: string
  readonly nodeId: FigmaWorkspaceDesignNodeId
  readonly value: number
}

export type FigmaWorkspaceAutoLayoutFieldUpdate<
  TField extends FigmaCloneDomAutoLayoutField = FigmaCloneDomAutoLayoutField,
> = {
  readonly field: TField
  readonly historyGroup?: string
  readonly nodeId: FigmaWorkspaceDesignNodeId
  readonly value: FigmaCloneDomEditNodeState[TField]
}

export type FigmaWorkspaceFrameUpdate = Partial<DesignNodeFrame>

export type FigmaWorkspaceFramePreset = {
  readonly h: number
  readonly w: number
}

export function updateFigmaWorkspaceNumericField(
  document: DesignDocument,
  update: FigmaWorkspaceNumericFieldUpdate,
): DesignDocumentCommandResult {
  const targets = getFieldUpdateTargets(document, update.nodeId)
  const changes = targets.map((node) => {
    const values = STYLE_FIELDS.has(update.field)
      ? {
          style: updateNumericObjectField(
            node.style,
            update.field,
            update.value,
          ),
        }
      : {
          layout: updateNumericLayoutField(
            node.layout,
            update.field,
            update.value,
          ),
        }

    return {
      type: 'update' as const,
      nodeId: node.id,
      values,
    }
  })

  return document.execute({
    label: `Update ${update.field}`,
    changes,
    historyGroup: update.historyGroup,
  })
}

export function updateFigmaWorkspaceAutoLayoutField<
  TField extends FigmaCloneDomAutoLayoutField,
>(
  document: DesignDocument,
  update: FigmaWorkspaceAutoLayoutFieldUpdate<TField>,
): DesignDocumentCommandResult {
  const changes = getFieldUpdateTargets(document, update.nodeId).map(
    (node) => ({
      type: 'update' as const,
      nodeId: node.id,
      values: {
        layout: {
          ...node.layout,
          [update.field]: update.value,
        },
      },
    }),
  )

  return document.execute({
    label: `Update ${update.field}`,
    changes,
    historyGroup: update.historyGroup,
  })
}

export function updateFigmaWorkspaceText(
  document: DesignDocument,
  update: {
    readonly nodeId: FigmaWorkspaceDesignNodeId
    readonly value: string
  },
): DesignDocumentCommandResult {
  const node = requireWorkspaceNode(document, update.nodeId)

  if (node.text === null) {
    throw new Error(`Figma workspace node is not text-editable: ${node.id}`)
  }

  return document.execute({
    label: 'Update text',
    changes: [{
      type: 'update',
      nodeId: node.id,
      values: { text: update.value },
    }],
  })
}

export function updateFigmaWorkspaceFrame(
  document: DesignDocument,
  values: FigmaWorkspaceFrameUpdate,
): DesignDocumentCommandResult {
  const root = requireWorkspaceNode(document, 'workspacePage')

  if (!root.frame) {
    throw new Error('Missing Figma workspace frame')
  }

  return document.execute({
    label: 'Update workspace frame',
    changes: [{
      type: 'update',
      nodeId: root.id,
      values: { frame: { ...root.frame, ...values } },
    }],
  })
}

export function applyFigmaWorkspaceFramePreset(
  document: DesignDocument,
  preset: FigmaWorkspaceFramePreset,
): DesignDocumentCommandResult {
  return updateFigmaWorkspaceFrame(document, {
    height: clampFrameDimension('height', preset.h),
    width: clampFrameDimension('width', preset.w),
  })
}

function getFieldUpdateTargets(
  document: DesignDocument,
  nodeId: FigmaWorkspaceDesignNodeId,
): readonly DesignNode[] {
  const node = requireWorkspaceNode(document, nodeId)
  const peers = document.read.componentPeers(nodeId)

  return peers.length > 0 ? peers : [node]
}

function updateNumericObjectField(
  values: DesignJSONObject,
  field: FigmaCloneDomEditField,
  input: number,
): DesignJSONObject {
  const current = readNumber(values, field)

  return {
    ...values,
    [field]: clampNumericField(field, input, current),
  }
}

function updateNumericLayoutField(
  layout: DesignJSONObject,
  field: FigmaCloneDomEditField,
  input: number,
): DesignJSONObject {
  const current = readNumber(layout, field)
  const value = clampNumericField(field, input, current)

  if (field === 'padding') {
    return {
      ...layout,
      padding: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
      paddingTop: value,
    }
  }

  if (isPaddingSideField(field)) {
    const next = { ...layout, [field]: value }
    const sides = PADDING_SIDE_FIELDS.map((side) => readNumber(next, side))
    const uniform = sides.every((side) => side === sides[0])

    return uniform ? { ...next, padding: sides[0] } : next
  }

  return { ...layout, [field]: value }
}

function clampNumericField(
  field: FigmaCloneDomEditField,
  input: number,
  current: number,
) {
  const limits = NUMERIC_FIELD_LIMITS[field]
  const finite = Number.isFinite(input) ? input : current

  return Math.min(limits.max, Math.max(limits.min, Math.round(finite)))
}

function clampFrameDimension(field: 'height' | 'width', input: number) {
  const min = field === 'width' ? 320 : 360
  const max = field === 'width' ? 1920 : 1400

  if (!Number.isFinite(input)) {
    throw new Error(`Invalid Figma workspace frame ${field}`)
  }

  return Math.min(max, Math.max(min, Math.round(input)))
}

function isPaddingSideField(
  field: FigmaCloneDomEditField,
): field is typeof PADDING_SIDE_FIELDS[number] {
  return PADDING_SIDE_FIELDS.some((candidate) => candidate === field)
}

function readNumber(values: DesignJSONObject, field: string): number {
  const value = values[field]

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid Figma workspace numeric field: ${field}`)
  }

  return value
}

function requireWorkspaceNode(
  document: DesignDocument,
  nodeId: FigmaWorkspaceDesignNodeId,
): DesignNode {
  const node = document.read.node(nodeId)

  if (!node) {
    throw new Error(`Missing Figma workspace node: ${nodeId}`)
  }

  return node
}
