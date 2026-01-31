"use client"

import { Plus, RotateCw, Archive, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePatientStore } from "@/store/patient-store"

export function PracticeHeader() {
  const { selectedPatientId, setIsPhrOpen } = usePatientStore()

  const handleViewPhr = () => {
    if (selectedPatientId) {
      setIsPhrOpen(true)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
           <Archive className="h-5 w-5 text-slate-400" /> Patients
        </h1>
        <div className="w-[280px]">
          <Input 
            placeholder="Search" 
            className="h-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500" 
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-9 w-9 bg-slate-700 hover:bg-slate-600 text-slate-300">
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
