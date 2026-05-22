import {
  CANVAS_COMPONENT_TEMPLATES,
  type CanvasComponentTemplate,
} from '../../host'
import type { CanvasComponentKind } from '../../host/model'

type CanvasComponentPaletteProps = {
  onInsert: (component: CanvasComponentKind) => void
}

export function CanvasComponentPalette({
  onInsert,
}: CanvasComponentPaletteProps) {
  return (
    <div className="component-palette" role="toolbar" aria-label="Components">
      {CANVAS_COMPONENT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          className="component-button"
          aria-label={template.title}
          title={template.title}
          onClick={() => onInsert(template.id)}
        >
          <ComponentButtonMark template={template} />
        </button>
      ))}
    </div>
  )
}

function ComponentButtonMark({
  template,
}: {
  template: CanvasComponentTemplate
}) {
  return (
    <span
      className="component-button-mark"
      style={{
        background: template.fill === 'transparent' ? '#ffffff' : template.fill,
        borderColor:
          template.stroke === 'transparent' ? template.accent : template.stroke,
        color: template.accent,
      }}
    >
      {template.label}
    </span>
  )
}
