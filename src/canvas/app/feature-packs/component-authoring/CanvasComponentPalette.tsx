import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasToolbarRovingFocus,
} from '../toolbar'
import type {
  CanvasComponentSetSummary,
} from '../../../host'

export type CanvasComponentPaletteProps = {
  componentSets?: readonly CanvasComponentSetSummary[]
  components: readonly CanvasComponentPaletteItem[]
  onFocusItems?: (itemIds: readonly string[]) => void
  onInsert: (component: string) => void
}

export type CanvasComponentPaletteItem = {
  accent: string
  fill: string
  id: string
  label: string
  stroke: string
  title: string
}

export function CanvasComponentPalette({
  componentSets = [],
  components,
  onFocusItems,
  onInsert,
}: CanvasComponentPaletteProps) {
  const toolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()

  return (
    <div
      className="component-palette"
      aria-label="Components"
    >
      <div
        {...toolbarRovingFocus}
        className="component-palette-toolbar"
        role="toolbar"
        aria-label="Component templates"
      >
        {components.map((component) => (
          <button
            {...CANVAS_TOOLBAR_ITEM_PROPS}
            key={component.id}
            type="button"
            className="component-button"
            aria-label={component.title}
            title={component.title}
            onClick={() => onInsert(component.id)}
          >
            <ComponentButtonMark component={component} />
          </button>
        ))}
      </div>
      {componentSets.length > 0 ? (
        <div className="component-palette-sets" aria-label="Component parts">
          {componentSets.map((componentSet) => (
            <ComponentSetParts
              componentSet={componentSet}
              key={componentSet.id}
              onFocusItems={onFocusItems}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ComponentSetParts({
  componentSet,
  onFocusItems,
}: {
  componentSet: CanvasComponentSetSummary
  onFocusItems?: (itemIds: readonly string[]) => void
}) {
  return (
    <section className="component-palette-set">
      <div className="component-palette-set-title">
        <span>{componentSet.label}</span>
        <small>{componentSet.instances.length}</small>
      </div>
      <ol className="component-palette-parts">
        {componentSet.parts.map((part) => (
          <li key={part.slotId}>
            {onFocusItems ? (
              <button
                className="component-palette-part"
                type="button"
                aria-label={`${componentSet.label} ${part.label}`}
                onClick={() => onFocusItems(part.itemIds)}
              >
                <span>{part.label}</span>
                <small>{part.itemIds.length}</small>
              </button>
            ) : (
              <span className="component-palette-part">
                <span>{part.label}</span>
                <small>{part.itemIds.length}</small>
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function ComponentButtonMark({
  component,
}: {
  component: CanvasComponentPaletteItem
}) {
  return (
    <span
      className="component-button-mark"
      style={{
        background:
          component.fill === 'transparent' ? '#ffffff' : component.fill,
        borderColor:
          component.stroke === 'transparent'
            ? component.accent
            : component.stroke,
        color: component.accent,
      }}
    >
      {component.label}
    </span>
  )
}
