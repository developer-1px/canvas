import { useMemo } from 'react'
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

export type CanvasAppProps = CanvasAppAssemblySource & {
  presence?: readonly CanvasPresenceOverlay[]
}

function CanvasApp({ assembly, assemblyInput, presence }: CanvasAppProps) {
  const resolvedAssembly = useMemo(
    () => resolveCanvasAppAssemblySource({ assembly, assemblyInput }),
    [assembly, assemblyInput],
  )
  const app = useCanvasAppModel({ assembly: resolvedAssembly, presence })

  return <CanvasAppView {...app} />
}

export default CanvasApp
