import { Eye } from 'lucide-react'
import { renderPreview } from '../../../lib/template-engine'

interface EmailPreviewProps {
  subject: string
  body: string
}

export function EmailPreview({ subject, body }: EmailPreviewProps) {
  const previewSubject = renderPreview(subject)
  const previewBody = renderPreview(body)

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-4 w-4 text-text-secondary" />
        <h3 className="text-sm font-semibold text-text-primary">Preview</h3>
        <span className="text-xs text-text-secondary">(with sample data)</span>
      </div>
      <div className="space-y-3">
        <div>
          <span className="text-xs text-text-secondary">Subject:</span>
          <p className="text-sm font-medium text-text-primary">{previewSubject || '(no subject)'}</p>
        </div>
        <div>
          <span className="text-xs text-text-secondary">Body:</span>
          <div className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-secondary p-4 text-sm text-text-primary">
            {previewBody || '(no content)'}
          </div>
        </div>
      </div>
    </div>
  )
}
