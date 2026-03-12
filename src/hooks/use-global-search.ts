import { useMemo } from 'react'
import { useDebounce } from './use-debounce'
import { SEARCH_INDEX, type SearchEntry } from '../data/search-index'

const MAX_RESULTS = 12

/**
 * Global search hook — fuzzy-matches query against every item in the search index.
 * Returns grouped results (pages, actions, settings, help, faq, troubleshoot).
 */
export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query, 200)

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return []

    const terms = q.split(/\s+/).filter(Boolean)

    const scored: { entry: SearchEntry; score: number }[] = []

    for (const entry of SEARCH_INDEX) {
      const haystack = `${entry.label} ${entry.description} ${entry.keywords}`.toLowerCase()
      let matchCount = 0

      for (const term of terms) {
        if (haystack.includes(term)) {
          matchCount++
          // Bonus for label match
          if (entry.label.toLowerCase().includes(term)) matchCount++
        }
      }

      if (matchCount > 0) {
        scored.push({ entry, score: matchCount })
      }
    }

    // Sort by score descending, then alphabetically
    scored.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))

    return scored.slice(0, MAX_RESULTS).map((s) => s.entry)
  }, [debouncedQuery])

  const grouped = useMemo(() => {
    const map = new Map<SearchEntry['category'], SearchEntry[]>()
    for (const entry of results) {
      const list = map.get(entry.category) ?? []
      list.push(entry)
      map.set(entry.category, list)
    }
    return map
  }, [results])

  return { results, grouped, hasResults: results.length > 0, query: debouncedQuery }
}
