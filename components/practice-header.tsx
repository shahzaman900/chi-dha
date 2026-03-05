"use client"

import { Plus, RotateCw, Archive, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePatientStore } from "@/store/patient-store"

export function PracticeHeader() {
  const { selectedPatientId, patients, openPhrTab, setIsRegistrationOpen } = usePatientStore()

  const handleViewPhr = () => {
    if (selectedPatientId) {
      const patient = patients.find((p) => p.id === selectedPatientId)
      if (patient) {
        openPhrTab(patient.id, patient.name)
      }
    }
  }

  const handleOpenRegistration = () => {
    setIsRegistrationOpen(true)
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm relative z-0">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
           <Archive className="h-6 w-6 text-blue-500" /> Patients
        </h1>
        <div className="w-[320px]">
          <Input 
            placeholder="Search patients..." 
            className="h-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 rounded-full px-4" 
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleOpenRegistration}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Patient
        </Button>
        <Button size="icon" variant="outline" className="h-10 w-10 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-full">
           <RotateCw className="h-4 w-4" />
        </Button>
        {selectedPatientId && (
          <Button 
            onClick={handleViewPhr} 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 ml-2"
          >
            <FileText className="h-4 w-4" /> View PHR
          </Button>
        )}
      </div>
    </div>
  )
}
