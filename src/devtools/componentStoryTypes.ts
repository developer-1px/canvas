import type { ComponentType, ReactNode } from 'react';
import type { ComponentLayer, ComponentPreviewFrame } from './componentLayerRegistry';

export type StoryComponent = ComponentType<Record<string, unknown>>;

type PropsOf<TComponent> = TComponent extends ComponentType<infer TProps> ? TProps : Record<string, never>;
type NormalizedComponent<TComponent> = TComponent extends ComponentType<infer TProps>
  ? ComponentType<TProps>
  : ComponentType<Record<string, never>>;
type ComponentOf<TMetaOrComponent> =
  TMetaOrComponent extends Meta<infer TComponent>
    ? NormalizedComponent<TComponent>
    : NormalizedComponent<TMetaOrComponent>;

export type CstarStoryParameters = {
  cstar: {
    area: string;
    category: string;
    layer: ComponentLayer;
    path: string;
    previewFrame?: ComponentPreviewFrame;
    role: string;
  };
};

export type Meta<TComponent = ComponentType<Record<string, never>>> = {
  component: TComponent;
  parameters: CstarStoryParameters;
  tags?: string[];
  title: string;
};

export type StoryObj<TMetaOrComponent> = {
  args?: Partial<PropsOf<ComponentOf<TMetaOrComponent>>>;
  name?: string;
  parameters?: {
    cstar?: Partial<CstarStoryParameters['cstar']>;
  };
  render?: (args: Partial<PropsOf<ComponentOf<TMetaOrComponent>>>) => ReactNode;
};
