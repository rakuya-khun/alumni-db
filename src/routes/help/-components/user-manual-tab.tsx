import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface ManualStep {
  title: string
  content: string[]
}

const SECTIONS: { heading: string; steps: ManualStep[] }[] = [
  {
    heading: 'Getting Started',
    steps: [
      {
        title: 'Step 1: Opening the Application',
        content: [
          'Find the "Alumni DB" icon on your desktop and double-click it.',
          'The application window opens and shows the login screen.',
          'Tip: If you don\'t see the icon, ask the Dean or your IT support to reinstall the application.',
        ],
      },
      {
        title: 'Step 2: Logging In',
        content: [
          'Type your username and password, then click "Log In".',
          'If correct, you\'ll be taken to the Dashboard. If wrong, you\'ll see an error message.',
          'After 3 wrong attempts, you\'ll be locked out for 5 minutes. Just wait and try again.',
          'If you see an "Offline Mode" badge, don\'t worry — you can still log in using your saved credentials.',
        ],
      },
      {
        title: 'Step 3: First-Time Setup (Dean Only)',
        content: [
          'The first time the Dean logs in, the app will ask you to set up connections.',
          'Set up the email connection — enter the email server details provided by IT.',
          'Set up the spreadsheet connection — enter the Google Sheet ID and upload the service account key file.',
          'Click "Test Connection" for both to make sure they work, then click "Save".',
        ],
      },
      {
        title: 'Step 4: Understanding Your Dashboard',
        content: [
          'After logging in, you\'ll see the Dashboard — this is your home page.',
          'You\'ll see: Total Responses, Program Counts, Key Percentages (board passers, employed, field-related, supervisory), Survey Tables, and Charts.',
          'If you\'re a Chairperson, you\'ll only see data for your program. The Dean sees everything.',
        ],
      },
    ],
  },
  {
    heading: 'Managing Alumni Records',
    steps: [
      {
        title: 'Step 5: Viewing Alumni Records',
        content: [
          'Click "Alumni Directory" in the left sidebar.',
          'You\'ll see a table of all alumni records with name, program, year, and employment status.',
          'Use the search bar to find a specific person, or use filters to narrow results.',
        ],
      },
      {
        title: 'Step 6: Adding a New Alumni Record',
        content: [
          'On the Alumni Directory page, click "Add Alumni" in the top right.',
          'Fill in the required fields (marked with a red asterisk *).',
          'Click "Save". The record is saved locally and marked as "Pending Sync."',
        ],
      },
      {
        title: 'Step 7: Editing an Alumni Record',
        content: [
          'In the Alumni Directory, find the record and click the pencil icon or "Edit" button.',
          'Make your changes and click "Save".',
          'Every edit automatically saves a copy of the old version for history tracking.',
        ],
      },
      {
        title: 'Step 8: Deleting an Alumni Record',
        content: [
          'Find the record and click the trash icon or "Delete" button.',
          'A confirmation dialog appears. Click "Delete" to confirm or "Cancel" to go back.',
          'Warning: Deletions are permanent and cannot be undone.',
        ],
      },
    ],
  },
  {
    heading: 'Viewing Alumni Profiles',
    steps: [
      {
        title: 'Step 9: Browsing Alumni Profiles',
        content: [
          'Click "Alumni Profiling" in the left sidebar.',
          'You\'ll see a searchable list of all alumni. Click on any name to view their full profile.',
        ],
      },
      {
        title: 'Step 10: Understanding Profile Views',
        content: [
          'Each profile has 3 tabs: History (every record version), Latest Updates (recent changes highlighted), and Timeline (visual timeline of changes).',
        ],
      },
    ],
  },
  {
    heading: 'Working with Data',
    steps: [
      {
        title: 'Step 11: Syncing Data',
        content: [
          'Click "Data Sync" in the left sidebar.',
          'You\'ll see: Pull (download from spreadsheet), Push (upload changes), Full Sync (both), and Auto-Sync.',
          'Recommendation: Use "Full Sync" at the start and end of each work day.',
        ],
      },
      {
        title: 'Step 12: Understanding Sync Status',
        content: [
          'Synced (green) — record matches the spreadsheet.',
          'Pending (yellow) — local changes not yet uploaded.',
          'Conflict (red) — changed both locally and in the spreadsheet.',
        ],
      },
      {
        title: 'Step 13: Resolving Conflicts',
        content: [
          'You\'ll see a side-by-side comparison of your version and the spreadsheet version.',
          'Choose: Keep Mine, Keep Theirs, or Merge (pick individual fields).',
          'Conflicts are normal and easy to resolve. Just pick the version that looks most correct.',
        ],
      },
    ],
  },
  {
    heading: 'Sending Emails',
    steps: [
      {
        title: 'Step 14: Selecting Recipients',
        content: [
          'Click "Sending Emails" then "Compose".',
          'Use filters to select which alumni will receive the email.',
          'Chairpersons can only email alumni from their own program.',
        ],
      },
      {
        title: 'Step 15: Composing and Sending',
        content: [
          'Write your subject line and email body.',
          'Use template variables like {{fullName}} and {{program}} for personalization.',
          'Toggle the Google Form link switch to include the survey link.',
          'Click "Preview" to review, then "Send Email" to send.',
        ],
      },
      {
        title: 'Step 16: Checking Email History',
        content: [
          'Go to "Sending Emails" → "History" tab.',
          'See all previously sent emails with date, subject, recipient count, and status.',
        ],
      },
    ],
  },
  {
    heading: 'Reports, Settings & Preferences',
    steps: [
      {
        title: 'Step 17: Exporting Data',
        content: [
          'Click "Reports & Exports" in the sidebar.',
          'Choose PDF (for printing), Word (for editing), or Excel (for data analysis).',
          'Use filters to select specific programs, years, or specializations before generating.',
        ],
      },
      {
        title: 'Step 18: Printing a Report',
        content: [
          'Use the "Print Preview" button to see the print-friendly layout.',
          'Click "Print" to send to your printer.',
        ],
      },
      {
        title: 'Step 19: Managing User Accounts (Dean Only)',
        content: [
          'Go to "Settings" → "Accounts" section.',
          'Add, edit, or deactivate accounts. Assign roles: CE Chair, CpE Chair, EE Chair.',
        ],
      },
      {
        title: 'Step 20: Changing Preferences',
        content: [
          'Go to "Settings" → "Preferences".',
          'Toggle Dark Mode and display preferences. Changes are saved automatically.',
        ],
      },
    ],
  },
]

interface UserManualTabProps {
  searchQuery: string
}

export function UserManualTab({ searchQuery }: UserManualTabProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const q = searchQuery.toLowerCase()

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => {
        const filteredSteps = section.steps.filter(
          (step) =>
            !q ||
            step.title.toLowerCase().includes(q) ||
            step.content.some((c) => c.toLowerCase().includes(q))
        )
        if (filteredSteps.length === 0) return null

        return (
          <div key={section.heading}>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">{section.heading}</h3>
            <div className="space-y-2">
              {filteredSteps.map((step) => {
                const key = step.title
                const isOpen = expanded.has(key)
                return (
                  <div key={key} className="rounded-lg border border-card-border">
                    <button
                      onClick={() => toggle(key)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-surface-secondary"
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {step.title}
                    </button>
                    {isOpen && (
                      <div className="border-t border-card-border px-4 py-3 space-y-2">
                        {step.content.map((line, i) => (
                          <p key={i} className="text-sm text-text-secondary">{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
