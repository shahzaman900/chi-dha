import { PracticeHeader } from "@/components/practice-header"
import { PatientTable } from "@/components/patient-table"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="flex flex-col flex-1 overflow-hidden">
         <PracticeHeader />
         <PatientTable />
      </div>
    </div>
  )
}
