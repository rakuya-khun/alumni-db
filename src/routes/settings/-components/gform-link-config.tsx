interface GformLinkConfigProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function GformLinkConfig({ value, onChange, disabled }: GformLinkConfigProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-text-primary">Google Form Link</h3>
      <p className="text-sm text-text-secondary">This URL is included in emails sent to alumni.</p>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://docs.google.com/forms/d/e/..."
        className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary disabled:opacity-60"
      />
    </div>
  )
}
