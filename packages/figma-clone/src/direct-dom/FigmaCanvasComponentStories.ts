import type {
  ReactDesignDefinitionRegistration,
  RegisteredDesignDefinitionSource,
} from '@interactive-os/canvas/react-design'

import { FIGMA_REACT_DEFINITIONS } from './FigmaWorkspaceReactDefinitions'

export type FigmaCanvasComponentStory = {
  readonly definition: ReactDesignDefinitionRegistration
  readonly id: string
  readonly title: string
}

export const FIGMA_CANVAS_COMPONENT_STORIES = Object.freeze(
  FIGMA_REACT_DEFINITIONS.map((definition) => Object.freeze({
    definition,
    id: `${definition.kind}/${definition.id}`,
    title: definition.id,
  })),
) satisfies readonly FigmaCanvasComponentStory[]

/** Demo adapter: a host can build the same shape from CSF or import.meta.glob. */
export function createFigmaCanvasStoryDefinitionSource({
  stories = FIGMA_CANVAS_COMPONENT_STORIES,
}: {
  readonly stories?: readonly FigmaCanvasComponentStory[]
} = {}): RegisteredDesignDefinitionSource<ReactDesignDefinitionRegistration> {
  const definitions = Object.freeze(stories.map((story) => story.definition))

  return Object.freeze({ read: () => definitions })
}
