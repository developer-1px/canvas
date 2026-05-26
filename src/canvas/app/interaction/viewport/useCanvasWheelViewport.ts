import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../../engine'
import type { Viewport } from '../../../entities'
import type { CanvasAppStageElement } from '../../stage/CanvasAppStageElement'
import { runCanvasWheelViewport } from './CanvasWheelViewportExecution'

type UseCanvasWheelViewportArgs = {
  config: CanvasAffordanceConfig
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export function useCanvasWheelViewport({
  config,
  setViewport,
  stageElement,
}: UseCanvasWheelViewportArgs) {
  useEffect(() => {
    return stageElement.addWheelListener((event, rect) => {
      runCanvasWheelViewport({
        config,
        event,
        rect,
        setViewport,
      })
    })
  }, [config, setViewport, stageElement])
}
