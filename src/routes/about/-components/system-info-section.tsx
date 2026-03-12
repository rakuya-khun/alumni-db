import { useAppVersion } from '../-hooks/use-app-version'

export function SystemInfoSection() {
  const version = useAppVersion()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">System Information</h3>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-text-secondary">Purpose:</span>
          <p className="mt-0.5 text-text-primary">
            The Alumni DB Management System is a desktop application designed for managing alumni
            tracer study data across three engineering programs (CE, CpE, EE) at the Southern Luzon
            State University, College of Engineering.
          </p>
        </div>

        <div>
          <span className="font-medium text-text-secondary">Goals:</span>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-text-primary">
            <li>Centralize alumni data collection from Google Forms</li>
            <li>Enable analysis for PTC-ACBET accreditation</li>
            <li>Simplify reporting with multi-format exports</li>
          </ul>
        </div>

        <div>
          <span className="font-medium text-text-secondary">Target Users:</span>
          <p className="mt-0.5 text-text-primary">College Dean, Program Chairpersons (CE, CpE, EE)</p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="font-medium text-text-secondary">Version:</span>
            <span className="ml-2 text-text-primary">{version}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
