interface TroubleshootingEntry {
  problem: string
  cause: string
  solution: string
}

interface Category {
  title: string
  entries: TroubleshootingEntry[]
}

const CATEGORIES: Category[] = [
  {
    title: 'Application Startup Issues',
    entries: [
      { problem: 'App doesn\'t open', cause: 'Installation is corrupted', solution: 'Reinstall the application. Your data is stored separately and won\'t be lost.' },
      { problem: 'Blank white screen on startup', cause: 'Display error during startup', solution: 'Close and reopen the app. If it persists, delete the app cache folder and restart.' },
      { problem: '"Database error" on startup', cause: 'Database file is damaged', solution: 'The app will try to recover automatically. If it fails, restore from the backup file or contact IT.' },
    ],
  },
  {
    title: 'Login Problems',
    entries: [
      { problem: '"Invalid credentials" error', cause: 'Wrong username or password', solution: 'Double-check your credentials. Passwords are case-sensitive.' },
      { problem: 'Account locked for 5 minutes', cause: '3 failed login attempts', solution: 'Wait 5 minutes, then try again carefully.' },
      { problem: '"Account is deactivated"', cause: 'Dean has disabled your account', solution: 'Contact the Dean to reactivate your account.' },
      { problem: 'Can\'t log in offline', cause: 'No cached credentials', solution: 'Log in at least once while online first.' },
    ],
  },
  {
    title: 'Data Sync Problems',
    entries: [
      { problem: 'Sync fails with "Network error"', cause: 'No internet connection', solution: 'Check your internet connection. The app shows an online/offline indicator.' },
      { problem: 'Sync fails with "Authentication error"', cause: 'Credentials expired or invalid', solution: 'Go to Settings → Spreadsheet Connection and re-enter the service account key.' },
      { problem: 'Sync takes a very long time', cause: 'Large dataset to process', solution: 'Normal for first sync. Let it complete without closing the app.' },
      { problem: 'Many conflicts appear', cause: 'Multiple users edited the same records', solution: 'Resolve each conflict one by one. See the User Manual, Step 13.' },
    ],
  },
  {
    title: 'Data & Records Issues',
    entries: [
      { problem: 'Can\'t find a record', cause: 'Filter applied or record not added', solution: 'Clear all filters and search by name.' },
      { problem: 'Record stuck on "Pending"', cause: 'Sync not run', solution: 'Run a Full Sync to upload pending changes.' },
      { problem: 'Form won\'t save', cause: 'Missing required fields', solution: 'Look for red error messages under form fields and fill in required fields.' },
      { problem: 'Outdated data', cause: 'Not synced recently', solution: 'Run a Pull sync to get the latest data.' },
    ],
  },
  {
    title: 'Email Problems',
    entries: [
      { problem: '"Connection failed" on test', cause: 'Wrong email server settings', solution: 'Verify host, port, username, and password in Settings → Email Connection.' },
      { problem: 'Emails not received', cause: 'Spam folder or wrong address', solution: 'Ask recipients to check spam. Verify email addresses in alumni records.' },
      { problem: '"0 recipients" shown', cause: 'No alumni match filters or have emails', solution: 'Adjust filters or check that alumni records have email addresses.' },
      { problem: 'Send progress stuck', cause: 'Network interruption', solution: 'Wait for retry or cancel and try again. Already-sent emails won\'t be duplicated.' },
    ],
  },
  {
    title: 'Export & Report Problems',
    entries: [
      { problem: 'Export file won\'t open', cause: 'Missing software', solution: 'PDF needs a PDF reader, DOCX needs Word, XLSX needs Excel or LibreOffice.' },
      { problem: 'Export contains no data', cause: 'Too restrictive filters', solution: 'Adjust filters to include more records.' },
      { problem: 'Export file is very large', cause: 'Many records included', solution: 'Normal for large datasets. Consider filtering by program or year.' },
    ],
  },
  {
    title: 'Display & Interface Issues',
    entries: [
      { problem: 'Text too small or large', cause: 'System display scaling', solution: 'Adjust Windows display scaling in Settings → Display → Scale.' },
      { problem: 'Dark mode not saving', cause: 'Preference save failed', solution: 'Toggle dark mode off and on again in Settings → Preferences.' },
      { problem: 'Sidebar missing', cause: 'Sidebar collapsed', solution: 'Click the menu icon at the top-left to expand the sidebar.' },
      { problem: 'Charts not loading', cause: 'Data still loading', solution: 'Wait for the loading indicator. Try navigating away and back.' },
    ],
  },
  {
    title: 'Safety & Data Protection',
    entries: [
      { problem: 'Worried about losing data', cause: '—', solution: 'Data is saved automatically with backup files. Regular syncing keeps a copy in the spreadsheet.' },
      { problem: 'Computer crashed during use', cause: 'Power loss or system error', solution: 'The app uses crash-safe saving and will recover automatically on next launch.' },
      { problem: 'Unwanted record changes', cause: 'Another user edited the record', solution: 'Use Alumni Profiling → History to see all past versions and what changed.' },
      { problem: 'Need to share data externally', cause: '—', solution: 'Use Reports & Exports to generate PDF, Word, or Excel files for sharing.' },
    ],
  },
]

interface TroubleshootingTabProps {
  searchQuery: string
}

export function TroubleshootingTab({ searchQuery }: TroubleshootingTabProps) {
  const q = searchQuery.toLowerCase()

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => {
        const filtered = cat.entries.filter(
          (e) =>
            !q ||
            e.problem.toLowerCase().includes(q) ||
            e.cause.toLowerCase().includes(q) ||
            e.solution.toLowerCase().includes(q)
        )
        if (filtered.length === 0) return null

        return (
          <div key={cat.title}>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">{cat.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-card-border text-text-secondary">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Problem</th>
                    <th className="pb-2 pr-4 font-medium">Possible Cause</th>
                    <th className="pb-2 font-medium">Solution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {filtered.map((e, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 font-medium text-text-primary">{e.problem}</td>
                      <td className="py-2.5 pr-4 text-text-secondary">{e.cause}</td>
                      <td className="py-2.5 text-text-secondary">{e.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
