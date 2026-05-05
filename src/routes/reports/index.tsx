import { FileText, FileSpreadsheet, FileType, Printer, Award } from 'lucide-react'
import { ExportCard } from './-components/export-card'
import { ExportFilterForm } from './-components/export-filter-form'
import { ExportProgress } from './-components/export-progress'
import { PrintPreview } from './-components/print-preview'
import { useExportFilters } from './-hooks/use-export-filters'
import { useExport } from './-hooks/use-export'
import { useState } from 'react'

const FORMATS = [
  { id: 'pdf' as const, title: 'PDF Report', desc: 'Generates a formatted PDF with tables and summary statistics', icon: FileText },
  { id: 'docx' as const, title: 'Word Document', desc: 'Structured document with headings, tables, and cover page', icon: FileType },
  { id: 'excel' as const, title: 'Excel Spreadsheet', desc: 'Multi-sheet workbook with raw data, stats, and filter info', icon: FileSpreadsheet },
]

export default function ReportsPage() {
  const { filters, updateFilters, resetFilters, accessiblePrograms } = useExportFilters()
  const { generate, exporting, lastPath } = useExport()
  const [showPrint, setShowPrint] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports & Exports</h1>
        <p className="text-sm text-text-secondary">Generate alumni reports filtered by your selected criteria</p>
      </div>

      <ExportFilterForm
        filters={filters}
        onUpdate={updateFilters}
        onReset={resetFilters}
        accessiblePrograms={accessiblePrograms}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FORMATS.map((f) => (
          <ExportCard
            key={f.id}
            title={f.title}
            description={f.desc}
            icon={f.icon}
            disabled={exporting}
            onClick={() => generate(f.id, { ...filters })}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">PEO Attainment Reports</h2>
        <p className="text-sm text-text-secondary">
          Generate Program Educational Objectives attainment reports — separate from alumni reports.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ExportCard
            title="PEO Attainment Report (PDF)"
            description="PEO 1/2/3 attainment summary, indicator breakdown, and cohort outcomes"
            icon={Award}
            disabled={exporting}
            onClick={() => generate('peo-pdf', { ...filters })}
          />
          <ExportCard
            title="PEO Attainment Report (Word)"
            description="Editable PEO attainment report with summary, indicators, and cohort outcomes"
            icon={Award}
            disabled={exporting}
            onClick={() => generate('peo-docx', { ...filters })}
          />
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <button
          onClick={() => setShowPrint(!showPrint)}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Printer className="h-4 w-4" />
          {showPrint ? 'Hide Print Options' : 'Print Current View'}
        </button>
        {showPrint && <div className="mt-4"><PrintPreview /></div>}
      </div>

      <ExportProgress exporting={exporting} lastPath={lastPath} />
    </div>
  )
}
