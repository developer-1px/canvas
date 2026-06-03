export type CanvasSurfaceRoute = 'engine' | 'product'

export function getCanvasSurfaceRoute(pathname: string): CanvasSurfaceRoute {
  return pathname === '/engine' || pathname.startsWith('/engine/')
    ? 'engine'
    : 'product'
}
