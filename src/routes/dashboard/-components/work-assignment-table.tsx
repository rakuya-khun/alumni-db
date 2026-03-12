import { useMemo } from 'react'
import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

/**
 * Official Philippine regions (18 regions).
 * Any work_region value matching one of these (case-insensitive, partial match)
 * is classified as "Locally". Everything else is "Internationally / Overseas".
 */
const PHILIPPINE_REGIONS: string[] = [
  'ncr',
  'national capital region',
  'car',
  'cordillera',
  'region i',
  'ilocos',
  'region ii',
  'cagayan valley',
  'region iii',
  'central luzon',
  'region iv-a',
  'calabarzon',
  'region iv-b',
  'mimaropa',
  'region v',
  'bicol',
  'region vi',
  'western visayas',
  'region vii',
  'central visayas',
  'region viii',
  'eastern visayas',
  'region ix',
  'zamboanga',
  'region x',
  'northern mindanao',
  'region xi',
  'davao',
  'region xii',
  'soccsksargen',
  'region xiii',
  'caraga',
  'barmm',
  'bangsamoro',
]

function isPhilippineRegion(value: string): boolean {
  const lower = value.toLowerCase().trim()
  return PHILIPPINE_REGIONS.some((region) => lower.includes(region))
}

interface WorkAssignmentTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function WorkAssignmentTable({ data, loading }: WorkAssignmentTableProps) {
  const { locally, internationally } = useMemo(() => {
    let locally = 0
    let internationally = 0
    
    if (data?.rows) {
      for (const row of data.rows) {
        if (isPhilippineRegion(row.value)) {
          locally += row.count
        } else {
          internationally += row.count
        }
      }
    }
    
    return { locally, internationally }
  }, [data])

  return (
    <div className="space-y-4">
      <SurveyResponseTable
        title="Place of Work Assignment (Regions)"
        data={data}
        loading={loading}
        headerSlot={
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-text-secondary">Locally</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{locally}</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-text-secondary">Internationally</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{internationally}</p>
            </div>
          </div>
        }
      />
    </div>
  )
}