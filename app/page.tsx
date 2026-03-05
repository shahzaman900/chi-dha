"use client"

import { PracticeHeader } from "@/components/practice-header"
import { PatientTable } from "@/components/patient-table"
import { SiteHeader } from "@/components/site-header"
import { PhrTabBar } from "@/components/phr-tab-bar"
import { PhrDisplay } from "@/components/phr-display"
import { PatientRegistrationModal } from "@/components/patient-registration-modal"
import { usePatientStore } from "@/store/patient-store"

export default function Home() {
  const { openTabs, activeTabId } = usePatientStore()

  // Find the active tab's patientId
  const activeTab = openTabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="flex flex-col flex-1 overflow-hidden">
         <PhrTabBar />
         {activeTab ? (
           <PhrDisplay patientId={activeTab.patientId} />
         ) : (
           <>
             <PracticeHeader />
             <PatientTable />
           </>
         )}
      </div>
      
      <PatientRegistrationModal />
    </div>
  )
}
