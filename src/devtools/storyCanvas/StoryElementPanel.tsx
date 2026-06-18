import { createElement, useMemo } from 'react';
import { elementBoxSize, elementDescriptor, type ElementClipGeometry, type LayerElement } from './elementSelection';

export type StoryElementInstanceInfo = {
  canGoToTarget: boolean;
  sourcePath: string;
  targetLabel: string;
  targetPagePath: string | null;
  targetStoryId: string | null;
};

// Figma-style inspector for the selected layer: name, exact TSX source line,
// then Position / Layout / Appearance sections like the Design panel.
export default function StoryElementPanel({
  clipGeometry,
  element,
  instanceInfo,
}: {
  clipGeometry?: ElementClipGeometry | null;
  element: LayerElement;
  instanceInfo?: StoryElementInstanceInfo | null;
}) {
  const descriptor = useMemo(() => elementDescriptor(element), [element]);
  const connected = element.isConnected;
  const box = useMemo(() => connected ? readBox(element) : null, [connected, element]);
  const clipInfo = useMemo(() => clipGeometry?.isClipped ? readClipInfo(clipGeometry) : null, [clipGeometry]);

  return createElement('div', { className: 'story-canvas-element' }, (
    <>
      <div className="story-canvas-element__head">
        <strong>{descriptor.component || descriptor.tag}</strong>
        {instanceInfo ? (
          <em className="story-canvas-element__tag--instance">인스턴스</em>
        ) : (
          <em className="story-canvas-element__tag">{descriptor.tag}</em>
        )}
      </div>
      {connected && box ? (
        <>
          {clipInfo ? (
            <div className="story-canvas-element__clip">
              <strong className="story-canvas-element__clip-title">Overflow clipped</strong>
              <span className="story-canvas-element__clip-desc">{clipInfo}</span>
            </div>
          ) : null}
          <div className="story-canvas-element__section">
            <h3>Position</h3>
            <dl className="story-canvas-spec-grid">
              <ElementSpec label="W" value={box.w} />
              <ElementSpec label="H" value={box.h} />
            </dl>
          </div>
          <div className="story-canvas-element__section">
            <h3>Layout</h3>
            <dl className="story-canvas-spec-grid">
              <ElementSpec label="Padding" value={box.padding} />
              <ElementSpec label="Margin" value={box.margin} />
              <ElementSpec label="Gap" value={box.gap} />
              <ElementSpec label="Display" value={box.display} />
            </dl>
          </div>
          <div className="story-canvas-element__section">
            <h3>Appearance</h3>
            <dl className="story-canvas-spec-grid">
              <ElementSpec label="Radius" value={box.radius} />
              <ElementSpec label="Font" value={box.font} />
            </dl>
          </div>
        </>
      ) : (
        <div className="story-canvas-muted">미리보기가 갱신됨 — 요소를 다시 선택해주세요</div>
      )}
    </>
  ));
}

function readClipInfo(geometry: ElementClipGeometry) {
  const clip = lastNonViewportClip(geometry.clipChain) ?? geometry.clipChain.at(-1);
  const sides = (['top', 'right', 'bottom', 'left'] as const)
    .filter((side) => geometry.clippedSides[side])
    .join(', ');
  if (!clip) return sides ? `visible area clipped: ${sides}` : 'visible area clipped';

  const target = clip.component || clip.tag;
  const overflow = clip.overflowX === clip.overflowY
    ? `overflow: ${clip.overflowX}`
    : `overflow: ${clip.overflowX} / ${clip.overflowY}`;

  return `${target} · ${overflow}${sides ? ` · ${sides}` : ''}`;
}

function lastNonViewportClip(clipChain: ElementClipGeometry['clipChain']) {
  for (let index = clipChain.length - 1; index >= 0; index -= 1) {
    if (clipChain[index]?.tag !== 'viewport') return clipChain[index];
  }
  return null;
}

function ElementSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="story-canvas-spec">
      <dt>{label}</dt>
      <dd title={value}>{value}</dd>
    </div>
  );
}

function readBox(element: LayerElement) {
  const style = window.getComputedStyle(element);
  const size = elementBoxSize(element);

  return {
    display: style.display,
    font: `${style.fontSize} / ${style.fontWeight}`,
    gap: style.gap === 'normal' ? '—' : style.gap,
    h: `${size.h}px`,
    margin: shortenBox(style.marginTop, style.marginRight, style.marginBottom, style.marginLeft),
    padding: shortenBox(style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft),
    radius: style.borderRadius === '0px' ? '—' : style.borderRadius,
    w: `${size.w}px`,
  };
}

function shortenBox(top: string, right: string, bottom: string, left: string) {
  if (top === right && right === bottom && bottom === left) return top === '0px' ? '—' : top;
  if (top === bottom && right === left) return `${top} ${right}`;
  return `${top} ${right} ${bottom} ${left}`;
}
