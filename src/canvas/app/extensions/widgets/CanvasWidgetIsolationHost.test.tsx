import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CanvasWidgetIsolationHost } from './CanvasWidgetIsolationHost'

// Crash isolation (error boundary) and style isolation (shadow root) are
// client-only behaviours and are covered by the browser e2e suite. Here we lock
// the SSR contract: children render inline before the shadow root mounts so
// static markup (used across this suite) still contains the widget body.
describe('CanvasWidgetIsolationHost', () => {
  it('renders widget children inline before the shadow root mounts', () => {
    const markup = renderToStaticMarkup(
      <CanvasWidgetIsolationHost>
        <span className="widget-body">Live region</span>
      </CanvasWidgetIsolationHost>,
    )

    expect(markup).toContain('canvas-widget-shadow-host')
    expect(markup).toContain('class="widget-body"')
    expect(markup).toContain('Live region')
  })

  it('wraps children in a host that can carry a fallback label', () => {
    const markup = renderToStaticMarkup(
      <CanvasWidgetIsolationHost fallbackLabel="Metric unavailable">
        <span>ok</span>
      </CanvasWidgetIsolationHost>,
    )

    // The healthy path renders the child, not the fallback.
    expect(markup).toContain('ok')
    expect(markup).not.toContain('Metric unavailable')
  })

  it('can render children without a shadow host for inspectable widgets', () => {
    const markup = renderToStaticMarkup(
      <CanvasWidgetIsolationHost mode="none">
        <span data-preview-source="Metric.tsx:12:4">Inspectable</span>
      </CanvasWidgetIsolationHost>,
    )

    expect(markup).not.toContain('canvas-widget-shadow-host')
    expect(markup).toContain('data-preview-source="Metric.tsx:12:4"')
  })
})
