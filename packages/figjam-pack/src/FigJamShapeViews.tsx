import type {
  ReactDesignWidgetFallbackProps,
  ReactDesignWidgetInspectorProps,
  ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_SHAPE_COLORS,
  FIGJAM_SHAPE_KINDS,
  type FigJamShapeColor,
  type FigJamShapeKind,
  type FigJamShapeProps,
} from './FigJamShapeContract'

export function FigJamShape({
  node,
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamShapeProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-shape')}
      data-figjam-widget="shape"
      data-shape-fill={props.fill}
      data-shape-kind={props.shape}
      data-shape-stroke={props.stroke}
    >
      <svg
        aria-hidden="true"
        className="figjam-shape__geometry"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <ShapeGeometry shape={props.shape} />
      </svg>
      <span className="figjam-shape__label">{node.text}</span>
    </div>
  )
}

export function FigJamShapeFallback({
  props,
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamShapeProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-shape',
        'figjam-widget-fallback',
      )}
      data-figjam-widget="shape"
      data-figjam-widget-error={reason}
      data-shape-fill={props.fill}
      data-shape-kind={props.shape}
      data-shape-stroke={props.stroke}
    >
      Shape unavailable
    </div>
  )
}

export function FigJamShapeInspector({
  props,
  editProp,
}: ReactDesignWidgetInspectorProps<FigJamShapeProps>) {
  return (
    <div className="figjam-shape-inspector">
      <label>
        <span>Fill</span>
        <select
          aria-label="Shape fill"
          onChange={(event) => editProp(
            'fill',
            event.currentTarget.value as FigJamShapeColor,
            'Change shape fill',
          )}
          value={props.fill}
        >
          {FIGJAM_SHAPE_COLORS.map((color) => (
            <option key={color} value={color}>
              {toLabel(color)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Shape</span>
        <select
          aria-label="Shape kind"
          onChange={(event) => editProp(
            'shape',
            event.currentTarget.value as FigJamShapeKind,
            'Change shape kind',
          )}
          value={props.shape}
        >
          {FIGJAM_SHAPE_KINDS.map((shape) => (
            <option key={shape} value={shape}>
              {toLabel(shape)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function ShapeGeometry({ shape }: { readonly shape: FigJamShapeKind }) {
  if (shape === 'ellipse') {
    return <ellipse cx="50" cy="50" rx="47" ry="47" />
  }

  if (shape === 'diamond') {
    return <path d="M50 2 98 50 50 98 2 50Z" />
  }

  return <rect height="94" rx="8" width="94" x="3" y="3" />
}

function joinClassNames(...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

function toLabel(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
