"use client"

import { PracticeHeader } from "@/components/practice-header"
import { PatientTable } from "@/components/patient-table"
import { EncountersTable } from "@/components/encounters-table"
import { SiteHeader } from "@/components/site-header"
import { PhrTabBar } from "@/components/phr-tab-bar"
import { PhrDisplay } from "@/components/phr-display"
import { PatientHealthRecordDisplay } from "@/components/patient-health-record-display"
import { PatientRegistrationModal } from "@/components/patient-registration-modal"
import { usePatientStore } from "@/store/patient-store"

export default function Home() {
  const { openTabs, activeTabId, currentMainTab } = usePatientStore()

  // Find the active tab's patientId
  const activeTab = openTabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex h-screen flex-col bg-[#fcfcfc] text-foreground">
      <SiteHeader />
      <div className="flex flex-col flex-1 overflow-hidden bg-[#fafafa]">
         <PhrTabBar />
         {activeTab ? (
           activeTab.type === 'phr' ? (
             <PatientHealthRecordDisplay patientId={activeTab.patientId} />
           ) : (
             <PhrDisplay patientId={activeTab.patientId} />
           )
         ) : (
           <div className="flex flex-col flex-1 overflow-hidden p-6 pt-8 max-w-[1700px] mx-auto w-full">
             <PracticeHeader />
             <div className="flex-1 overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col relative w-full h-[calc(100vh-140px)]">
               {currentMainTab === "ews" ? <PatientTable /> : <EncountersTable />}
             </div>
           </div>
         )}
      </div>
      
      <PatientRegistrationModal />
    </div>
  )
}
