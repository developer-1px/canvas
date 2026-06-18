import { Component, type ReactNode } from 'react';

type StoryPreviewBoundaryProps = {
  children: ReactNode;
  storyId: string;
};

type StoryPreviewBoundaryState = {
  error: string | null;
};

export default class StoryPreviewBoundary extends Component<StoryPreviewBoundaryProps, StoryPreviewBoundaryState> {
  state: StoryPreviewBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): StoryPreviewBoundaryState {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  componentDidUpdate(prevProps: StoryPreviewBoundaryProps) {
    if (prevProps.storyId !== this.props.storyId && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="story-canvas-render-failure" role="alert">
          <strong>Render error</strong>
          <span>{this.state.error}</span>
        </div>
      );
    }

    return this.props.children;
  }
}
