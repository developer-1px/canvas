/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetInspectorProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  includes,
  isJSONObject,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_TEXT_DEFINITION_ID = 'figjam.text'

export const FIGJAM_TEXT_VARIANTS = ['plain', 'label', 'card'] as const
export const FIGJAM_TEXT_ALIGNMENTS = ['left', 'center', 'right'] as const
export const FIGJAM_TEXT_TONES = ['ink', 'muted', 'blue'] as const

export type FigJamTextVariant = typeof FIGJAM_TEXT_VARIANTS[number]
export type FigJamTextAlignment = typeof FIGJAM_TEXT_ALIGNMENTS[number]
export type FigJamTextTone = typeof FIGJAM_TEXT_TONES[number]

export type FigJamTextProps = {
  readonly align: FigJamTextAlignment
  readonly position: 'absolute'
  readonly tone: FigJamTextTone
  readonly variant: FigJamTextVariant
}

export type CreateFigJamTextNodeInput = FigJamPlacementInput & FigJamSizeInput & {
  readonly align?: FigJamTextAlignment
  readonly text?: string
  readonly tone?: FigJamTextTone
  readonly variant?: FigJamTextVariant
}

export const FIGJAM_TEXT_DEFAULT_PROPS = Object.freeze({
  align: 'left',
  position: 'absolute',
  tone: 'ink',
  variant: 'plain',
} as const satisfies FigJamTextProps)

export const FIGJAM_TEXT_DEFINITION =
  defineReactDesignWidget<FigJamTextProps>({
    id: FIGJAM_TEXT_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_TEXT_DEFAULT_PROPS,
      safeParse: parseFigJamTextProps,
    },
    create: ({ nodeId, x, y }) => createFigJamTextNode({ nodeId, x, y }),
    capabilities: {
      textEdit: { source: 'node-text', multiline: true },
      transform: { move: true, resize: true },
    },
    renderer: FigJamText,
    fallback: FigJamTextFallback,
    Inspector: FigJamTextInspector,
  })

export function createFigJamTextNode({
  align = FIGJAM_TEXT_DEFAULT_PROPS.align,
  height,
  nodeId,
  text = 'Text',
  tone = FIGJAM_TEXT_DEFAULT_PROPS.tone,
  variant = FIGJAM_TEXT_DEFAULT_PROPS.variant,
  width,
  x,
  y,
}: CreateFigJamTextNodeInput) {
  const parsed = parseFigJamTextProps({
    align,
    position: 'absolute',
    tone,
    variant,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  const size = getFigJamTextDefaultSize(variant)

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_TEXT_DEFINITION_ID,
    height: height ?? size.height,
    label: variant === 'card' ? 'Card' : variant === 'label' ? 'Label' : 'Text',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text,
    width: width ?? size.width,
    x,
    y,
  })
}

export function parseFigJamTextProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    includes(FIGJAM_TEXT_VARIANTS, value.variant) &&
    includes(FIGJAM_TEXT_ALIGNMENTS, value.align) &&
    includes(FIGJAM_TEXT_TONES, value.tone)
  ) {
    return {
      ok: true as const,
      value: {
        align: value.align,
        position: value.position,
        tone: value.tone,
        variant: value.variant,
      } satisfies FigJamTextProps,
    }
  }

  return {
    ok: false as const,
    reason: 'Text props require position, variant, alignment, and tone',
  }
}

function FigJamText({
  node,
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamTextProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-text')}
      data-figjam-widget="text"
      data-text-align={props.align}
      data-text-tone={props.tone}
      data-text-variant={props.variant}
    >
      {node.text}
    </div>
  )
}

function FigJamTextFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamTextProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-text',
        'figjam-widget-fallback',
      )}
      data-figjam-widget="text"
      data-figjam-widget-error={reason}
    >
      Text unavailable
    </div>
  )
}

function FigJamTextInspector({
  editProp,
  props,
}: ReactDesignWidgetInspectorProps<FigJamTextProps>) {
  return (
    <div className="figjam-widget-inspector">
      <label>
        <span>Style</span>
        <select
          aria-label="Text style"
          value={props.variant}
          onChange={(event) => editProp(
            'variant',
            event.currentTarget.value as FigJamTextVariant,
            'Change text style',
          )}
        >
          {FIGJAM_TEXT_VARIANTS.map((variant) => (
            <option key={variant} value={variant}>{variant}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

function getFigJamTextDefaultSize(variant: FigJamTextVariant) {
  if (variant === 'card') {
    return { height: 112, width: 220 }
  }

  if (variant === 'label') {
    return { height: 52, width: 192 }
  }

  return { height: 64, width: 190 }
}
