import { createSheetsClient } from './client'
import { resolveHeaderColumn, normalizeProgram } from './mapper'
import { logger } from '../../utils/logger'
import { settingsService } from '../../services/settings.service'

function getConfig() {
  const config = settingsService.getSheetsConfig()
  if (!config.spreadsheetId || !config.serviceAccountKey) {
    throw new Error('Google Sheets is not configured.')
  }
  return {
    sheets: createSheetsClient(config.serviceAccountKey),
    spreadsheetId: config.spreadsheetId
  }
}

export const sheetsAdapter = {
  /** Read all rows from the first data sheet (assumes Sheet1) */
  async readAllRows(sheetName = 'Sheet1'): Promise<string[][]> {
    const { sheets, spreadsheetId } = getConfig()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:DZ`
    })
    const rows = response.data.values ?? []
    // First row = headers, rest = data
    return rows
  },

  /** Append a new row to the sheet */
  async appendRow(data: string[], sheetName = 'Sheet1'): Promise<void> {
    const { sheets, spreadsheetId } = getConfig()
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [data] }
    })
    logger.info('sheets-adapter', 'Row appended')
  },

  /** Update a specific row by index (1-based, 1 = header, 2 = first data row) */
  async updateRow(rowIndex: number, data: string[], sheetName = 'Sheet1'): Promise<void> {
    const { sheets, spreadsheetId } = getConfig()
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex}:DZ${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [data] }
    })
    logger.info('sheets-adapter', `Row ${rowIndex} updated`)
  },

  /** Find a row by composite key and update, or append if not found */
  async upsertRow(
    fullName: string,
    program: string,
    yearGraduated: number,
    rowData: string[],
    sheetName = 'Sheet1'
  ): Promise<void> {
    const rows = await this.readAllRows(sheetName)
    if (rows.length === 0) {
      await this.appendRow(rowData, sheetName)
      return
    }

    const headers = rows[0]

    // Find composite key column indices via fuzzy header resolution
    let nameIdx = -1
    let progIdx = -1
    let yearIdx = -1
    let lastMainCol: string | null = null

    for (let i = 0; i < headers.length; i++) {
      const col = resolveHeaderColumn(headers[i], lastMainCol)
      if (col && !col.endsWith('_other') && col !== 'honors_received' &&
          col !== 'awards_received' && col !== 'grad_school_program') {
        lastMainCol = col
      }
      if (col === 'full_name') nameIdx = i
      else if (col === 'program') progIdx = i
      else if (col === 'year_graduated') yearIdx = i
    }

    if (nameIdx === -1 || progIdx === -1 || yearIdx === -1) {
      // Can't match — just append
      logger.warn('sheets-adapter', 'Could not resolve composite key columns, appending new row')
      await this.appendRow(rowData, sheetName)
      return
    }

    const targetName = fullName.trim().toLowerCase()
    const targetProgram = normalizeProgram(program) ?? program
    const targetYear = String(yearGraduated).trim()

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowProgramNorm = normalizeProgram(row[progIdx])
      const programMatches = rowProgramNorm !== null
        ? rowProgramNorm === targetProgram
        : String(row[progIdx] ?? '') === program
      if (
        String(row[nameIdx] ?? '').trim().toLowerCase() === targetName &&
        programMatches &&
        String(row[yearIdx] ?? '').trim() === targetYear
      ) {
        await this.updateRow(i + 1, rowData, sheetName)
        return
      }
    }

    // Not found — append
    await this.appendRow(rowData, sheetName)
  }
}
