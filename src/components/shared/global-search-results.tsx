import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserSearch,
  RefreshCw,
  Mail,
  FileBarChart,
  Settings,
  HelpCircle,
  Info,
  Zap,
  BookOpen,
  MessageCircleQuestion,
  Wrench,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { getCategoryLabel, type SearchEntry } from '../../data/search-index'

interface Props {
  grouped: Map<SearchEntry['category'], SearchEntry[]>
  hasResults: boolean
  query: string
  onSelect: () => void
  activeIndex: number
  flatResults: SearchEntry[]
}

const CATEGORY_ICONS: Record<SearchEntry['category'], React.ElementType> = {
  page: LayoutDashboard,
  action: Zap,
  setting: Settings,
  help: BookOpen,
  faq: MessageCircleQuestion,
  troubleshoot: Wrench,
}

const ROUTE_ICONS: Record<string, React.ElementType> = {
  '/': LayoutDashboard,
  '/alumni': Users,
  '/alumni/add': Users,
  '/profiling': UserSearch,
  '/sync': RefreshCw,
  '/email': Mail,
  '/email/compose': Mail,
  '/email/history': Mail,
  '/email/received': Mail,
  '/reports': FileBarChart,
  '/settings': Settings,
  '/help': HelpCircle,
  '/about': Info,
}

function getIcon(entry: SearchEntry): React.ElementType {
  if (entry.category === 'page' || entry.category === 'action') {
    return ROUTE_ICONS[entry.route] ?? LayoutDashboard
  }
  return CATEGORY_ICONS[entry.category]
}

function highlightMatch(text: string, query: string) {
  if (!query) return text
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    terms.some(t => part.toLowerCase() === t)
      ? <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{part}</mark>
      : part
  )
}

// Ordering for category groups in the dropdown
const CATEGORY_ORDER: SearchEntry['category'][] = ['page', 'action', 'setting', 'help', 'faq', 'troubleshoot']

export function GlobalSearchResults({ grouped, hasResults, query, onSelect, activeIndex, flatResults: _flatResults }: Props) {
  const navigate = useNavigate()

  if (!query) return null

  if (!hasResults) {
    return (
      <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-card-border bg-surface-primary p-4 shadow-lg z-50">
        <p className="text-sm text-text-muted text-center">No results found for "{query}"</p>
      </div>
    )
  }

  const handleSelect = (entry: SearchEntry) => {
    const path = entry.query ? `${entry.route}?${entry.query}` : entry.route
    navigate(path)
    onSelect()
  }

  let flatIndex = 0

  return (
    <div className="absolute left-0 right-0 top-full mt-1 max-h-[420px] overflow-y-auto rounded-xl border border-card-border bg-surface-primary shadow-lg z-50">
      {CATEGORY_ORDER.filter(cat => grouped.has(cat)).map((category) => {
        const entries = grouped.get(category)!
        const CategoryIcon = CATEGORY_ICONS[category]

        return (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <CategoryIcon size={14} className="text-text-muted" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {getCategoryLabel(category)}
              </span>
            </div>

            {/* Results */}
            {entries.map((entry) => {
              const Icon = getIcon(entry)
              const currentFlatIndex = flatIndex++
              const isActive = currentFlatIndex === activeIndex

              return (
                <button
                  key={entry.id}
                  onClick={() => handleSelect(entry)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary hover:bg-surface-secondary'
                  )}
                >
                  <Icon size={18} className={cn('shrink-0', isActive ? 'text-primary' : 'text-text-muted')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{highlightMatch(entry.label, query)}</p>
                    <p className="text-xs text-text-secondary truncate">{highlightMatch(entry.description, query)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t border-card-border px-4 py-2">
        <span className="text-[11px] text-text-muted">↑↓ Navigate</span>
        <span className="text-[11px] text-text-muted">↵ Open</span>
        <span className="text-[11px] text-text-muted">Esc Close</span>
      </div>
    </div>
  )
}
