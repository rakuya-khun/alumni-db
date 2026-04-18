import {
  Users,
  Mail,
  FileBarChart,
  RefreshCw,
  BarChart3,
  Settings,
  GraduationCap,
  UserSearch,
  ShieldCheck,
  HelpCircle,
  ClipboardCheck,
} from 'lucide-react'
import { useAppVersion } from './-hooks/use-app-version'

import ALUMNI_LOGO from '../../assets/Alumni DB.png'
import CEN_LOGO from '../../assets/CEN._LOGOpng.png'
import SEAL_LOGO from '../../assets/SEAL_LOGO.png'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Dashboard',
    description:
      'View key statistics at a glance — total responses, board passer rates, employment rates, and survey results across all programs.',
    color: 'bg-info/10 text-info',
  },
  {
    icon: Users,
    title: 'Alumni Directory',
    description:
      'Browse, search, add, and edit alumni records. Filter by program, year graduated, or employment status to find exactly who you need.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: UserSearch,
    title: 'Alumni Profiling',
    description:
      'View complete alumni profiles including personal details, employment history, and a timeline of all changes made to their record.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: RefreshCw,
    title: 'Data Synchronization',
    description:
      'Keep your data up to date by syncing with Google Sheets. Pull new survey responses, push local changes, or run a full sync with one click.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Mail,
    title: 'Email',
    description:
      'Send emails to alumni directly from the application. Filter recipients by program and year, compose your message, and track delivery status.',
    color: 'bg-error/10 text-error',
  },
  {
    icon: FileBarChart,
    title: 'Reports & Export',
    description:
      'Generate ready-to-print reports in PDF, Word, or Excel format. Apply filters by program and year to get exactly the data you need.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Settings,
    title: 'Settings',
    description:
      'Configure email and spreadsheet connections, manage user accounts, set sync preferences, and toggle between light and dark mode.',
    color: 'bg-info/10 text-info',
  },
  {
    icon: HelpCircle,
    title: 'Help & Support',
    description:
      'Access the user manual, frequently asked questions, and troubleshooting guides — all available within the application.',
    color: 'bg-success/10 text-success',
  },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Data Collection',
    description: 'Alumni fill out a Google Form survey. Responses are saved to a Google Spreadsheet automatically.',
  },
  {
    step: '2',
    title: 'Sync to Application',
    description: 'Use the Data Sync feature to pull new responses from the spreadsheet into the application.',
  },
  {
    step: '3',
    title: 'Review & Manage',
    description: 'Browse alumni records, view profiles, update information, and resolve any data conflicts.',
  },
  {
    step: '4',
    title: 'Analyze & Report',
    description: 'View dashboard statistics, generate reports, and export data for accreditation documentation.',
  },
]

export default function AboutPage() {
  const version = useAppVersion()

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary p-10 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative space-y-3 text-center">
          <div className='flex justify-center gap-3 h-20 mb-4'>
              <img src={ALUMNI_LOGO} alt="Alumni Logo" />
              <img src={CEN_LOGO} alt="CEN Logo" />
              <img src={SEAL_LOGO} alt="SEAL Logo" />
            </div>
          <div className="flex items-center justify-center gap-3">
            
            <h1 className="text-3xl font-bold tracking-tight">Alumni DB Management System</h1>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/20">
              v{version}
            </span>
          </div>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80">
            A desktop application for managing alumni tracer study data across the{' '}
            <span className="font-medium text-white">CE, CpE, and EE</span> programs at the
            Southern Luzon State University, College of Engineering.
          </p>
        </div>
      </div>

      {/* Purpose & Goals */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">What is Alumni DB?</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-primary">
          <p>
            Alumni DB is a system built to support the{' '}
            <strong>PTC-ACBET accreditation</strong> process by organizing and analyzing graduate tracer
            study data. It centralizes alumni information collected through Google Forms and provides
            tools for managing records, generating reports, and communicating with graduates.
          </p>
          <p>
            The application evaluates four key performance indicators required for Outcome-Based
            Education (OBE):
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-surface-secondary p-4">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Board Exam Passers</p>
                <p className="text-xs text-text-secondary">Percentage of graduates who passed their licensure exam</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-surface-secondary p-4">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Employment Rate</p>
                <p className="text-xs text-text-secondary">Percentage of graduates who are currently employed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-surface-secondary p-4">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Field-Related Employment</p>
                <p className="text-xs text-text-secondary">Percentage of employed graduates working in their field of study</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-card-border bg-surface-secondary p-4">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Supervisory / Managerial Roles</p>
                <p className="text-xs text-text-secondary">Percentage of employed graduates in leadership positions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who is this for */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">Who is this for?</h2>
        <p className="mt-2 text-sm text-text-secondary">
          This application is designed for the following users at the SLSU College of Engineering:
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { role: 'College Dean', access: 'All programs, full administration' },
            { role: 'CE Chairperson', access: 'Civil Engineering data only' },
            { role: 'CpE Chairperson', access: 'Computer Engineering data only' },
            { role: 'EE Chairperson', access: 'Electrical Engineering data only' },
          ].map((user) => (
            <div
              key={user.role}
              className="flex flex-col items-center rounded-lg border border-card-border bg-surface-secondary p-4 text-center"
            >
              <ShieldCheck className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-semibold text-text-primary">{user.role}</span>
              <span className="mt-1 text-xs text-text-secondary">{user.access}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">How It Works</h2>
        <p className="mt-2 text-sm text-text-secondary">
          From data collection to accreditation-ready reports in four simple steps.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="absolute right-0 top-6 hidden h-px w-full translate-x-1/2 bg-card-border lg:block" />
              )}
              <div className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">What You Can Do</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Everything you need to manage alumni data, generate reports, and prepare for accreditation.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-card-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2.5 ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-semibold text-text-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Credits */}
      <div className="space-y-2 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-text-primary">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-semibold">Alumni DB Management System</span>
        </div>
        <p className="text-xs text-text-secondary">
          Southern Luzon State University, College of Engineering &middot; v{version}
        </p>
        <p className="text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} Alumni DB. All rights reserved.
        </p>
      </div>
    </div>
  )
}
