/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  isJSONObject,
  isNullableString,
  isPositiveFiniteNumber,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_IMAGE_DEFINITION_ID = 'figjam.image'

export type FigJamImageProps = {
  readonly alt: string
  readonly mimeType: string | null
  readonly name: string | null
  readonly naturalHeight: number | null
  readonly naturalWidth: number | null
  readonly position: 'absolute'
  readonly src: string | null
}

export type CreateFigJamImageNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly alt?: string
    readonly mimeType?: string | null
    readonly name?: string | null
    readonly naturalHeight?: number | null
    readonly naturalWidth?: number | null
    readonly src?: string | null
  }

export const FIGJAM_IMAGE_DEFAULT_PROPS = Object.freeze({
  alt: '',
  mimeType: null,
  name: null,
  naturalHeight: null,
  naturalWidth: null,
  position: 'absolute',
  src: null,
} as const satisfies FigJamImageProps)

export const FIGJAM_IMAGE_DEFINITION =
  defineReactDesignWidget<FigJamImageProps>({
    id: FIGJAM_IMAGE_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_IMAGE_DEFAULT_PROPS,
      safeParse: parseFigJamImageProps,
    },
    create: ({ nodeId, x, y }) => createFigJamImageNode({ nodeId, x, y }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
    renderer: FigJamImage,
    fallback: FigJamImageFallback,
  })

export function createFigJamImageNode({
  alt = '',
  height = 154,
  mimeType = null,
  name = null,
  naturalHeight = null,
  naturalWidth = null,
  nodeId,
  src = null,
  width = 240,
  x,
  y,
}: CreateFigJamImageNodeInput) {
  const parsed = parseFigJamImageProps({
    alt,
    mimeType,
    name,
    naturalHeight,
    naturalWidth,
    position: 'absolute',
    src,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_IMAGE_DEFINITION_ID,
    height,
    label: src ? 'Image' : 'Image placeholder',
    nodeId,
    props: cloneDesignProps(parsed.value),
    text: null,
    width,
    x,
    y,
  })
}

export function parseFigJamImageProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isNullableString(value.src) &&
    isNullableString(value.mimeType) &&
    isNullableString(value.name) &&
    typeof value.alt === 'string' &&
    isNullablePositiveNumber(value.naturalWidth) &&
    isNullablePositiveNumber(value.naturalHeight) &&
    (value.src === null || value.src.startsWith('data:image/')) &&
    (value.mimeType === null || value.mimeType.startsWith('image/'))
  ) {
    return {
      ok: true as const,
      value: {
        alt: value.alt,
        mimeType: value.mimeType,
        name: value.name,
        naturalHeight: value.naturalHeight,
        naturalWidth: value.naturalWidth,
        position: value.position,
        src: value.src,
      } satisfies FigJamImageProps,
    }
  }

  return { ok: false as const, reason: 'Image props require safe image metadata' }
}

function FigJamImage({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamImageProps>) {
  return (
    <figure
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-image')}
      data-figjam-widget="image"
      data-image-placeholder={props.src === null || undefined}
    >
      {props.src ? (
        <img alt={props.alt} draggable={false} src={props.src} />
      ) : (
        <span>Image placeholder</span>
      )}
    </figure>
  )
}

function FigJamImageFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamImageProps>) {
  return (
    <figure
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-image', 'figjam-widget-fallback')}
      data-figjam-widget="image"
      data-figjam-widget-error={reason}
    >
      Image unavailable
    </figure>
  )
}

function isNullablePositiveNumber(value: unknown): value is number | null {
  return value === null || isPositiveFiniteNumber(value)
}
