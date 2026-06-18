import type { ReactNode } from 'react';

export default function StoryCanvasShell({ children, panelsHidden }: { children: ReactNode; panelsHidden: boolean }) {
  if (panelsHidden) {
    return (
      <div className="story-canvas-shell--panels-hidden" data-screen-label="Story Canvas">
        {children}
      </div>
    );
  }

  return (
    <div className="story-canvas-shell" data-screen-label="Story Canvas">
      {children}
    </div>
  );
}
