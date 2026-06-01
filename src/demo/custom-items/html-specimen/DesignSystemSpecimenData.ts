import {
  createDesignSystemSampleArtifact,
  renderDesignSystemSampleArtifact,
} from './DesignSystemSampleArtifact'
import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemTypes'

export function createDesignSystemSpecimenData(): HtmlSpecimenData {
  const artifact = createDesignSystemSampleArtifact()

  return renderDesignSystemSampleArtifact(artifact)
}
