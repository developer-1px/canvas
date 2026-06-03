import { CanvasDevToolsDemoApp } from './demo/CanvasDevToolsDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './demo/CanvasDemoAssembly'
import { CanvasProductApp } from './product/CanvasProductApp'
import { getCanvasSurfaceRoute } from './CanvasRoute'

export function CanvasRoot({
  pathname,
}: {
  pathname: string
}) {
  return getCanvasSurfaceRoute(pathname) === 'engine' ? (
    <CanvasDevToolsDemoApp assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT} />
  ) : (
    <CanvasProductApp />
  )
}
