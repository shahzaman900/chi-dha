"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePatientStore } from "@/store/patient-store"

export function PracticeHeader() {
  const { setIsRegistrationOpen } = usePatientStore()

  const handleOpenRegistration = () => {
    setIsRegistrationOpen(true)
  }

  return (
    <div className="flex justify-end gap-3 pb-4">
      <Button 
        onClick={handleOpenRegistration}
        className="bg-[#0f62fe] hover:bg-blue-700 text-white font-medium rounded-md h-10 px-5 shadow-sm text-sm"
      >
        Register Patient
      </Button>
      <Button 
        variant="outline" 
        className="bg-white border text-[#0f62fe] hover:bg-slate-50 font-medium rounded-md h-10 px-4 shadow-sm text-sm flex items-center gap-2"
        style={{ borderColor: "#0f62fe" }}
      >
        <AlertTriangle className="h-4 w-4 text-orange-400 fill-orange-100" />
        Quick Register
      </Button>
    </div>
  )
}
