import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'What do I do if I can\'t log in?', a: 'Check your credentials. After 3 failed attempts, wait 5 minutes. Contact the Dean if problems persist.' },
  { q: 'What if the internet is down?', a: 'You can still work offline. Sync your changes when the internet is back.' },
  { q: 'How do I change my password?', a: 'Contact the Dean to update your account in Settings.' },
  { q: 'What does "Pending Sync" mean?', a: 'Your changes are saved locally but not yet uploaded to the spreadsheet.' },
  { q: 'Can I undo a delete?', a: 'No, deletions are permanent. Always confirm carefully when asked.' },
]

export function FaqAccordion() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-text-primary">Frequently Asked Questions</h3>
      {FAQS.map((item, idx) => {
        const isOpen = expanded.has(idx)
        return (
          <div key={idx} className="rounded-lg border border-card-border">
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {item.q}
            </button>
            {isOpen && (
              <div className="border-t border-card-border px-4 py-3">
                <p className="text-sm text-text-secondary">{item.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
