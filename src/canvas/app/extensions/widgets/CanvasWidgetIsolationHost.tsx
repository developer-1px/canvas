import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

export type CanvasWidgetIsolationMode = 'none' | 'shadow'

// Stable, non-iframe isolation for independent widget objects:
//  - Shadow DOM encapsulates the widget's styles/DOM so a widget can neither
//    leak CSS into the canvas nor inherit canvas chrome styles.
//  - An error boundary contains render-time crashes to a single widget.
// SSR-safe: until the host mounts (and on the server) children render inline so
// static markup still contains them; on the client they move into the shadow
// root after mount.

type CanvasWidgetErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

class CanvasWidgetErrorBoundary extends Component<
  CanvasWidgetErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

function CanvasWidgetShadowHost({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)

  useEffect(() => {
    const host = hostRef.current

    if (host && !shadowRoot) {
      setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: 'open' }))
    }
  }, [shadowRoot])

  return (
    <div
      ref={hostRef}
      className="canvas-widget-shadow-host"
      style={{ blockSize: '100%', inlineSize: '100%' }}
    >
      {shadowRoot ? createPortal(children, shadowRoot) : children}
    </div>
  )
}

export function CanvasWidgetIsolationHost({
  children,
  fallbackLabel = 'Widget unavailable',
  mode = 'shadow',
}: {
  children: ReactNode
  fallbackLabel?: string
  mode?: CanvasWidgetIsolationMode
}) {
  return (
    <CanvasWidgetErrorBoundary
      fallback={
        <div className="canvas-widget-error" role="note">
          {fallbackLabel}
        </div>
      }
    >
      {mode === 'shadow'
        ? <CanvasWidgetShadowHost>{children}</CanvasWidgetShadowHost>
        : children}
    </CanvasWidgetErrorBoundary>
  )
}
