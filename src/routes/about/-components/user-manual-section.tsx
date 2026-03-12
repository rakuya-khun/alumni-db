import { ManualStep } from './manual-step'
import { FaqAccordion } from './faq-accordion'

const STEPS = [
  { title: 'Opening the Application', desc: 'Double-click the Alumni DB icon on your desktop to start the application.' },
  { title: 'Logging In', desc: 'Enter your username and password, then click "Log In".' },
  { title: 'First-Time Setup (Dean Only)', desc: 'Configure email and spreadsheet connections when prompted.' },
  { title: 'Understanding Your Dashboard', desc: 'View total responses, program counts, key percentages, and charts.' },
  { title: 'Viewing Alumni Records', desc: 'Click "Alumni Directory" to browse, search, and filter records.' },
  { title: 'Adding a New Alumni', desc: 'Click "Add Alumni" and fill in the required fields.' },
  { title: 'Editing an Alumni Record', desc: 'Click the edit button on any record to update information.' },
  { title: 'Viewing an Alumni Profile', desc: 'Click "Alumni Profiling" to see complete history and profile details.' },
  { title: 'Syncing Data', desc: 'Use Pull, Push, or Full Sync to keep your data up to date with the spreadsheet.' },
  { title: 'Understanding Sync Status', desc: 'Synced = up to date, Pending = needs upload, Conflict = needs resolution.' },
  { title: 'Resolving Conflicts', desc: 'Compare side-by-side versions and choose which to keep.' },
  { title: 'Selecting Recipients', desc: 'Filter alumni by program and year before composing an email.' },
  { title: 'Composing and Sending', desc: 'Write your message, use template variables, preview, and send.' },
  { title: 'Checking Email History', desc: 'View sent emails, recipient counts, and delivery status.' },
  { title: 'Exporting Data', desc: 'Generate PDF, Word, or Excel reports from filtered data.' },
  { title: 'Printing a Report', desc: 'Preview and print a report directly from the application.' },
  { title: 'Managing Accounts (Dean Only)', desc: 'Add, edit, or deactivate user accounts in Settings.' },
  { title: 'Configuring Email (Dean Only)', desc: 'Set up the SMTP email server connection.' },
  { title: 'Configuring Spreadsheet (Dean Only)', desc: 'Connect to Google Sheets with the spreadsheet ID and service account key.' },
  { title: 'Changing Preferences', desc: 'Toggle dark mode and display preferences in Settings.' },
]

export function UserManualSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Quick Reference Manual</h3>
      <p className="text-sm text-text-secondary">
        For detailed step-by-step instructions, visit the Help page.
      </p>
      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <ManualStep key={i} number={i + 1} title={step.title} description={step.desc} />
        ))}
      </div>
      <div className="border-t border-card-border pt-6">
        <FaqAccordion />
      </div>
    </div>
  )
}
