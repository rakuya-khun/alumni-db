import { DarkModeToggle } from './dark-mode-toggle'
import { FontSizeSelector } from './font-size-selector'

export function PreferencesForm() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Preferences</h3>
      <DarkModeToggle />
      <div className="border-t border-card-border pt-4">
        <FontSizeSelector />
      </div>
    </div>
  )
}
