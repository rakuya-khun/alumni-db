import {
  ShieldCheck, BarChart3, ClipboardList, User, FileText,
  RefreshCw, Mail, Settings, Info,
} from 'lucide-react'
import { FeatureSummaryCard } from './feature-summary-card'

const FEATURES = [
  { icon: ShieldCheck, title: 'Login & Accounts', desc: 'Secure authentication with role-based access for Dean and Program Chairpersons' },
  { icon: BarChart3, title: 'Analytic Dashboard', desc: 'Live statistics: total responses, program counts, percentages, survey tables with weighted means' },
  { icon: ClipboardList, title: 'Alumni Directory', desc: 'Full CRUD for alumni records with search, filtering, and Google Form integration' },
  { icon: User, title: 'Alumni Profiling', desc: 'Individual alumni profiles with history, latest updates, and timeline views' },
  { icon: FileText, title: 'Reports & Export', desc: 'Export as PDF, DOCX, XLSX with role-filtered data and print preview' },
  { icon: RefreshCw, title: 'Data Sync', desc: 'Bidirectional sync with Google Sheets: pull, push, full sync, auto-sync' },
  { icon: Mail, title: 'Sending Emails', desc: 'Bulk email via SMTP with template variables, Google Form link, delivery tracking' },
  { icon: Settings, title: 'Settings', desc: 'SMTP, Spreadsheet, Sync/DB config, dark mode, user preferences' },
  { icon: Info, title: 'About & Help', desc: 'System info, feature explanations, user manual, FAQ, troubleshooting' },
]

export function CoreFeaturesSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Core Features</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureSummaryCard key={f.title} icon={f.icon} title={f.title} description={f.desc} />
        ))}
      </div>
    </div>
  )
}
