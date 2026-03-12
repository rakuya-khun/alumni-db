import { Printer, Info } from 'lucide-react'

export function PrintPreview() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <div className="text-sm text-text-secondary">
          <p>Printing will show the current page content on a clean, full-width layout.</p>
          <p className="mt-1">The sidebar and top bar will be automatically hidden in the printout.</p>
        </div>
      </div>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light"
      >
        <Printer className="h-4 w-4" />
        Print Current View
      </button>
    </div>
  )
}
