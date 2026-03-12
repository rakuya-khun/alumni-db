import { useState } from 'react'
import { FileText, ChevronDown } from 'lucide-react'

interface MessageTemplate {
  id: string
  name: string
  subject: string
  body: string
}

const templates: MessageTemplate[] = [
  {
    id: 'survey-invitation',
    name: 'Alumni Survey Invitation',
    subject: 'Alumni Tracer Study — We Need Your Input, {{fullName}}!',
    body: `Dear {{fullName}},

Greetings from the College of Engineering, Southern Luzon State University!

As a proud graduate of the {{program}} program (Batch {{yearGraduated}}), your experiences and insights are invaluable to us. We are currently conducting our Alumni Tracer Study to evaluate and improve the quality of education we provide.

We kindly request you to take a few minutes to complete our online survey. Your responses will help us better understand how well our program has prepared you for your professional career and will contribute to our continuous improvement efforts.

We greatly appreciate your time and participation.

Warm regards,
College of Engineering
Southern Luzon State University`,
  },
  {
    id: 'survey-reminder',
    name: 'Survey Follow-Up Reminder',
    subject: 'Reminder: Alumni Tracer Study — Your Response Matters, {{fullName}}',
    body: `Dear {{fullName}},

We hope this message finds you well. This is a friendly follow-up regarding the Alumni Tracer Study we sent earlier.

We noticed that we have not yet received your response, and we would really appreciate it if you could spare a few minutes to fill out the survey. Your feedback as a {{program}} graduate (Batch {{yearGraduated}}) plays a vital role in helping us improve our academic programs and meet accreditation standards.

If you have already submitted your response, please disregard this message. Thank you for your continued support!

Best regards,
College of Engineering
Southern Luzon State University`,
  },
  {
    id: 'thank-you',
    name: 'Thank You for Responding',
    subject: 'Thank You for Completing the Alumni Survey, {{fullName}}!',
    body: `Dear {{fullName}},

Thank you so much for taking the time to complete the Alumni Tracer Study! Your response is extremely valuable to us.

Your feedback as a {{program}} graduate will directly contribute to the improvement of our academic programs and support our pursuit of PTC-ACBET accreditation.

We wish you continued success in your career and personal endeavors. Please don't hesitate to reach out if you need anything from the College of Engineering.

With warm regards,
College of Engineering
Southern Luzon State University`,
  },
  {
    id: 'general-update',
    name: 'General Alumni Update',
    subject: 'Updates from the College of Engineering — {{program}}',
    body: `Dear {{fullName}},

Greetings from the College of Engineering, Southern Luzon State University!

We hope you are doing well. We are reaching out to share some updates and stay connected with our valued alumni from the {{program}} program.

[Your message here]

We look forward to hearing from you. Please feel free to reply to this email or contact us anytime.

Best regards,
College of Engineering
Southern Luzon State University`,
  },
]

interface MessageTemplatesProps {
  onSelect: (subject: string, body: string) => void
}

export function MessageTemplates({ onSelect }: MessageTemplatesProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (template: MessageTemplate) => {
    onSelect(template.subject, template.body)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-surface-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
      >
        <FileText className="h-4 w-4" />
        Use a Ready-Made Template
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl)}
              className="rounded-lg border border-card-border bg-surface-primary p-4 text-left hover:bg-surface-secondary hover:border-primary transition-colors group"
            >
              <p className="text-sm font-medium text-text-primary group-hover:text-primary">
                {tpl.name}
              </p>
              <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                {tpl.body.slice(0, 120)}...
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
