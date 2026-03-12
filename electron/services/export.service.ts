import * as fs from 'fs'
import { alumniRepository, type AlumniFilters } from '../database/alumni.repository'
import { analyticsRepository } from '../database/analytics.repository'
import { logger } from '../utils/logger'

const PROGRAM_LABELS: Record<string, string> = {
  BSCE: 'Civil Engineering',
  BSCpE: 'Computer Engineering',
  BSEE: 'Electrical Engineering',
}

/** Column display names for export headers */
const EXPORT_COLUMNS: { key: string; label: string }[] = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'program', label: 'Program' },
  { key: 'year_graduated', label: 'Year Graduated' },
  { key: 'sex', label: 'Sex' },
  { key: 'contact_number', label: 'Contact' },
  { key: 'gmail_address', label: 'Email' },
  { key: 'has_license', label: 'Has License' },
  { key: 'is_employed', label: 'Employed' },
  { key: 'employment_status', label: 'Employment Status' },
  { key: 'current_position', label: 'Position' },
  { key: 'company_name', label: 'Company' },
  { key: 'job_level', label: 'Job Level' },
  { key: 'job_relevance', label: 'Job Relevance' },
  { key: 'salary_range', label: 'Salary Range' }
]

function getExportData(filters?: Record<string, unknown>) {
  const parsed = (filters ?? {}) as AlumniFilters
  return alumniRepository.getAll(parsed)
}

function buildFilterSummary(filters?: Record<string, unknown>): string {
  const parts: string[] = []
  if (filters) {
    const f = filters as AlumniFilters
    if (f.programs && f.programs.length > 0) {
      parts.push('Programs: ' + f.programs.map((p) => PROGRAM_LABELS[p] ?? p).join(', '))
    }
    if (f.yearFrom) parts.push(`From: ${f.yearFrom}`)
    if (f.yearTo) parts.push(`To: ${f.yearTo}`)
    if (f.search) parts.push(`Search: ${f.search}`)
  }
  return parts.length > 0 ? parts.join('  |  ') : 'All Programs'
}

type PaperSize = 'short' | 'long' | 'a4'

const PDF_FORMAT: Record<PaperSize, [number, number]> = {
  short: [279.4, 215.9],  // Letter landscape: 11" × 8.5"
  long:  [355.6, 215.9],  // Legal landscape: 14" × 8.5"
  a4:    [297, 210],       // A4 landscape
}

const DOCX_PAGE: Record<PaperSize, { width: number; height: number }> = {
  short: { width: 15840, height: 12240 },  // Letter landscape in twips
  long:  { width: 20160, height: 12240 },  // Legal landscape in twips
  a4:    { width: 16838, height: 11906 },  // A4 landscape in twips
}

function getPaperSize(filters?: Record<string, unknown>): PaperSize {
  const raw = filters?.paperSize
  if (raw === 'short' || raw === 'long' || raw === 'a4') return raw
  return 'a4'
}

export const exportService = {
  async toPdf(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const data = getExportData(filters)
    const filterSummary = buildFilterSummary(filters)
    const paperSize = getPaperSize(filters)
    const [w, h] = PDF_FORMAT[paperSize]
    const doc = new jsPDF({ orientation: 'landscape', format: [w, h] })

    // Title
    doc.setFontSize(16)
    doc.text('Alumni Report — SLSU College of Engineering', 14, 20)
    doc.setFontSize(10)
    doc.text(`${filterSummary}`, 14, 28)
    doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Records: ${data.length}`, 14, 34)

    // Table
    const headers = EXPORT_COLUMNS.map((c) => c.label)
    const rows = data.map((row) =>
      EXPORT_COLUMNS.map((c) => {
        const val = row[c.key as keyof typeof row]
        if (val === null || val === undefined) return ''
        if (typeof val === 'number') {
          // Boolean-style columns
          if (c.key === 'has_license' || c.key === 'is_employed') {
            return val === 1 ? 'Yes' : 'No'
          }
          return String(val)
        }
        return String(val)
      })
    );

    (doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [155, 35, 53] }
    })

    const buffer = doc.output('arraybuffer')
    fs.writeFileSync(filePath, Buffer.from(buffer))
    logger.info('export', `PDF exported: ${filePath} (${data.length} records)`)
  },

  async toDocx(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const docx = await import('docx')
    const {
      Document, Paragraph, Table, TableRow, TableCell,
      TextRun, HeadingLevel, WidthType, Packer, AlignmentType
    } = docx

    const data = getExportData(filters)
    const filterSummary = buildFilterSummary(filters)

    // Build table rows
    const headerRow = new TableRow({
      tableHeader: true,
      children: EXPORT_COLUMNS.map(
        (c) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] })],
            width: { size: 100 / EXPORT_COLUMNS.length, type: WidthType.PERCENTAGE }
          })
      )
    })

    const dataRows = data.map(
      (row) =>
        new TableRow({
          children: EXPORT_COLUMNS.map((c) => {
            let val = row[c.key as keyof typeof row]
            if (val === null || val === undefined) val = ''
            if ((c.key === 'has_license' || c.key === 'is_employed') && typeof val === 'number') {
              val = val === 1 ? 'Yes' : 'No'
            }
            return new TableCell({
              children: [new Paragraph({ children: [new TextRun(String(val))] })]
            })
          })
        })
    )

    const paperSize = getPaperSize(filters)
    const page = DOCX_PAGE[paperSize]

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: page.width, height: page.height, orientation: docx.PageOrientation.LANDSCAPE },
              margin: { top: 720, bottom: 720, left: 720, right: 720 },
            },
          },
          children: [
            new Paragraph({
              text: 'Alumni Report — SLSU College of Engineering',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: `${filterSummary}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleDateString()}  |  Records: ${data.length}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Table({
              rows: [headerRow, ...dataRows],
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }
      ]
    })

    const buffer = await Packer.toBuffer(doc)
    fs.writeFileSync(filePath, buffer)
    logger.info('export', `DOCX exported: ${filePath} (${data.length} records)`)
  },

  async toExcel(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const ExcelJS = await import('exceljs')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = ExcelJS as Record<string, any>
    const Workbook = mod.Workbook ?? mod.default?.Workbook
    if (!Workbook) throw new Error('Failed to load ExcelJS Workbook constructor')
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('Alumni Data')

    const data = getExportData(filters)
    const filterSummary = buildFilterSummary(filters)

    // Header row
    sheet.columns = EXPORT_COLUMNS.map((c) => ({
      header: c.label,
      key: c.key,
      width: 18
    }))

    // Style header
    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9B2335' }
    }

    // Data rows
    for (const row of data) {
      const rowData: Record<string, unknown> = {}
      for (const c of EXPORT_COLUMNS) {
        let val = row[c.key as keyof typeof row]
        if ((c.key === 'has_license' || c.key === 'is_employed') && typeof val === 'number') {
          val = val === 1 ? 'Yes' : 'No'
        }
        rowData[c.key] = val ?? ''
      }
      sheet.addRow(rowData)
    }

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary')
    const parsed = (filters ?? {}) as AlumniFilters
    const programs = parsed.programs && parsed.programs.length > 0
      ? parsed.programs
      : [...new Set(data.map((r) => r.program))]
    const stats = analyticsRepository.getBoardPasserRate(programs)
    const employment = analyticsRepository.getEmploymentRate(programs)

    summarySheet.addRow(['Alumni Report Summary'])
    summarySheet.addRow([])
    summarySheet.addRow(['Filter', filterSummary])
    summarySheet.addRow(['Total Records', data.length])
    summarySheet.addRow(['Board Passers', `${stats.passers}/${stats.total} (${stats.rate}%)`])
    summarySheet.addRow(['Employed', `${employment.employed}/${employment.total} (${employment.rate}%)`])
    summarySheet.addRow([])
    summarySheet.addRow(['Generated', new Date().toLocaleDateString()])

    await workbook.xlsx.writeFile(filePath)
    logger.info('export', `Excel exported: ${filePath} (${data.length} records)`)
  }
}
