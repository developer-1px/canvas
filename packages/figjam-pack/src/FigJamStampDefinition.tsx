/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  includes,
  isJSONObject,
  isNonEmptyString,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_STAMP_DEFINITION_ID = 'figjam.stamp'
export const FIGJAM_STAMP_KINDS = [
  'thumbs-up',
  'question',
  'heart',
  'star',
  'vote',
] as const

export type FigJamStampKind = typeof FIGJAM_STAMP_KINDS[number]
export type FigJamStampProps = {
  readonly label: string
  readonly position: 'absolute'
  readonly stamp: FigJamStampKind
}

export type CreateFigJamStampNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly label?: string
    readonly stamp?: FigJamStampKind
  }

export const FIGJAM_STAMP_DEFAULT_PROPS = Object.freeze({
  label: '+1',
  position: 'absolute',
  stamp: 'thumbs-up',
} as const satisfies FigJamStampProps)

export const FIGJAM_STAMP_DEFINITION =
  defineReactDesignWidget<FigJamStampProps>({
    id: FIGJAM_STAMP_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_STAMP_DEFAULT_PROPS,
      safeParse: parseFigJamStampProps,
    },
    create: ({ nodeId, x, y }) => createFigJamStampNode({ nodeId, x, y }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
    renderer: FigJamStamp,
    fallback: FigJamStampFallback,
  })

export function createFigJamStampNode({
  height = 44,
  label = FIGJAM_STAMP_DEFAULT_PROPS.label,
  nodeId,
  stamp = FIGJAM_STAMP_DEFAULT_PROPS.stamp,
  width = 44,
  x,
  y,
}: CreateFigJamStampNodeInput) {
  const parsed = parseFigJamStampProps({ label, position: 'absolute', stamp })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_STAMP_DEFINITION_ID,
    height,
    label: stamp === 'vote' ? 'Vote' : 'Stamp',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text: null,
    width,
    x,
    y,
  })
}

export function parseFigJamStampProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    includes(FIGJAM_STAMP_KINDS, value.stamp) &&
    isNonEmptyString(value.label) &&
    value.label.length <= 16
  ) {
    return {
      ok: true as const,
      value: {
        label: value.label,
        position: value.position,
        stamp: value.stamp,
      } satisfies FigJamStampProps,
    }
  }

  return { ok: false as const, reason: 'Stamp props require kind and label' }
}

function FigJamStamp({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamStampProps>) {
  return (
    <div
      {...rootProps}
      aria-label={`${props.stamp} stamp`}
      className={joinClassNames(rootProps.className, 'figjam-stamp')}
      data-figjam-widget="stamp"
      data-stamp-kind={props.stamp}
    >
      {props.label}
    </div>
  )
}

function FigJamStampFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamStampProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-stamp', 'figjam-widget-fallback')}
      data-figjam-widget="stamp"
      data-figjam-widget-error={reason}
    >
      Stamp unavailable
    </div>
  )
}
