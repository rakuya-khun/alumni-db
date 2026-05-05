import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Users, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailComposeSchema, type EmailComposeData } from './-schemas/email.schema'
import { RecipientFilter } from './-components/recipient-filter'
import { RecipientCount } from './-components/recipient-count'
import { EmailComposer } from './-components/email-composer'
import { GformLinkToggle } from './-components/gform-link-toggle'
import { EmailPreview } from './-components/email-preview'
import { SendProgress } from './-components/send-progress'
import { useRecipients } from './-hooks/use-recipients'
import { useEmailSend } from './-hooks/use-email-send'
import { useToast } from '../../hooks/use-toast'
import { AlumniPicker } from './-components/alumni-picker'
import type { Alumni } from '../../../../shared/types/alumni.types'

export default function EmailComposePage() {
  const { filters, updateFilters, loading: recipientsLoading, validCount } = useRecipients()
  const { send, sending, result } = useEmailSend()
  const toast = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [includeGformLink, setIncludeGformLink] = useState(false)
  const [mode, setMode] = useState<'bulk' | 'single'>('bulk')
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmailComposeData>({
    resolver: zodResolver(emailComposeSchema),
    defaultValues: { subject: '', body: '', includeGformLink: false },
  })

  const subject = watch('subject')
  const body = watch('body')

  const onSubmit = async (data: EmailComposeData) => {
    if (mode === 'bulk') {
      if (validCount === 0) return
      await send({
        subject: data.subject,
        body: data.body,
        recipientFilters: filters,
        includeGformLink,
      })
      return
    }

    if (!selectedAlumni || !selectedAlumni.gmail_address) {
      toast.error('No recipient selected', 'Please search and select an alumni to send to.')
      return
    }
    const fullName = selectedAlumni.full_name || ''
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
    await send({
      subject: data.subject,
      body: data.body,
      recipients: [selectedAlumni.gmail_address],
      recipientVars: {
        fullName,
        firstName,
        lastName,
        program: selectedAlumni.program || '',
        yearGraduated: String(selectedAlumni.year_graduated ?? ''),
        gmailAddress: selectedAlumni.gmail_address,
      },
      includeGformLink,
    })
  }

  const sendDisabled = sending || (mode === 'bulk' ? validCount === 0 : !selectedAlumni)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/email" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Email
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">Compose Email</h1>

      {/* Mode Toggle */}
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">Who are you sending to?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
              mode === 'bulk'
                ? 'border-primary bg-primary/5'
                : 'border-card-border hover:bg-surface-secondary'
            }`}
          >
            <Users className={`h-5 w-5 mt-0.5 ${mode === 'bulk' ? 'text-primary' : 'text-text-secondary'}`} />
            <div>
              <div className="font-medium text-text-primary">All Matching Alumni</div>
              <div className="text-sm text-text-secondary">Send to everyone matching the filters below</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
              mode === 'single'
                ? 'border-primary bg-primary/5'
                : 'border-card-border hover:bg-surface-secondary'
            }`}
          >
            <User className={`h-5 w-5 mt-0.5 ${mode === 'single' ? 'text-primary' : 'text-text-secondary'}`} />
            <div>
              <div className="font-medium text-text-primary">One Person</div>
              <div className="text-sm text-text-secondary">Send to a single email address</div>
            </div>
          </button>
        </div>
      </div>

      {mode === 'bulk' ? (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-4">
          <RecipientFilter filters={filters} onUpdate={updateFilters} />
          <RecipientCount count={validCount} loading={recipientsLoading} />
        </div>
      ) : (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Select Alumni
          </label>
          <AlumniPicker selected={selectedAlumni} onSelect={setSelectedAlumni} />
          <p className="mt-2 text-xs text-text-secondary">
            Search by name, email, program, or year. Only alumni with an email address are shown.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <EmailComposer
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors as Record<string, { message?: string }>}
          />
          <div className="mt-4">
            <GformLinkToggle enabled={includeGformLink} onChange={setIncludeGformLink} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-card-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            type="submit"
            disabled={sendDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {mode === 'bulk'
              ? `Send to ${validCount} Recipient${validCount !== 1 ? 's' : ''}`
              : selectedAlumni
              ? `Send to ${selectedAlumni.full_name}`
              : 'Send Email'}
          </button>
        </div>
      </form>

      {showPreview && <EmailPreview subject={subject} body={body} />}
      <SendProgress sending={sending} result={result} />
    </div>
  )
}
