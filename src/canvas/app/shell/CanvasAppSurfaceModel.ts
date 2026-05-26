export const CANVAS_APP_SURFACE_IDS = [
  'toolbar',
  'session-timer',
  'spotlight',
  'voting-session',
  'component-palette',
  'drawing-controls',
  'emote-controls',
  'find-replace-panel',
  'image-controls',
  'stamp-controls',
  'selection-floating-bar',
  'context-command-menu',
  'cursor-chat',
  'sticky-quick-create',
  'text-editor',
  'zoom-controls',
  'object-inspector',
  'canvas-status',
] as const

export type CanvasAppSurfaceId = (typeof CANVAS_APP_SURFACE_IDS)[number]

export type CanvasAppSurfaceRegion =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'cursor-adjacent'
  | 'inline-editing'
  | 'object-adjacent'
  | 'pointer'
  | 'right-rail'
  | 'selection-adjacent'
  | 'top-center'
  | 'top-left'
  | 'top-right'

export type CanvasAppSurfaceConcept =
  | 'authoring'
  | 'bottom-center-transient'
  | 'canvas-status'
  | 'contextual-command'
  | 'facilitation'
  | 'inline-editor'
  | 'presence'
  | 'object-adjacent-action'
  | 'right-rail-panel'
  | 'viewport'

type CanvasAppSurfaceExclusiveGroup =
  | 'bottom-center-transient'
  | 'contextual-command'
  | 'right-rail-panel'

export type CanvasAppSurfaceDefinition = {
  concept: CanvasAppSurfaceConcept
  exclusiveGroup?: CanvasAppSurfaceExclusiveGroup
  id: CanvasAppSurfaceId
  priority: number
  region: CanvasAppSurfaceRegion
}

export type CanvasAppSurfaceRequests =
  Partial<Record<CanvasAppSurfaceId, boolean>>

export type CanvasAppSurfaceVisibility =
  Record<CanvasAppSurfaceId, boolean>

export const CANVAS_APP_SURFACE_DEFINITIONS: readonly CanvasAppSurfaceDefinition[] = [
  {
    concept: 'authoring',
    id: 'toolbar',
    priority: 0,
    region: 'top-left',
  },
  {
    concept: 'facilitation',
    id: 'session-timer',
    priority: 0,
    region: 'top-right',
  },
  {
    concept: 'facilitation',
    id: 'spotlight',
    priority: 0,
    region: 'top-center',
  },
  {
    concept: 'facilitation',
    id: 'voting-session',
    priority: 0,
    region: 'top-right',
  },
  {
    concept: 'right-rail-panel',
    exclusiveGroup: 'right-rail-panel',
    id: 'component-palette',
    priority: 10,
    region: 'right-rail',
  },
  {
    concept: 'authoring',
    id: 'drawing-controls',
    priority: 0,
    region: 'top-left',
  },
  {
    concept: 'bottom-center-transient',
    exclusiveGroup: 'bottom-center-transient',
    id: 'emote-controls',
    priority: 10,
    region: 'bottom-center',
  },
  {
    concept: 'bottom-center-transient',
    exclusiveGroup: 'bottom-center-transient',
    id: 'find-replace-panel',
    priority: 20,
    region: 'bottom-center',
  },
  {
    concept: 'authoring',
    id: 'image-controls',
    priority: 0,
    region: 'top-left',
  },
  {
    concept: 'facilitation',
    id: 'stamp-controls',
    priority: 0,
    region: 'top-right',
  },
  {
    concept: 'contextual-command',
    exclusiveGroup: 'contextual-command',
    id: 'selection-floating-bar',
    priority: 10,
    region: 'selection-adjacent',
  },
  {
    concept: 'contextual-command',
    exclusiveGroup: 'contextual-command',
    id: 'context-command-menu',
    priority: 20,
    region: 'pointer',
  },
  {
    concept: 'presence',
    id: 'cursor-chat',
    priority: 0,
    region: 'cursor-adjacent',
  },
  {
    concept: 'object-adjacent-action',
    id: 'sticky-quick-create',
    priority: 0,
    region: 'object-adjacent',
  },
  {
    concept: 'inline-editor',
    id: 'text-editor',
    priority: 0,
    region: 'inline-editing',
  },
  {
    concept: 'viewport',
    id: 'zoom-controls',
    priority: 0,
    region: 'bottom-left',
  },
  {
    concept: 'right-rail-panel',
    exclusiveGroup: 'right-rail-panel',
    id: 'object-inspector',
    priority: 20,
    region: 'right-rail',
  },
  {
    concept: 'canvas-status',
    id: 'canvas-status',
    priority: 0,
    region: 'bottom-right',
  },
]

export function getCanvasAppSurfaceVisibility(
  requests: CanvasAppSurfaceRequests,
): CanvasAppSurfaceVisibility {
  const visibility = Object.fromEntries(
    CANVAS_APP_SURFACE_IDS.map((id) => [id, requests[id] === true]),
  ) as CanvasAppSurfaceVisibility

  for (const group of getCanvasAppExclusiveSurfaceGroups()) {
    const visibleSurface = group
      .filter((surface) => requests[surface.id] === true)
      .sort((left, right) => right.priority - left.priority)[0]

    for (const surface of group) {
      visibility[surface.id] = surface.id === visibleSurface?.id
    }
  }

  return visibility
}

function getCanvasAppExclusiveSurfaceGroups() {
  const groups = new Map<
    CanvasAppSurfaceExclusiveGroup,
    CanvasAppSurfaceDefinition[]
  >()

  for (const surface of CANVAS_APP_SURFACE_DEFINITIONS) {
    if (!surface.exclusiveGroup) {
      continue
    }

    const group = groups.get(surface.exclusiveGroup) ?? []
    group.push(surface)
    groups.set(surface.exclusiveGroup, group)
  }

  return groups.values()
}
