import { useRef } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { EmailComposeData } from '../-schemas/email.schema'
import { TemplateVarHelper } from './template-var-helper'
import { MessageTemplates } from './message-templates'

interface EmailComposerProps {
  register: UseFormRegister<EmailComposeData>
  setValue: UseFormSetValue<EmailComposeData>
  watch: UseFormWatch<EmailComposeData>
  errors: Record<string, { message?: string }>
}

export function EmailComposer({ register, setValue, watch, errors }: EmailComposerProps) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const { ref: bodyRegRef, ...bodyRest } = register('body')

  const handleInsertVar = (variable: string) => {
    const textarea = bodyRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = watch('body') || ''
    const newValue = current.slice(0, start) + variable + current.slice(end)
    setValue('body', newValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    })
  }

  const handleSelectTemplate = (subject: string, body: string) => {
    setValue('subject', subject)
    setValue('body', body)
  }

  return (
    <div className="space-y-4">
      <MessageTemplates onSelect={handleSelectTemplate} />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Subject</label>
        <input
          type="text"
          {...register('subject')}
          placeholder="Enter email subject..."
          className="h-10 w-full rounded-lg border border-card-border bg-surface-primary px-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.subject?.message && (
          <p className="mt-1 text-xs text-error">{errors.subject.message}</p>
        )}
      </div>

      <TemplateVarHelper onInsert={handleInsertVar} />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Message Body</label>
        <textarea
          {...bodyRest}
          ref={(el) => {
            bodyRegRef(el)
            bodyRef.current = el
          }}
          rows={10}
          placeholder="Write your email here... Use {{fullName}}, {{program}}, etc."
          className="w-full rounded-lg border border-card-border bg-surface-primary p-4 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        {errors.body?.message && (
          <p className="mt-1 text-xs text-error">{errors.body.message}</p>
        )}
      </div>
    </div>
  )
}
