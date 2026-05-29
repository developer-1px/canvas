import type { CanvasCustomItem } from '../../../canvas'
import {
  createDesignSystemSampleArtifact,
  renderDesignSystemSampleArtifact,
  type DesignSystemSampleArtifact,
} from './DesignSystemSampleArtifact'

export type HtmlSpecimenData = {
  artifact?: DesignSystemSampleArtifact
  css: string
  html: string
  viewportHeight: number
  viewportWidth: number
}

export function isHtmlSpecimenItem(
  item: unknown,
): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'html-specimen'
  )
}

export function isHtmlSpecimenData(value: unknown): value is HtmlSpecimenData {
  return (
    isRecord(value) &&
    typeof value.html === 'string' &&
    value.html.trim().length > 0 &&
    typeof value.css === 'string' &&
    isPositiveNumber(value.viewportWidth) &&
    isPositiveNumber(value.viewportHeight)
  )
}

export function getHtmlSpecimenData(item: CanvasCustomItem): HtmlSpecimenData {
  return isHtmlSpecimenData(item.data)
    ? item.data
    : {
        css: '',
        html: '<main></main>',
        viewportHeight: item.h,
        viewportWidth: item.w,
      }
}

export function createButtonSpecimenData(): HtmlSpecimenData {
  return {
    viewportHeight: 188,
    viewportWidth: 360,
    html: `<main
  class="specimen"
  data-surface-kind="react"
  data-surface-component="ButtonSpecimen"
  data-surface-source="src/components/Button.stories.tsx"
>
  <button
    class="button primary"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"primary"}'
  >Create project</button>
  <button
    class="button secondary"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"secondary"}'
  >Invite team</button>
  <button
    class="button danger"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"danger"}'
  >Delete</button>
</main>`,
    css: `.specimen {
  display: grid;
  min-height: 100vh;
  align-content: center;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
}
.button {
  height: 42px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 700 14px/1 system-ui;
}
.primary {
  color: #ffffff;
  background: #2563eb;
}
.secondary {
  color: #172033;
  background: #ffffff;
  border-color: #d8dee8;
}
.danger {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}`,
  }
}

export function createDesignSystemSpecimenData(): HtmlSpecimenData {
  const artifact = createDesignSystemSampleArtifact()

  return {
    ...renderDesignSystemSampleArtifact(artifact),
    artifact,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
