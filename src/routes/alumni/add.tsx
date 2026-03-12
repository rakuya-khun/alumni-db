import { AlumniForm } from './-components/alumni-form'

export default function AlumniAddPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Add Alumni Record</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Fill in the survey information for a new alumni.
        </p>
      </div>
      <AlumniForm mode="create" />
    </div>
  )
}