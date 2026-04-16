// components/UploadZone.tsx
// TODO: Implement in next phase

/**
 * Drag-and-drop file upload zone for CSV files.
 *
 * Props:
 *  - label:      string            — zone label (e.g. "Dataset CSV")
 *  - accept:     string            — accepted MIME types
 *  - onFile:     (file: File) => void
 *  - file:       File | null       — currently selected file
 *
 * Features:
 *  - Drag-and-drop highlight state
 *  - Click-to-browse fallback
 *  - File name + size preview after selection
 *  - Animated border on drag-over
 */

export interface UploadZoneProps {
  label: string
  accept?: string
  onFile: (file: File) => void
  file: File | null
}

export default function UploadZone({ label, onFile, file }: UploadZoneProps) {
  // TODO: implement
  return (
    <div>
      <p>{label}</p>
      <input type="file" accept=".csv" onChange={e => e.target.files && onFile(e.target.files[0])} />
      {file && <p>Selected: {file.name}</p>}
    </div>
  )
}
