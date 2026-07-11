export type CanvasRootRouteId =
  | 'engine'
  | 'figjam'
  | 'figjam-widgets'
  | 'figma'
  | 'launcher'

export type CanvasAppLaunchOption = Readonly<{
  description: string
  href: string
  id: Exclude<CanvasRootRouteId, 'figjam-widgets' | 'launcher'>
  label: string
  meta: readonly string[]
  routeLabel: string
}>

export const CANVAS_APP_LAUNCH_OPTIONS = [
  {
    description:
      'Whiteboard canvas with sticky notes, comments, stamps, drawing tools, and object actions.',
    href: '/figjam',
    id: 'figjam',
    label: 'FigJam canvas',
    meta: ['Whiteboard', 'Collaboration surface', 'Canvas tools'],
    routeLabel: '/figjam',
  },
  {
    description:
      'Figma-like layout editor with layers, responsive frames, auto-layout controls, and inspector panels.',
    href: '/figma',
    id: 'figma',
    label: 'Figma editor',
    meta: ['Layout editor', 'DOM frames', 'Inspector'],
    routeLabel: '/figma',
  },
  {
    description:
      'Minimal engine playground for canvas primitives, feature packs, commands, and affordance checks.',
    href: '/engine',
    id: 'engine',
    label: 'Engine playground',
    meta: ['Engine demo', 'Feature packs', 'Test route'],
    routeLabel: '/engine',
  },
] as const satisfies readonly CanvasAppLaunchOption[]

export function resolveCanvasRootRoute({
  pathname,
  search,
}: Readonly<{
  pathname: string
  search: string
}>): CanvasRootRouteId {
  const demoRoute = normalizeCanvasRootRouteId(
    new URLSearchParams(search).get('demo'),
  )

  if (demoRoute) {
    return demoRoute
  }

  const pathRoute = normalizeCanvasRootRouteId(getCanvasRootPathSegment(pathname))

  return pathRoute ?? 'launcher'
}

function getCanvasRootPathSegment(pathname: string): string | null {
  return pathname.split('/').filter(Boolean)[0] ?? null
}

function normalizeCanvasRootRouteId(value: string | null): CanvasRootRouteId | null {
  switch (value?.toLowerCase()) {
    case 'canvas':
    case 'engine':
    case 'minimal':
      return 'engine'
    case 'figjam':
    case 'whiteboard':
      return 'figjam'
    case 'figjam-widgets':
      return 'figjam-widgets'
    case 'figma':
      return 'figma'
    default:
      return null
  }
}
