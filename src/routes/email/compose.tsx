import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
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

export default function EmailComposePage() {
  const { recipients, filters, updateFilters, loading: recipientsLoading, validCount } = useRecipients()
  const { send, sending, result } = useEmailSend()
  const [showPreview, setShowPreview] = useState(false)
  const [includeGformLink, setIncludeGformLink] = useState(false)

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
    if (validCount === 0) return
    await send({
      subject: data.subject,
      body: data.body,
      recipientFilters: filters,
      includeGformLink,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/email" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Email
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">Compose Email</h1>

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-4">
        <RecipientFilter filters={filters} onUpdate={updateFilters} />
        <RecipientCount count={validCount} loading={recipientsLoading} />
      </div>

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
            disabled={sending || validCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send to {validCount} Recipient{validCount !== 1 ? 's' : ''}
          </button>
        </div>
      </form>

      {showPreview && <EmailPreview subject={subject} body={body} />}
      <SendProgress sending={sending} result={result} />
    </div>
  )
}
