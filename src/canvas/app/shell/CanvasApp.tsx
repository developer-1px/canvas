import {
  type ReactNode,
  useMemo,
} from 'react'
import { CanvasAppView } from './CanvasAppView'
import {
  useCanvasAppModel,
} from '../workflow'
import {
  resolveCanvasAppAssemblySource,
  type CanvasAppAssemblySource,
} from './CanvasAppAssemblySource'
import type { CanvasPresenceOverlay } from '../../engine'
import './CanvasApp.css'

type CanvasAppModel = ReturnType<typeof useCanvasAppModel>

export type CanvasAppProps = CanvasAppAssemblySource & {
  presence?: readonly CanvasPresenceOverlay[]
  renderApp?: (app: CanvasAppModel) => ReactNode
}

function CanvasApp({
  assembly,
  assemblyInput,
  presence,
  renderApp,
}: CanvasAppProps) {
  const resolvedAssembly = useMemo(
    () => resolveCanvasAppAssemblySource({ assembly, assemblyInput }),
    [assembly, assemblyInput],
  )
  const app = useCanvasAppModel({ assembly: resolvedAssembly, presence })

  return renderApp ? <>{renderApp(app)}</> : <CanvasAppView {...app} />
}

export default CanvasApp
