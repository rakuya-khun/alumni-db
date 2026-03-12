import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What do I do if I can\'t log in?',
    answer: 'Check that you\'re typing the correct username and password. Passwords are case-sensitive. After 3 wrong attempts, you\'ll be locked out for 5 minutes. If you still can\'t log in, contact the Dean to check your account status.',
  },
  {
    question: 'Can I change my password?',
    answer: 'You cannot change your own password. Contact the Dean — they can update your password through the Settings page.',
  },
  {
    question: 'What if the internet is down?',
    answer: 'You can still use the application! You can view data, add or edit records, and prepare emails. When the internet comes back, run a sync to upload your changes.',
  },
  {
    question: 'Can multiple people use the app at the same time?',
    answer: 'Yes. Each person works on their own computer. Use Full Sync regularly to keep everyone\'s data up to date. Conflicts are resolved easily.',
  },
  {
    question: 'What does "Pending Sync" mean?',
    answer: 'It means you\'ve made changes locally that haven\'t been uploaded to the spreadsheet yet. Run a Full Sync or Push to upload.',
  },
  {
    question: 'Can I undo a delete?',
    answer: 'No — once confirmed, deletions are permanent. Always read the confirmation message carefully.',
  },
  {
    question: 'Why can I only see some alumni records?',
    answer: 'Chairpersons only see records for their program. The Dean sees all programs. This is by design for data privacy.',
  },
  {
    question: 'What years are covered in this system?',
    answer: 'The system tracks alumni who graduated from 2018 onwards (the 5-year post-graduation window for PTC-ACBET accreditation).',
  },
  {
    question: 'How often should I sync?',
    answer: 'Sync at the start and end of each work session. You can also enable Auto-Sync for automatic intervals.',
  },
  {
    question: 'What is a "conflict" and how do I fix it?',
    answer: 'A conflict means the same record was changed both locally and in the spreadsheet. You\'ll see both versions side by side and can choose which to keep.',
  },
  {
    question: 'Why can\'t I send emails to all alumni?',
    answer: 'Chairpersons can only email their own program\'s alumni. Only alumni with valid email addresses can receive emails.',
  },
  {
    question: 'What are template variables?',
    answer: 'Placeholders like {{fullName}} that are replaced with each alumni\'s actual data when the email is sent.',
  },
  {
    question: 'What\'s the difference between PDF, Word, and Excel exports?',
    answer: 'PDF is best for printing. Word (DOCX) is best for editing. Excel (XLSX) is best for data analysis and charts.',
  },
  {
    question: 'Can I export data for just one program or year?',
    answer: 'Yes! Use the filter form before generating a report to select specific programs, years, or specializations.',
  },
]

interface FaqTabProps {
  searchQuery: string
}

export function FaqTab({ searchQuery }: FaqTabProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const q = searchQuery.toLowerCase()
  const filtered = FAQ_ITEMS.filter(
    (item) =>
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
  )

  if (filtered.length === 0) {
    return <p className="text-sm text-text-secondary">No matching questions found. Try different keywords.</p>
  }

  return (
    <div className="space-y-2">
      {filtered.map((item, idx) => {
        const isOpen = expanded.has(idx)
        return (
          <div key={idx} className="rounded-lg border border-card-border">
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {item.question}
            </button>
            {isOpen && (
              <div className="border-t border-card-border px-4 py-3">
                <p className="text-sm text-text-secondary">{item.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
