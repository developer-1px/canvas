import type {
  Bounds,
  Viewport
} from '../core'
import type {
  CanvasSceneAdapter,
  CanvasSceneEntry,
} from './CanvasSceneAdapter'
import { getCanvasAlignmentSnap } from './CanvasAlignmentSnap'
import {
  getCanvasGridSnap,
  type CanvasGridSnapConfig,
} from './CanvasGridSnap'
import {
  createEmptyCanvasAxisSnap,
  type CanvasAlignmentGuide,
  type CanvasSnapGuides,
  type CanvasSpacingGuide,
} from './CanvasSnapGuides'
import { translateCanvasSnapBounds } from './CanvasSnapGeometry'
import { getCanvasSpacingSnap } from './CanvasSpacingSnap'

export {
  snapCanvasPointToGrid,
  type CanvasGridSnapConfig,
} from './CanvasGridSnap'
export {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAlignmentGuide,
  type CanvasSnapGuides,
  type CanvasSpacingGuide,
} from './CanvasSnapGuides'

export type CanvasMoveSnap = CanvasSnapGuides & {
  dx: number
  dy: number
}

export type CanvasMoveSnapConfig = CanvasGridSnapConfig & Readonly<{
  gestures: CanvasGridSnapConfig['gestures'] & Readonly<{
    snapToAlignment: boolean
    snapToSpacing: boolean
  }>
}>

const SNAP_THRESHOLD = 8

export function getCanvasMoveSnap({
  bounds,
  config,
  dx,
  dy,
  scene,
  selection,
  viewport,
}: {
  bounds: Bounds
  config: CanvasMoveSnapConfig
  dx: number
  dy: number
  scene: CanvasSceneAdapter
  selection: string[]
  viewport: Viewport
}): CanvasMoveSnap {
  const threshold = getCanvasSnapThreshold(viewport)
  const candidates = getCanvasSnapCandidates(scene, selection)
  const proposed = translateCanvasSnapBounds(bounds, dx, dy)
  const alignment = config.gestures.snapToAlignment
    ? getCanvasAlignmentSnap({
        candidates,
        proposed,
        threshold,
      })
    : createEmptyCanvasAxisSnap<CanvasAlignmentGuide>()
  const afterAlignment = translateCanvasSnapBounds(
    proposed,
    alignment.dx,
    alignment.dy,
  )
  const spacing = config.gestures.snapToSpacing
    ? getCanvasSpacingSnap({
        candidates,
        proposed: afterAlignment,
        threshold,
      })
    : createEmptyCanvasAxisSnap<CanvasSpacingGuide>()
  const afterSpacing = translateCanvasSnapBounds(
    afterAlignment,
    alignment.x ? 0 : spacing.dx,
    alignment.y ? 0 : spacing.dy,
  )
  const grid = getCanvasGridSnap({
    proposed: afterSpacing,
    threshold,
  })

  return {
    dx:
      dx +
      alignment.dx +
      (alignment.x ? 0 : spacing.dx) +
      (alignment.x || spacing.x || !config.gestures.snapToGrid ? 0 : grid.dx),
    dy:
      dy +
      alignment.dy +
      (alignment.y ? 0 : spacing.dy) +
      (alignment.y || spacing.y || !config.gestures.snapToGrid ? 0 : grid.dy),
    alignmentGuides: alignment.guides,
    spacingGuides: spacing.guides,
  }
}

function getCanvasSnapCandidates(scene: CanvasSceneAdapter, selection: string[]) {
  const selected = new Set(selection)
  const selectedEntries = scene.entries.filter((entry) => selected.has(entry.id))

  return scene.entries.filter(
    (entry) => !isCanvasSnapSelectionRelative(entry, selectedEntries),
  )
}

function getCanvasSnapThreshold(viewport: Viewport) {
  return SNAP_THRESHOLD / viewport.scale
}

function isCanvasSnapSelectionRelative(
  entry: CanvasSceneEntry,
  selectedEntries: CanvasSceneEntry[],
) {
  return selectedEntries.some(
    (selected) =>
      samePath(selected.path, entry.path) ||
      isAncestorPath(selected.path, entry.path) ||
      isAncestorPath(entry.path, selected.path),
  )
}

function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}

function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
