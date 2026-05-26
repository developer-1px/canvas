import type { CanvasOverlayState } from '../../engine'
import { createCanvasSvgFreehandPathData } from './CanvasSvgDrawingPrimitives'

export function CanvasSvgLaserTrail({
  laserTrail,
}: {
  laserTrail: NonNullable<CanvasOverlayState['laserTrail']>
}) {
  return (
    <g className="laser-trail">
      <path
        d={createCanvasSvgFreehandPathData(laserTrail.points)}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasSvgLaserPoint points={laserTrail.points} />
    </g>
  )
}

export function CanvasSvgEmoteBurst({
  burst,
  scale,
}: {
  burst: NonNullable<CanvasOverlayState['emoteBursts']>[number]
  scale: number
}) {
  return (
    <g
      className="emote-burst"
      data-emote={burst.emote}
      transform={`translate(${burst.point.x} ${burst.point.y}) scale(${scale})`}
    >
      {burst.particles.map((particle, index) => (
        <text
          key={index}
          className="emote-burst-particle"
          x={particle.dx}
          y={particle.dy}
        >
          {burst.label}
        </text>
      ))}
    </g>
  )
}

function CanvasSvgLaserPoint({
  points,
}: {
  points: readonly { x: number; y: number }[]
}) {
  const point = points[points.length - 1]

  return point ? (
    <circle
      className="laser-point"
      cx={point.x}
      cy={point.y}
      r="4"
      vectorEffect="non-scaling-stroke"
    />
  ) : null
}
