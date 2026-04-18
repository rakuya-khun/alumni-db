import * as fs from 'fs'
import { alumniRepository, type AlumniFilters } from '../database/alumni.repository'
import { analyticsRepository, type AnalyticsFilters } from '../database/analytics.repository'
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
    if (f.hasLicense != null) parts.push(`Board Passer: ${f.hasLicense === 1 ? 'Yes' : 'No'}`)
    if (f.isEmployed != null) parts.push(`Employed: ${f.isEmployed === 1 ? 'Yes' : 'No'}`)
    if (f.jobRelevance && f.jobRelevance.length > 0) parts.push(`Job Relevance: ${f.jobRelevance.join(', ')}`)
    if (f.jobLevel && f.jobLevel.length > 0) parts.push(`Job Level: ${f.jobLevel.join(', ')}`)
    if (f.employmentStatus && f.employmentStatus.length > 0) parts.push(`Employment Status: ${f.employmentStatus.join(', ')}`)
    if (f.workRegion && f.workRegion.length > 0) parts.push(`Work Region: ${f.workRegion.join(', ')}`)
    if (f.industrySector && f.industrySector.length > 0) parts.push(`Industry Sector: ${f.industrySector.join(', ')}`)
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

function parseDashboardFilters(filters?: Record<string, unknown>): AnalyticsFilters {
  return {
    programs: filters?.programs as string[] | undefined,
    yearFrom: filters?.yearFrom as number | undefined,
    yearTo: filters?.yearTo as number | undefined,
  }
}

function buildDashboardFilterSummary(filters: AnalyticsFilters): string {
  const parts: string[] = []
  if (filters.programs && filters.programs.length > 0) {
    parts.push('Programs: ' + filters.programs.map((p) => PROGRAM_LABELS[p] ?? p).join(', '))
  }
  if (filters.yearFrom) parts.push(`From: ${filters.yearFrom}`)
  if (filters.yearTo) parts.push(`To: ${filters.yearTo}`)
  return parts.length > 0 ? parts.join('  |  ') : 'All Programs'
}

function gatherKpiData(filters: AnalyticsFilters) {
  const totalCount = analyticsRepository.getTotalCount(filters)
  const boardPasserRate = analyticsRepository.getBoardPasserRate(filters)
  const employmentRate = analyticsRepository.getEmploymentRate(filters)
  const fieldRelatedRate = analyticsRepository.getFieldRelatedRate(filters)
  const supervisoryRate = analyticsRepository.getSupervisoryRate(filters)
  const countByProgram = analyticsRepository.getCountByProgram(filters)
  const countByYear = analyticsRepository.getCountByYear(filters)
  return { totalCount, boardPasserRate, employmentRate, fieldRelatedRate, supervisoryRate, countByProgram, countByYear }
}

function gatherAllSurveyData(filters: AnalyticsFilters) {
  const getFreq = (col: string) => analyticsRepository.getFrequencyDistribution(col, filters)
  const getJson = (col: string) => analyticsRepository.getJsonArrayFrequency(col, filters)
  const compFreq = analyticsRepository.getCompetencyFrequency(filters)
  const compMeans = analyticsRepository.getCompetencyMeans(filters)

  return {
    // PROFESSIONAL COMPETENCE
    curriculumRelevance: getFreq('curriculum_relevance'),
    professionalTitle: getFreq('professional_title'),
    advancedStudyReason: getJson('advanced_study_reason'),
    specialization: getFreq('specialization'),

    // PERSONAL AND PROFESSIONAL UNDERTAKINGS
    competencyFrequency: compFreq,
    competencyMeans: compMeans,
    competenciesLearned: getJson('useful_competencies'),

    // CAREER PATH
    employmentStatus: getFreq('employment_status'),
    workRegion: getFreq('work_region'),
    industrySector: getFreq('industry_sector'),
    timeToFirstJob: getFreq('time_to_first_job'),
    firstJobMethod: getJson('first_job_method'),
    jobChallenges: getJson('job_challenges'),
  }
}

/** Replace characters that jsPDF's default font can't render */
function sanitizeForPdf(text: string): string {
  return text.replace(/₱/g, 'PHP ')
}

const PDF_COLUMNS_PAGE1: { key: string; label: string }[] = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'program', label: 'Program' },
  { key: 'year_graduated', label: 'Year Graduated' },
  { key: 'sex', label: 'Sex' },
  { key: 'contact_number', label: 'Contact' },
  { key: 'gmail_address', label: 'Email' },
  { key: 'has_license', label: 'Has License' },
]

const PDF_COLUMNS_PAGE2: { key: string; label: string }[] = [
  { key: 'is_employed', label: 'Employed' },
  { key: 'employment_status', label: 'Employment Status' },
  { key: 'current_position', label: 'Position' },
  { key: 'company_name', label: 'Company' },
  { key: 'job_level', label: 'Job Level' },
  { key: 'job_relevance', label: 'Job Relevance' },
  { key: 'salary_range', label: 'Salary Range' },
]

export const exportService = {
  async toPdf(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const data = getExportData(filters)
    const filterSummary = buildFilterSummary(filters)
    const paperSize = getPaperSize(filters)
    const [w, h] = PDF_FORMAT[paperSize]
    const doc = new jsPDF({ orientation: 'landscape', format: [w, h] })

    const formatCellValue = (row: Record<string, unknown>, key: string): string => {
      const val = row[key as keyof typeof row]
      if (val === null || val === undefined) return ''
      if (typeof val === 'number') {
        if (key === 'has_license' || key === 'is_employed') return val === 1 ? 'Yes' : 'No'
        return String(val)
      }
      return sanitizeForPdf(String(val))
    }

    const columnGroups = [PDF_COLUMNS_PAGE1, PDF_COLUMNS_PAGE2]

    for (let g = 0; g < columnGroups.length; g++) {
      if (g > 0) doc.addPage()

      const cols = columnGroups[g]

      // Title
      doc.setFontSize(16)
      doc.text('Alumni Report — SLSU College of Engineering', 14, 20)
      doc.setFontSize(10)
      doc.text(filterSummary, 14, 28)
      doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Records: ${data.length}  |  Page set ${g + 1} of ${columnGroups.length}`, 14, 34)

      const headers = ['#', ...cols.map((c) => c.label)]
      const rows = data.map((row, idx) => [
        String(idx + 1),
        ...cols.map((c) => formatCellValue(row, c.key)),
      ]);

      (doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
        head: [headers],
        body: rows,
        startY: 40,
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [155, 35, 53] },
        columnStyles: { 0: { cellWidth: 12, halign: 'center' } },
      })
    }

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
    const paperSize = getPaperSize(filters)
    const page = DOCX_PAGE[paperSize]

    const columnGroups = [PDF_COLUMNS_PAGE1, PDF_COLUMNS_PAGE2]

    const formatCellValue = (row: Record<string, unknown>, key: string): string => {
      const val = row[key as keyof typeof row]
      if (val === null || val === undefined) return ''
      if (typeof val === 'number') {
        if (key === 'has_license' || key === 'is_employed') return val === 1 ? 'Yes' : 'No'
        return String(val)
      }
      return String(val)
    }

    const sections = columnGroups.map((cols, g) => {
      const numWidth = 5
      const dataWidth = (100 - numWidth) / cols.length

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', font: 'Calibri' })] })],
            width: { size: numWidth, type: WidthType.PERCENTAGE },
            shading: { type: docx.ShadingType.SOLID, color: '9B2335' },
          }),
          ...cols.map((c) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true, color: 'FFFFFF', font: 'Calibri' })] })],
              width: { size: dataWidth, type: WidthType.PERCENTAGE },
              shading: { type: docx.ShadingType.SOLID, color: '9B2335' },
            })
          ),
        ],
      })

      const dataRows = data.map((row, idx) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun(String(idx + 1))] })],
            }),
            ...cols.map((c) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(formatCellValue(row, c.key))] })],
              })
            ),
          ],
        })
      )

      return {
        properties: {
          page: {
            size: { width: page.width, height: page.height },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          new Paragraph({
            text: 'Alumni Report — SLSU College of Engineering',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: filterSummary,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString()}  |  Records: ${data.length}  |  Page set ${g + 1} of ${columnGroups.length}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Table({
            rows: [headerRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }
    })

    const doc = new Document({ sections })

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
    const stats = analyticsRepository.getBoardPasserRate({ programs })
    const employment = analyticsRepository.getEmploymentRate({ programs })

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
  },

  async dashboardToPdf(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const af = parseDashboardFilters(filters)
    const kpi = gatherKpiData(af)
    const filterSummary = buildDashboardFilterSummary(af)

    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(14)
    doc.text('Southern Luzon State University', pageWidth / 2, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.text('College of Engineering', pageWidth / 2, 25, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Dashboard Summary Report', pageWidth / 2, 35, { align: 'center' })
    doc.setFontSize(10)
    doc.text(filterSummary, pageWidth / 2, 43, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 49, { align: 'center' })

    // KPI Summary Table
    const autoTable = (doc as unknown as { autoTable: (opts: unknown) => void }).autoTable;
    autoTable.call(doc, {
      head: [['Key Performance Indicator', 'Count', 'Total', 'Rate']],
      body: [
        ['Board Passers (CE & EE only)', String(kpi.boardPasserRate.passers), String(kpi.boardPasserRate.total), `${kpi.boardPasserRate.rate}%`],
        ['Employed Alumni', String(kpi.employmentRate.employed), String(kpi.employmentRate.total), `${kpi.employmentRate.rate}%`],
        ['Field-Related Employment', String(kpi.fieldRelatedRate.fieldRelated), String(kpi.fieldRelatedRate.employed), `${kpi.fieldRelatedRate.rate}%`],
        ['Supervisory/Managerial', String(kpi.supervisoryRate.supervisory), String(kpi.supervisoryRate.employed), `${kpi.supervisoryRate.rate}%`],
      ],
      startY: 56,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [155, 35, 53] },
    })

    // Program Distribution Table
    const afterKpi = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 100
    autoTable.call(doc, {
      head: [['Program', 'Respondents']],
      body: [
        ...kpi.countByProgram.map((p) => [PROGRAM_LABELS[p.program] ?? p.program, String(p.count)]),
        ['Total', String(kpi.totalCount)],
      ],
      startY: afterKpi + 10,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [155, 35, 53] },
    })

    // Year Distribution Table
    if (kpi.countByYear.length > 0) {
      const afterProgram = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 160
      autoTable.call(doc, {
        head: [['Year Graduated', 'Count']],
        body: kpi.countByYear.map((y) => [String(y.year), String(y.count)]),
        startY: afterProgram + 10,
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [155, 35, 53] },
      })
    }

    const survey = gatherAllSurveyData(af)

    // Helper for frequency tables
    function addFrequencyTable(title: string, rows: { value: string; count: number }[], startY: number): number {
      if (rows.length === 0) return startY
      const total = rows.reduce((s, r) => s + r.count, 0)
      
      // Check if we need a new page
      if (startY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        startY = 20
      }
      
      autoTable.call(doc, {
        head: [[title, 'Count', 'Percentage']],
        body: rows.map(r => [sanitizeForPdf(r.value), String(r.count), total > 0 ? `${((r.count / total) * 100).toFixed(1)}%` : '0%']),
        startY,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [155, 35, 53] },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 30, halign: 'right' }, 2: { cellWidth: 30, halign: 'right' } },
      })
      return ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? startY + 30) + 8
    }

    function addSectionHeading(text: string, y: number): number {
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(text, 14, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      return y + 8
    }

    let curY = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 160) + 15

    // === PROFESSIONAL COMPETENCE ===
    curY = addSectionHeading('PROFESSIONAL COMPETENCE', curY)
    curY = addFrequencyTable('Curriculum Relevance to Current Employment', survey.curriculumRelevance, curY)
    curY = addFrequencyTable('Professional Title', survey.professionalTitle, curY)
    curY = addFrequencyTable('Reasons for Pursuing Advanced Study', survey.advancedStudyReason, curY)
    curY = addFrequencyTable('Specialization', survey.specialization, curY)

    // === PERSONAL AND PROFESSIONAL UNDERTAKINGS ===
    curY = addSectionHeading('PERSONAL AND PROFESSIONAL UNDERTAKINGS', curY)

    // Competencies Assessment — special table
    if (survey.competencyFrequency.length > 0) {
      const COMP_LABELS: Record<string, string> = {
        comp_engineering_knowledge: 'Engineering Knowledge',
        comp_problem_solving: 'Problem-Solving Ability',
        comp_engineering_design: 'Engineering Design',
        comp_communication: 'Communication Skills',
        comp_teamwork: 'Teamwork & Collaboration',
        comp_ethics: 'Ethics & Responsibility',
        comp_leadership: 'Leadership & Initiative',
        comp_lifelong_learning: 'Lifelong Learning',
        comp_modern_tools: 'Modern Tools & Technology',
      }
      const meanMap = new Map(survey.competencyMeans.map(m => [m.competency, m.mean]))
      const compCols = Object.keys(COMP_LABELS)
      
      if (curY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
        curY = 20
      }
      
      autoTable.call(doc, {
        head: [['Competency', '1 (V.Poor)', '2 (Poor)', '3 (Fair)', '4 (Good)', '5 (Exc.)', 'WM']],
        body: compCols.map(col => {
          const freqs = [1, 2, 3, 4, 5].map(s => {
            const row = survey.competencyFrequency.find(r => r.value === `${col}:${s}`)
            return String(row?.count ?? 0)
          })
          const mean = meanMap.get(col)
          return [COMP_LABELS[col], ...freqs, mean != null ? mean.toFixed(2) : '—']
        }),
        startY: curY,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [155, 35, 53] },
      })
      curY = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? curY + 30) + 8
    }

    curY = addFrequencyTable('Competencies Learned', survey.competenciesLearned, curY)

    // === CAREER PATH ===
    curY = addSectionHeading('CAREER PATH', curY)
    curY = addFrequencyTable('Employment Status Distribution', survey.employmentStatus, curY)
    curY = addFrequencyTable('Place of Work Assignment', survey.workRegion, curY)
    curY = addFrequencyTable('Industry Sector Distribution', survey.industrySector, curY)
    curY = addFrequencyTable('Time to First Job', survey.timeToFirstJob, curY)
    curY = addFrequencyTable('Method of Finding First Job', survey.firstJobMethod, curY)
    curY = addFrequencyTable('Challenges Faced in Finding Employment', survey.jobChallenges, curY)

    const buffer = doc.output('arraybuffer')
    fs.writeFileSync(filePath, Buffer.from(buffer))
    logger.info('export', `Dashboard PDF exported: ${filePath}`)
  },

  async dashboardToDocx(filePath: string, filters?: Record<string, unknown>): Promise<void> {
    const docx = await import('docx')
    const {
      Document, Paragraph, Table, TableRow, TableCell,
      TextRun, HeadingLevel, WidthType, Packer, AlignmentType,
      BorderStyle
    } = docx

    const af = parseDashboardFilters(filters)
    const kpi = gatherKpiData(af)
    const filterSummary = buildDashboardFilterSummary(af)

    const accentColor = '9B2335'

    function headerCell(text: string) {
      return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: 'Calibri' })] })],
        shading: { type: docx.ShadingType.SOLID, color: accentColor },
        width: { size: 25, type: WidthType.PERCENTAGE },
      })
    }

    function dataCell(text: string, width = 25) {
      return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, font: 'Calibri' })] })],
        width: { size: width, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
      })
    }

    // KPI Table
    const kpiRows = [
      new TableRow({ tableHeader: true, children: [headerCell('Key Performance Indicator'), headerCell('Count'), headerCell('Total'), headerCell('Rate')] }),
      new TableRow({ children: [dataCell('Board Passers (CE & EE only)'), dataCell(String(kpi.boardPasserRate.passers)), dataCell(String(kpi.boardPasserRate.total)), dataCell(`${kpi.boardPasserRate.rate}%`)] }),
      new TableRow({ children: [dataCell('Employed Alumni'), dataCell(String(kpi.employmentRate.employed)), dataCell(String(kpi.employmentRate.total)), dataCell(`${kpi.employmentRate.rate}%`)] }),
      new TableRow({ children: [dataCell('Field-Related Employment'), dataCell(String(kpi.fieldRelatedRate.fieldRelated)), dataCell(String(kpi.fieldRelatedRate.employed)), dataCell(`${kpi.fieldRelatedRate.rate}%`)] }),
      new TableRow({ children: [dataCell('Supervisory/Managerial'), dataCell(String(kpi.supervisoryRate.supervisory)), dataCell(String(kpi.supervisoryRate.employed)), dataCell(`${kpi.supervisoryRate.rate}%`)] }),
    ]

    // Program Table
    const programRows = [
      new TableRow({ tableHeader: true, children: [headerCell('Program'), headerCell('Respondents')] }),
      ...kpi.countByProgram.map((p) =>
        new TableRow({ children: [dataCell(PROGRAM_LABELS[p.program] ?? p.program, 50), dataCell(String(p.count), 50)] })
      ),
      new TableRow({ children: [dataCell('Total', 50), dataCell(String(kpi.totalCount), 50)] }),
    ]

    // Year Table
    const yearRows = kpi.countByYear.length > 0 ? [
      new TableRow({ tableHeader: true, children: [headerCell('Year Graduated'), headerCell('Count')] }),
      ...kpi.countByYear.map((y) =>
        new TableRow({ children: [dataCell(String(y.year), 50), dataCell(String(y.count), 50)] })
      ),
    ] : []

    const children: (typeof Paragraph.prototype | typeof Table.prototype)[] = [
      new Paragraph({ text: 'Southern Luzon State University', heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: 'College of Engineering', alignment: AlignmentType.CENTER }),
      new Paragraph({ text: 'Dashboard Summary Report', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { before: 200 } }),
      new Paragraph({ text: filterSummary, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Generated: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

      new Paragraph({ text: 'OBE Key Performance Indicators', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }),
      new Table({ rows: kpiRows, width: { size: 100, type: WidthType.PERCENTAGE } }),

      new Paragraph({ text: 'Program Distribution', heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
      new Table({ rows: programRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
    ]

    if (yearRows.length > 0) {
      children.push(
        new Paragraph({ text: 'Year Distribution', heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
        new Table({ rows: yearRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      )
    }

    const survey = gatherAllSurveyData(af)

    function frequencyTable(title: string, rows: { value: string; count: number }[]): (typeof Paragraph.prototype | typeof Table.prototype)[] {
      if (rows.length === 0) return []
      const total = rows.reduce((s, r) => s + r.count, 0)
      return [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }),
        new Table({
          rows: [
            new TableRow({ tableHeader: true, children: [headerCell('Response'), headerCell('Count'), headerCell('Percentage')] }),
            ...rows.map(r => new TableRow({
              children: [
                dataCell(r.value, 50),
                dataCell(String(r.count), 25),
                dataCell(total > 0 ? `${((r.count / total) * 100).toFixed(1)}%` : '0%', 25),
              ]
            })),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ]
    }

    // PROFESSIONAL COMPETENCE
    children.push(
      new Paragraph({ text: 'PROFESSIONAL COMPETENCE', heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
    )
    children.push(...frequencyTable('Curriculum Relevance to Current Employment', survey.curriculumRelevance))
    children.push(...frequencyTable('Professional Title', survey.professionalTitle))
    children.push(...frequencyTable('Reasons for Pursuing Advanced Study', survey.advancedStudyReason))
    children.push(...frequencyTable('Specialization', survey.specialization))

    // PERSONAL AND PROFESSIONAL UNDERTAKINGS
    children.push(
      new Paragraph({ text: 'PERSONAL AND PROFESSIONAL UNDERTAKINGS', heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
    )

    // Competencies Assessment table
    if (survey.competencyFrequency.length > 0) {
      const COMP_LABELS: Record<string, string> = {
        comp_engineering_knowledge: 'Engineering Knowledge',
        comp_problem_solving: 'Problem-Solving Ability',
        comp_engineering_design: 'Engineering Design',
        comp_communication: 'Communication Skills',
        comp_teamwork: 'Teamwork & Collaboration',
        comp_ethics: 'Ethics & Responsibility',
        comp_leadership: 'Leadership & Initiative',
        comp_lifelong_learning: 'Lifelong Learning',
        comp_modern_tools: 'Modern Tools & Technology',
      }
      const meanMap = new Map(survey.competencyMeans.map(m => [m.competency, m.mean]))
      const compCols = Object.keys(COMP_LABELS)

      children.push(
        new Paragraph({ text: 'Competencies Assessment', heading: HeadingLevel.HEADING_3, spacing: { before: 300 } }),
        new Table({
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell('Competency'),
                headerCell('1 (V.Poor)'),
                headerCell('2 (Poor)'),
                headerCell('3 (Fair)'),
                headerCell('4 (Good)'),
                headerCell('5 (Exc.)'),
                headerCell('WM'),
              ],
            }),
            ...compCols.map(col => {
              const freqs = [1, 2, 3, 4, 5].map(s => {
                const row = survey.competencyFrequency.find(r => r.value === `${col}:${s}`)
                return String(row?.count ?? 0)
              })
              const mean = meanMap.get(col)
              return new TableRow({
                children: [
                  dataCell(COMP_LABELS[col], 30),
                  ...freqs.map(f => dataCell(f, 10)),
                  dataCell(mean != null ? mean.toFixed(2) : '—', 10),
                ],
              })
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      )
    }

    children.push(...frequencyTable('Competencies Learned', survey.competenciesLearned))

    // CAREER PATH
    children.push(
      new Paragraph({ text: 'CAREER PATH', heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
    )
    children.push(...frequencyTable('Employment Status Distribution', survey.employmentStatus))
    children.push(...frequencyTable('Place of Work Assignment', survey.workRegion))
    children.push(...frequencyTable('Industry Sector Distribution', survey.industrySector))
    children.push(...frequencyTable('Time to First Job', survey.timeToFirstJob))
    children.push(...frequencyTable('Method of Finding First Job', survey.firstJobMethod))
    children.push(...frequencyTable('Challenges Faced in Finding Employment', survey.jobChallenges))

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: children as any[],
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    fs.writeFileSync(filePath, buffer)
    logger.info('export', `Dashboard DOCX exported: ${filePath}`)
  }
}
