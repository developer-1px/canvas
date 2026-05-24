import { useRef } from 'react'
import {
  CopyImageIcon,
  DownloadIcon,
  PasteImageIcon,
  UploadImageIcon,
} from '../icons/CanvasIcons'

export type CanvasImageControlsProps = {
  canCopyImage: boolean
  canDownloadImage: boolean
  canPasteImage: boolean
  canUploadImage: boolean
  onCopyImage: () => void
  onDownloadImage: () => void
  onPasteImage: () => void
  onUploadFiles: (files: FileList | null) => void
}

export function CanvasImageControls({
  canCopyImage,
  canDownloadImage,
  canPasteImage,
  canUploadImage,
  onCopyImage,
  onDownloadImage,
  onPasteImage,
  onUploadFiles,
}: CanvasImageControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="image-controls" aria-label="Image controls">
      <input
        ref={inputRef}
        className="image-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          onUploadFiles(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      <button
        type="button"
        className="tool-button"
        disabled={!canUploadImage}
        aria-label="Upload image"
        title="Upload image"
        onClick={() => inputRef.current?.click()}
      >
        <UploadImageIcon />
      </button>
      <button
        type="button"
        className="tool-button"
        disabled={!canPasteImage}
        aria-label="Paste image"
        title="Paste image"
        onClick={onPasteImage}
      >
        <PasteImageIcon />
      </button>
      <button
        type="button"
        className="tool-button"
        disabled={!canCopyImage}
        aria-label="Copy image"
        title="Copy image"
        onClick={onCopyImage}
      >
        <CopyImageIcon />
      </button>
      <button
        type="button"
        className="tool-button"
        disabled={!canDownloadImage}
        aria-label="Download image"
        title="Download image"
        onClick={onDownloadImage}
      >
        <DownloadIcon />
      </button>
    </div>
  )
}
