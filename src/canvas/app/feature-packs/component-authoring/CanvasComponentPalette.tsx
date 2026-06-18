import {
  CANVAS_TOOLBAR_ITEM_PROPS,
  useCanvasToolbarRovingFocus,
} from '../toolbar'

type CanvasComponentPaletteProps = {
  components: readonly CanvasComponentPaletteItem[]
  onInsert: (component: string) => void
}

type CanvasComponentPaletteItem = {
  accent: string
  fill: string
  id: string
  label: string
  stroke: string
  title: string
}

export function CanvasComponentPalette({
  components,
  onInsert,
}: CanvasComponentPaletteProps) {
  const toolbarRovingFocus = useCanvasToolbarRovingFocus<HTMLDivElement>()

  return (
    <div
      {...toolbarRovingFocus}
      className="component-palette"
      role="toolbar"
      aria-label="Components"
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
