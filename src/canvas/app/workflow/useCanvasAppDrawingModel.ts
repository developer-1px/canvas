import { useMemo, useState } from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Tool } from '../../entities'
import {
  createCanvasDrawingStrokeStyleSet,
  type CanvasDrawingStrokeKind,
  type CanvasDrawingStrokeStyle,
  type CanvasDrawingStrokeStyleSet,
} from '../../host'

const CANVAS_DRAWING_COLOR_OPTIONS = Object.freeze([
  '#111827',
  '#475569',
  '#2563eb',
  '#16a34a',
  '#fde047',
  '#f97316',
  '#dc2626',
  '#a855f7',
  '#ec4899',
])

const CANVAS_DRAWING_WIDTH_OPTIONS = Object.freeze([4, 8, 12, 18, 24])
const CANVAS_DRAWING_OPACITY_MIN = 0.18
const CANVAS_DRAWING_OPACITY_MAX = 1
const CANVAS_DRAWING_OPACITY_STEP = 0.01

export function useCanvasAppDrawingModel({
  config,
  tool,
}: {
  config: CanvasAffordanceConfig
  tool: Tool
}) {
  const [drawingStyles, setDrawingStyles] =
    useState<CanvasDrawingStrokeStyleSet>(() =>
      createCanvasDrawingStrokeStyleSet(),
    )
  const activeKind = getCanvasDrawingToolKind(tool)
  const activeStyle = activeKind ? drawingStyles[activeKind] : null
  const control = useMemo(
    () => ({
      colorOptions: CANVAS_DRAWING_COLOR_OPTIONS,
      opacityMax: CANVAS_DRAWING_OPACITY_MAX,
      opacityMin: CANVAS_DRAWING_OPACITY_MIN,
      opacityStep: CANVAS_DRAWING_OPACITY_STEP,
      style: activeStyle,
      toolLabel: activeKind ? getCanvasDrawingToolLabel(activeKind) : 'Drawing',
      visible: config.overlays.drawingControls && activeStyle !== null,
      widthOptions: CANVAS_DRAWING_WIDTH_OPTIONS,
      onOpacityChange: (opacity: number) =>
        updateCanvasDrawingStyle({
          activeKind,
          patch: { opacity: clampCanvasDrawingOpacity(opacity) },
          setDrawingStyles,
        }),
      onStrokeChange: (stroke: string) =>
        updateCanvasDrawingStyle({
          activeKind,
          patch: { stroke },
          setDrawingStyles,
        }),
      onStrokeWidthChange: (strokeWidth: number) =>
        updateCanvasDrawingStyle({
          activeKind,
          patch: { strokeWidth },
          setDrawingStyles,
        }),
    }),
    [activeKind, activeStyle, config],
  )

  return {
    control,
    pointer: {
      drawingStyles,
    },
  }
}

function updateCanvasDrawingStyle({
  activeKind,
  patch,
  setDrawingStyles,
}: {
  activeKind: CanvasDrawingStrokeKind | null
  patch: Partial<CanvasDrawingStrokeStyle>
  setDrawingStyles: (
    updater: (styles: CanvasDrawingStrokeStyleSet) => CanvasDrawingStrokeStyleSet
  ) => void
}) {
  if (!activeKind) {
    return
  }

  setDrawingStyles((styles) =>
    createCanvasDrawingStrokeStyleSet({
      ...styles,
      [activeKind]: {
        ...styles[activeKind],
        ...patch,
      },
    }),
  )
}

function getCanvasDrawingToolKind(tool: Tool): CanvasDrawingStrokeKind | null {
  if (tool === 'marker') {
    return 'marker'
  }

  if (tool === 'highlight') {
    return 'highlight'
  }

  if (tool === 'pen') {
    return 'path'
  }

  return null
}

function getCanvasDrawingToolLabel(kind: CanvasDrawingStrokeKind) {
  if (kind === 'marker') {
    return 'Marker'
  }

  if (kind === 'path') {
    return 'Pen'
  }

  return 'Highlighter'
}

function clampCanvasDrawingOpacity(opacity: number) {
  if (!Number.isFinite(opacity)) {
    return CANVAS_DRAWING_OPACITY_MAX
  }

  return Math.min(
    CANVAS_DRAWING_OPACITY_MAX,
    Math.max(CANVAS_DRAWING_OPACITY_MIN, opacity),
  )
}
