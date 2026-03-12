import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { AlumniFormData } from '../-schemas/alumni.schema'

interface CheckboxGroupProps {
  form: UseFormReturn<AlumniFormData>
  name: keyof AlumniFormData
  otherName?: keyof AlumniFormData
  label: string
  options: readonly string[]
  required?: boolean
}

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-text-primary">
      {label}
      {required && <span className="text-error"> *</span>}
    </label>
  )
}

export function CheckboxGroup({ form, name, otherName, label, options, required }: CheckboxGroupProps) {
  const { setValue, watch } = form
  const rawValue = watch(name) as string | null | undefined
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!rawValue) return new Set()
    return new Set(rawValue.split(',').map((s) => s.trim()).filter(Boolean))
  })

  // Sync from form value on external changes (e.g., reset/load)
  useEffect(() => {
    const parsed = rawValue ? new Set(rawValue.split(',').map((s) => s.trim()).filter(Boolean)) : new Set<string>()
    setSelected(parsed)
  }, [rawValue])

  const hasOther = selected.has('Other')

  function handleToggle(option: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(option)) {
        next.delete(option)
      } else {
        next.add(option)
      }
      const joined = Array.from(next).join(', ')
      setValue(name, joined || null, { shouldDirty: true })

      // Clear "other" text when "Other" is unchecked
      if (option === 'Other' && !next.has('Other') && otherName) {
        setValue(otherName, null, { shouldDirty: true })
      }
      return next
    })
  }

  return (
    <div>
      <FormLabel label={label} required={required} />
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-card-border px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/10"
          >
            <input
              type="checkbox"
              checked={selected.has(option)}
              onChange={() => handleToggle(option)}
              className="accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
      {hasOther && otherName && (
        <div className="mt-2">
          <input
            value={(watch(otherName) as string) ?? ''}
            onChange={(e) => setValue(otherName, e.target.value || null, { shouldDirty: true })}
            placeholder="Please specify..."
            className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  )
}
