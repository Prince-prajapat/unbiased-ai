// app/upload/page.tsx — CSV Upload Page
// TODO: Implement in next phase

/**
 * File upload page. Users upload:
 *  - dataset.csv  (with features + actual labels)
 *  - predictions.csv (model output)
 * Then select sensitive attribute + outcome column and trigger audit.
 *
 * On success → redirect to /reports/{report_id}
 */

export default function UploadPage() {
  return (
    <main>
      <h1>Upload Dataset & Predictions</h1>
      {/* TODO: Drag-and-drop upload UI + column selectors + submit */}
    </main>
  )
}
