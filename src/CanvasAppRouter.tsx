import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { FigmaCloneApp } from '@interactive-os/figma-clone'
import { PageStoryCanvas } from './devtools/PageStoryCanvas'
import { CanvasDevToolsDemoApp } from './demo/CanvasDevToolsDemoApp'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './demo/CanvasDemoAssembly'

const rootRoute = createRootRoute({
  component: CanvasRouterOutlet,
})

const indexRoute = createRoute({
  component: FigmaCloneRoute,
  getParentRoute: () => rootRoute,
  path: '/',
})

const figmaRoute = createRoute({
  component: FigmaCloneRoute,
  getParentRoute: () => rootRoute,
  path: '/figma',
})

const engineRoute = createRoute({
  component: CanvasEngineRoute,
  getParentRoute: () => rootRoute,
  path: '/engine',
})

const storyCanvasRoute = createRoute({
  component: StoryCanvasRoute,
  getParentRoute: () => rootRoute,
  path: '/story-canvas',
})

const storyCanvasFoundationRoute = createRoute({
  component: StoryCanvasFoundationRoute,
  getParentRoute: () => rootRoute,
  path: '/story-canvas/foundation',
})

const storyCanvasEntitiesRoute = createRoute({
  component: StoryCanvasEntitiesRoute,
  getParentRoute: () => rootRoute,
  path: '/story-canvas/entities',
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  figmaRoute,
  engineRoute,
  storyCanvasRoute,
  storyCanvasFoundationRoute,
  storyCanvasEntitiesRoute,
])

const canvasRouter = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof canvasRouter
  }
}

export function CanvasAppRouter() {
  return (
    <RouterProvider router={canvasRouter} />
  )
}

function CanvasRouterOutlet() {
  return (
    <Outlet />
  )
}

function FigmaCloneRoute() {
  const demo = new URLSearchParams(window.location.search).get('demo')

  if (demo === 'engine') {
    return (
      <CanvasEngineRoute />
    )
  }

  return (
    <FigmaCloneApp />
  )
}

function CanvasEngineRoute() {
  return (
    <CanvasDevToolsDemoApp
      assemblyInput={DEMO_CANVAS_APP_ASSEMBLY_INPUT}
      featurePackSwitches
    />
  )
}

function StoryCanvasRoute() {
  return (
    <PageStoryCanvas />
  )
}

function StoryCanvasFoundationRoute() {
  return (
    <PageStoryCanvas preset="foundation" />
  )
}

function StoryCanvasEntitiesRoute() {
  return (
    <PageStoryCanvas preset="entities" />
  )
}
