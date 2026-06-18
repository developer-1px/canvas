import type { CSSProperties } from 'react';
import {
  edgeDistances,
  elementDescriptor,
  isInstanceElementForStory,
  localRect,
  type LayerElement,
  type LocalRect,
} from './elementSelection';

// Figma-style overlay for transient feedback inside a card: hover outline +
// name label, and Alt-hover distances anchored to the selection. The selected
// box itself (outline/handles/badge) is drawn by the stage-level selection
// layer so neighboring frames can never paint over it.
export default function StoryElementOverlay({
  cardRoot,
  hoverElement,
  selectedElement,
  showDistances,
  storyPath,
}: {
  cardRoot: HTMLElement | null;
  hoverElement: LayerElement | null;
  selectedElement: LayerElement | null;
  showDistances: boolean;
  storyPath: string;
}) {
  if (!cardRoot) return null;

  const selected = selectedElement?.isConnected ? selectedElement : null;
  const hover = hoverElement?.isConnected && hoverElement !== selected ? hoverElement : null;
  const selectedRect = selected ? localRect(cardRoot, selected) : null;
  const hoverRect = hover ? localRect(cardRoot, hover) : null;
  const hoverIsInstance = hover ? isInstanceElementForStory(hover, storyPath) : false;
  const distances = showDistances && selectedRect && hoverRect ? edgeDistances(selectedRect, hoverRect) : [];

  if (!hoverRect && distances.length === 0) return null;

  return (
    <div className="story-el-overlay" aria-hidden="true">
      {hoverRect && hover ? (
        hoverIsInstance ? (
          <div
            className="story-el-hover--instance"
            style={rectStyle(hoverRect)}
          >
            <span className="story-el-hover__label--instance">
              {labelFor(hover)} · instance
            </span>
          </div>
        ) : (
          <div
            className="story-el-hover"
            style={rectStyle(hoverRect)}
          >
            <span className="story-el-hover__label">
              {labelFor(hover)}
            </span>
          </div>
        )
      ) : null}
      {distances.map((distance) => {
        if (distance.axis === 'x') {
          return (
            <div
              className="story-el-distance-x"
              key={`${distance.axis}-${distance.from.x}-${distance.from.y}`}
              style={distanceLineStyle(distance)}
            >
              <span>{Math.round(distance.length)}</span>
            </div>
          );
        }

        return (
          <div
            className="story-el-distance-y"
            key={`${distance.axis}-${distance.from.x}-${distance.from.y}`}
            style={distanceLineStyle(distance)}
          >
            <span>{Math.round(distance.length)}</span>
          </div>
        );
      })}
    </div>
  );
}

function rectStyle(rect: LocalRect): CSSProperties {
  return {
    height: rect.h,
    left: rect.x,
    top: rect.y,
    width: rect.w,
  };
}

function distanceLineStyle(distance: ReturnType<typeof edgeDistances>[number]): CSSProperties {
  if (distance.axis === 'x') {
    return {
      left: distance.from.x,
      top: distance.from.y,
      width: distance.length,
    };
  }

  return {
    height: distance.length,
    left: distance.from.x,
    top: distance.from.y,
  };
}

function labelFor(element: LayerElement) {
  const descriptor = elementDescriptor(element);
  return descriptor.component || descriptor.tag;
}
