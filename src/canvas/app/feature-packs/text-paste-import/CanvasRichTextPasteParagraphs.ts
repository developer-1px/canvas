import type {
  CanvasRichTextPasteParagraph,
  CanvasRichTextPasteRun,
} from './CanvasRichTextPasteContracts'

export function normalizeCanvasRichTextParagraphs(
  paragraphs: readonly CanvasRichTextPasteParagraph[],
) {
  return paragraphs.flatMap((paragraph) => {
    const splitParagraphs: CanvasRichTextPasteParagraph[] = []
    let runs: CanvasRichTextPasteRun[] = []

    for (const run of paragraph.runs) {
      const chunks = run.text.split('\n')

      chunks.forEach((chunk, index) => {
        if (index > 0) {
          if (runs.length > 0) {
            splitParagraphs.push({
              ...getCanvasRichTextParagraphMetadata(paragraph),
              runs,
            })
          }
          runs = []
        }

        if (chunk.length > 0) {
          runs.push({
            ...run,
            text: chunk,
          })
        }
      })
    }

    if (runs.length > 0) {
      splitParagraphs.push({
        ...getCanvasRichTextParagraphMetadata(paragraph),
        runs,
      })
    }

    return splitParagraphs
  })
}

export function hasCanvasRichTextFormatting(
  paragraphs: readonly CanvasRichTextPasteParagraph[],
) {
  return paragraphs.some((paragraph) =>
    Boolean(paragraph.bullet) ||
    paragraph.align !== undefined ||
    paragraph.headingLevel !== undefined ||
    paragraph.lineHeight !== undefined ||
    paragraph.spacingAfter !== undefined ||
    paragraph.spacingBefore !== undefined ||
    paragraph.runs.some((run) =>
      run.bold === true ||
      run.code === true ||
      run.fontSize !== undefined ||
      run.italic === true ||
      run.strikethrough === true ||
      run.underline === true ||
      Boolean(run.color) ||
      Boolean(run.link)))
}

function getCanvasRichTextParagraphMetadata(
  paragraph: CanvasRichTextPasteParagraph,
): Omit<CanvasRichTextPasteParagraph, 'runs'> {
  return {
    ...(paragraph.align ? { align: paragraph.align } : {}),
    ...(paragraph.bullet ? { bullet: paragraph.bullet } : {}),
    ...(paragraph.headingLevel ? { headingLevel: paragraph.headingLevel } : {}),
    ...(paragraph.lineHeight !== undefined
      ? { lineHeight: paragraph.lineHeight }
      : {}),
    ...(paragraph.spacingAfter !== undefined
      ? { spacingAfter: paragraph.spacingAfter }
      : {}),
    ...(paragraph.spacingBefore !== undefined
      ? { spacingBefore: paragraph.spacingBefore }
      : {}),
  }
}
