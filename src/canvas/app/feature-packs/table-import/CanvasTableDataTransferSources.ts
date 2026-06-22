import {
  getCanvasTableSourceFromHTML,
} from './CanvasTableHtmlSources'
import {
  getCanvasTableCsvSourceFromText,
  getCanvasTablePlainTextImportFormat,
  getCanvasTableSourceFromText,
} from './CanvasTableTextSources'

export function getCanvasTableCsvSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  return getCanvasTableCsvSourceFromText(
    dataTransfer.getData('text/csv') || dataTransfer.getData('text/plain'),
  )
}

export function getCanvasTableSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  const tabSeparatedText = dataTransfer.getData('text/tab-separated-values')

  if (tabSeparatedText) {
    return getCanvasTableSourceFromText(tabSeparatedText, {
      format: 'text-tsv',
    })
  }

  const csvText = dataTransfer.getData('text/csv')

  if (csvText) {
    return getCanvasTableSourceFromText(csvText, {
      format: 'text-csv',
    })
  }

  const htmlSource = getCanvasTableSourceFromHTML(
    dataTransfer.getData('text/html'),
  )

  if (htmlSource) {
    return htmlSource
  }

  const markdownText =
    dataTransfer.getData('text/markdown') ||
    dataTransfer.getData('text/x-markdown')
  const markdownSource = getCanvasTableSourceFromText(markdownText, {
    format: 'text-markdown',
  })

  if (markdownSource) {
    return markdownSource
  }

  return getCanvasTableSourceFromText(dataTransfer.getData('text/plain'), {
    format: getCanvasTablePlainTextImportFormat(
      dataTransfer.getData('text/plain'),
    ),
  })
}
