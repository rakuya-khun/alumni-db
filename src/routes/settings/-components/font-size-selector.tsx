import { Type } from 'lucide-react'
import { useFontSize } from '../-hooks/use-font-size'
import type { FontSize } from '@/stores/ui.store'

const SIZE_OPTIONS: { value: FontSize; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'default', label: 'Default', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
  { value: 'x-large', label: 'Extra Large', preview: 'Aa' },
]

export function FontSizeSelector() {
  const { fontSize, changeFontSize } = useFontSize()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">Font Size</span>
      </div>
      <div className="flex gap-2">
        {SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => changeFontSize(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 px-4 py-3 transition-colors ${
              fontSize === opt.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-card-border bg-card text-text-secondary hover:border-primary/50 hover:bg-surface-secondary'
            }`}
          >
            <span
              className="font-semibold leading-none"
              style={{
                fontSize:
                  opt.value === 'small' ? '13px'
                    : opt.value === 'default' ? '16px'
                      : opt.value === 'large' ? '18px'
                        : '20px',
              }}
            >
              {opt.preview}
            </span>
            <span className="text-xs">{opt.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        Changes the text size across the entire application.
      </p>
    </div>
  )
}
