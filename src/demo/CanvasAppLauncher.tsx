import {
  ChevronRight,
  Inspect,
  Layers,
  MousePointer2,
  type LucideIcon,
} from 'lucide-react'
import {
  CANVAS_APP_LAUNCH_OPTIONS,
  type CanvasAppLaunchOption,
} from './CanvasRootRoutes'
import './CanvasAppLauncher.css'

const CANVAS_APP_LAUNCH_ICONS = {
  engine: Inspect,
  figjam: MousePointer2,
  figma: Layers,
} satisfies Record<CanvasAppLaunchOption['id'], LucideIcon>

export function CanvasAppLauncher() {
  return (
    <main
      aria-labelledby="canvas-app-launcher-title"
      className="canvas-app-launcher"
    >
      <div className="canvas-app-launcher__shell">
        <header className="canvas-app-launcher__header">
          <div>
            <p className="canvas-app-launcher__product">Interactive OS Canvas</p>
            <h1 id="canvas-app-launcher-title">Choose a canvas</h1>
          </div>
          <p className="canvas-app-launcher__route-summary">
            /figjam /figma /engine
          </p>
        </header>

        <section
          aria-label="Available canvas apps"
          className="canvas-app-launcher__grid"
        >
          {CANVAS_APP_LAUNCH_OPTIONS.map((option) => (
            <CanvasAppLaunchCard key={option.id} option={option} />
          ))}
        </section>
      </div>
    </main>
  )
}

function CanvasAppLaunchCard({
  option,
}: Readonly<{
  option: CanvasAppLaunchOption
}>) {
  const Icon = CANVAS_APP_LAUNCH_ICONS[option.id]

  return (
    <a
      aria-label={`Open ${option.label}`}
      className="canvas-app-launcher__card"
      data-route={option.id}
      href={option.href}
    >
      <span className="canvas-app-launcher__card-top">
        <span aria-hidden="true" className="canvas-app-launcher__icon">
          <Icon size={18} strokeWidth={2} />
        </span>
        <span className="canvas-app-launcher__route">{option.routeLabel}</span>
      </span>

      <span className="canvas-app-launcher__card-copy">
        <span className="canvas-app-launcher__card-title">{option.label}</span>
        <span className="canvas-app-launcher__description">
          {option.description}
        </span>
      </span>

      <span className="canvas-app-launcher__meta">
        {option.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </span>

      <span className="canvas-app-launcher__action">
        Open
        <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
      </span>
    </a>
  )
}
