const TEMPLATE_VARS: Record<string, string> = {
  fullName: 'Juan Dela Cruz',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  program: 'BSCpE',
  yearGraduated: '2022',
  gmailAddress: 'juan.delacruz@gmail.com',
}

export function renderPreview(template: string, overrides?: Record<string, string>): string {
  const vars = { ...TEMPLATE_VARS, ...overrides }
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return vars[key] ?? match
  })
}

export function getAvailableVariables(): { key: string; label: string }[] {
  return [
    { key: 'fullName', label: 'Full Name' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'program', label: 'Program' },
    { key: 'yearGraduated', label: 'Year Graduated' },
    { key: 'gmailAddress', label: 'Gmail Address' },
  ]
}
