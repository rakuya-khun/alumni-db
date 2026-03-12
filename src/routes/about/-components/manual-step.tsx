interface ManualStepProps {
  number: number
  title: string
  description: string
}

export function ManualStep({ number, title, description }: ManualStepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  )
}
