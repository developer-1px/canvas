import { CanvasAppView } from './CanvasAppView'
import {
  useCanvasAppModel,
  type CanvasAppAssembly,
} from '../workflow'
import './CanvasApp.css'

export type CanvasAppProps = {
  assembly?: CanvasAppAssembly
}

function CanvasApp({ assembly }: CanvasAppProps) {
  const app = useCanvasAppModel({ assembly })

  return <CanvasAppView {...app} />
}

export default CanvasApp
