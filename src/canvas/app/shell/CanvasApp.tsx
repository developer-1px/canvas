import { useMemo } from 'react'
import { CanvasAppView } from './CanvasAppView'
import {
  useCanvasAppModel,
} from '../workflow'
import {
  resolveCanvasAppAssemblySource,
  type CanvasAppAssemblySource,
} from './CanvasAppAssemblySource'
import './CanvasApp.css'

export type CanvasAppProps = CanvasAppAssemblySource

function CanvasApp({ assembly, assemblyInput }: CanvasAppProps) {
  const resolvedAssembly = useMemo(
    () => resolveCanvasAppAssemblySource({ assembly, assemblyInput }),
    [assembly, assemblyInput],
  )
  const app = useCanvasAppModel({ assembly: resolvedAssembly })

  return <CanvasAppView {...app} />
}

export default CanvasApp
