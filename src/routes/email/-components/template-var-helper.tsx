import { getAvailableVariables } from '../../../lib/template-engine'

interface TemplateVarHelperProps {
  onInsert: (variable: string) => void
}

export function TemplateVarHelper({ onInsert }: TemplateVarHelperProps) {
  const variables = getAvailableVariables()

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary">Click to insert template variable:</p>
      <div className="flex flex-wrap gap-2">
        {variables.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onInsert(`{{${key}}}`)}
            className="rounded-md border border-card-border bg-surface-primary px-3 py-1.5 text-xs font-mono text-text-primary hover:bg-surface-secondary transition-colors"
          >
            {'{{' + key + '}}'}
            <span className="ml-1 text-text-secondary font-sans">({label})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
