/**
 * Simple HTML email template with {{variable}} substitution.
 *
 * Supported variables:
 * - {{fullName}} — Alumni full name
 * - {{firstName}} — First name (extracted from fullName)
 * - {{lastName}} — Last name (extracted from fullName)
 * - {{program}} — Program (BSCE, BSCpE, BSEE)
 * - {{yearGraduated}} — Year graduated
 * - {{gmailAddress}} — Gmail address
 */

export interface TemplateVariables {
  fullName?: string
  program?: string
  yearGraduated?: number | string
  gmailAddress?: string
}

/**
 * Replace all {{variable}} placeholders in a template string.
 */
export function renderTemplate(template: string, vars: TemplateVariables): string {
  let result = template

  const fullName = vars.fullName ?? ''
  const parts = fullName.split(' ').filter(Boolean)
  const firstName = parts[0] ?? ''
  const lastName = parts.length > 1 ? parts[parts.length - 1] : ''

  const replacements: Record<string, string> = {
    fullName,
    firstName,
    lastName,
    program: vars.program ?? '',
    yearGraduated: String(vars.yearGraduated ?? ''),
    gmailAddress: vars.gmailAddress ?? ''
  }

  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  return result
}

/** Get all available template variable names */
export function getTemplateVariables(): string[] {
  return ['fullName', 'firstName', 'lastName', 'program', 'yearGraduated', 'gmailAddress']
}
