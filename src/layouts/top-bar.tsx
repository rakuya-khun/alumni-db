import { Search, Bell, Sun, Moon, Palette, Wifi, WifiOff, CloudCheck, CloudOff } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useAuthStore } from '../stores/auth.store'
import { useUIStore } from '../stores/ui.store'
import { useSyncStore } from '../stores/sync.store'
import { useSettingsStore } from '../stores/settings.store'
import { useNetwork } from '../hooks/use-network'
import { useGlobalSearch } from '../hooks/use-global-search'
import { GlobalSearchResults } from '../components/shared/global-search-results'
import cenLogo from '../assets/CEN._LOGOpng.png'
import sealLogo from '../assets/SEAL_LOGO.png'

const THEME_META = {
  light: { icon: Sun, next: 'Dark', label: 'Light' },
  dark: { icon: Moon, next: 'Maroon', label: 'Dark' },
  maroon: { icon: Palette, next: 'Light', label: 'Maroon' },
} as const

export function TopBar() {
  const { user } = useAuthStore()
  const { theme, cycleTheme, sidebarCollapsed } = useUIStore()
  const { status } = useSyncStore()
  const isConfigured = useSettingsStore((s) => s.isConfigured)
  const { isOnline } = useNetwork()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, grouped, hasResults, query: debouncedQuery } = useGlobalSearch(searchQuery)

  const pendingCount = (status?.pendingCount ?? 0) + (status?.conflictCount ?? 0)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1)
  }, [debouncedQuery])

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setActiveIndex(-1)
    inputRef.current?.blur()
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch()
      return
    }

    if (!hasResults) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        const entry = results[activeIndex]
        const path = entry.query ? `${entry.route}?${entry.query}` : entry.route
        navigate(path)
        closeSearch()
      }
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 z-20 flex h-16 items-center gap-5 border-b border-card-border bg-card px-6 transition-all duration-200',
        sidebarCollapsed ? 'left-16' : 'left-64',
        'right-0'
      )}
    >
      {/* Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-lg min-w-64  lg:min-w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsSearchOpen(true)
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search everything... (Ctrl+K)"
          className="h-10 w-full rounded-lg border border-card-border bg-surface-secondary pl-10 pr-16 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-6 items-center gap-0.5 rounded border border-card-border bg-surface-tertiary px-1.5 text-[11px] font-medium text-text-muted">
          Ctrl K
        </kbd>

        {isSearchOpen && debouncedQuery && (
          <GlobalSearchResults
            grouped={grouped}
            hasResults={hasResults}
            query={debouncedQuery}
            onSelect={closeSearch}
            activeIndex={activeIndex}
            flatResults={results}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-5 w-full">

        <div className=' flex items-center'>
        {/* Status indicators */}
        <div className="flex items-center gap-1.5 rounded-lg border border-card-border bg-surface-secondary px-2.5 py-1.5">
          <div className="flex items-center gap-1.5" title={isOnline ? 'Online' : 'Offline'}>
            {isOnline ? (
              <Wifi size={15} className="text-success" />
            ) : (
              <WifiOff size={15} className="text-error" />
            )}
            <span className={cn('text-xs font-medium', isOnline ? 'text-success' : 'text-error')}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="mx-1 h-3.5 w-px bg-card-border" />
          <div className="flex items-center gap-1.5" title={isConfigured ? 'Google Sheets connected' : 'Google Sheets not configured'}>
            {isConfigured ? (
              <CloudCheck size={15} className="text-success" />
            ) : (
              <CloudOff size={15} className="text-text-muted" />
            )}
            <span className={cn('text-xs font-medium', isConfigured ? 'text-success' : 'text-text-muted')}>
              {isConfigured ? 'Sheets' : 'Not linked'}
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary"
          title={`Theme: ${THEME_META[theme].label} — click for ${THEME_META[theme].next}`}
        >
          {(() => { const Icon = THEME_META[theme].icon; return <Icon size={20} /> })()}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/sync')}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-tertiary"
          title={pendingCount > 0 ? `${pendingCount} pending changes — click to view` : 'No pending changes'}
        >
          <Bell size={20} />
          {pendingCount > 0 && (
            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
        </div>

        <div className='w-full flex items-center justify-end gap-5'>
          {/* User info */}
          <div className="ml-2 flex items-center gap-3 border-l lg:border-collapse border-card-border pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-text-primary">{user?.fullName ?? 'User'}</p>
              <p className="text-xs text-text-secondary">{user?.role ?? ''}</p>
            </div>
          </div>

          
          {/* Logos */}
          <div className="ml-2 flex items-center justify-end gap-2 border-l border-card-border pl-4">
            <img src={cenLogo} alt="CEN Logo" className="h-9 w-9 object-contain" />
            <img src={sealLogo} alt="SLSU Seal" className="h-9 w-9 object-contain" />
          </div>
        </div>
      </div>
    </header>
  )
}
