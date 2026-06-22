import type {
  CSSProperties,
} from 'react'
import type {
  CanvasJsonObject,
} from '../../../entities'
import {
  CANVAS_DOM_EDIT_STYLE_CHANNELS,
  CANVAS_DOM_EDIT_STYLE_DEFAULTS,
  CANVAS_DOM_EDIT_STYLE_LIMITS,
  type CanvasDomEditStyle,
  type CanvasDomEditStyleChannel,
  type CanvasDomEditStyleLimit,
  type CanvasDomEditStyleOptions,
} from './CanvasDomEditStyleContracts'

export function getCanvasDomEditStyle(
  data: CanvasJsonObject,
  targetId: string,
  options: CanvasDomEditStyleOptions = {},
): CanvasDomEditStyle {
  const dataStyle = getCanvasDomEditStyleRecord(data, targetId)

  return CANVAS_DOM_EDIT_STYLE_CHANNELS.reduce<CanvasDomEditStyle>(
    (style, channel) => ({
      ...style,
      [channel]: readCanvasDomEditStyleValue({
        channel,
        dataStyle,
        options,
      }),
    }),
    CANVAS_DOM_EDIT_STYLE_DEFAULTS,
  )
}

export function getCanvasDomEditStyleProperties(
  style: CanvasDomEditStyle,
): CSSProperties {
  return {
    borderRadius: style.radius,
    gap: style.gap,
    margin: style.margin,
    padding: style.padding,
  }
}

export function setCanvasDomEditStyleValue<
  TData extends CanvasJsonObject,
>(
  data: TData,
  targetId: string,
  channel: CanvasDomEditStyleChannel,
  value: number,
  options: CanvasDomEditStyleOptions = {},
): TData {
  const style = getCanvasDomEditStyle(data, targetId, options)
  const limit = getCanvasDomEditStyleLimit(channel, options)
  const domEdit = isCanvasJsonObject(data.domEdit) ? data.domEdit : {}
  const styles = isCanvasJsonObject(domEdit.styles) ? domEdit.styles : {}

  return {
    ...data,
    domEdit: {
      ...domEdit,
      styles: {
        ...styles,
        [targetId]: {
          ...style,
          [channel]: clampCanvasDomEditStyleValue(value, limit),
        },
      },
    },
  } as TData
}

export function getCanvasDomEditStyleLimit(
  channel: CanvasDomEditStyleChannel,
  options: CanvasDomEditStyleOptions,
) {
  return {
    ...CANVAS_DOM_EDIT_STYLE_LIMITS[channel],
    ...options.limits?.[channel],
  }
}

export function clampCanvasDomEditStyleValue(
  value: number,
  limit: CanvasDomEditStyleLimit,
) {
  return Math.min(limit.max, Math.max(limit.min, value))
}

function getCanvasDomEditStyleRecord(
  data: CanvasJsonObject,
  targetId: string,
): Partial<Record<CanvasDomEditStyleChannel, unknown>> {
  const domEdit = isCanvasJsonObject(data.domEdit) ? data.domEdit : {}
  const styles = isCanvasJsonObject(domEdit.styles) ? domEdit.styles : {}
  const targetStyle = styles[targetId]

  return isCanvasJsonObject(targetStyle) ? targetStyle : {}
}

function readCanvasDomEditStyleValue({
  channel,
  dataStyle,
  options,
}: {
  channel: CanvasDomEditStyleChannel
  dataStyle: Partial<Record<CanvasDomEditStyleChannel, unknown>>
  options: CanvasDomEditStyleOptions
}) {
  const rawValue = dataStyle[channel]
  const defaultValue =
    options.defaultValue?.[channel] ?? CANVAS_DOM_EDIT_STYLE_DEFAULTS[channel]
  const limit = getCanvasDomEditStyleLimit(channel, options)

  return clampCanvasDomEditStyleValue(
    typeof rawValue === 'number' && Number.isFinite(rawValue)
      ? rawValue
      : defaultValue,
    limit,
  )
}

function isCanvasJsonObject(value: CanvasJsonObject[string]): value is CanvasJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
