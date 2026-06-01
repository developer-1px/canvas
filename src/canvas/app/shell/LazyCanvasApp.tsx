import {
  lazy,
  Suspense,
} from 'react'
import type {
  CanvasAppProps,
} from './CanvasApp'

const CanvasAppShell = lazy(() => import('./CanvasApp'))

export type {
  CanvasAppProps,
}

function LazyCanvasApp(props: CanvasAppProps) {
  return (
    <Suspense fallback={null}>
      <CanvasAppShell {...props} />
    </Suspense>
  )
}

export default LazyCanvasApp
