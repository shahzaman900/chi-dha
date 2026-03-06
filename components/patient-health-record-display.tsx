"use client"

import { usePhrStore } from "@/store/phr-store"
import { usePatientStore } from "@/store/patient-store"
import { Siren, AlertTriangle, X, Plus, Calendar, Phone, BriefcaseMedical, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PatientHealthRecordDisplay({ patientId }: { patientId: string }) {
  const { getPhrByPatientId } = usePhrStore()
  const patient = getPhrByPatientId(patientId)
  const { closePhrTab } = usePatientStore()

  if (!patient) {
      return (
        <div className="flex bg-white text-slate-800 items-center justify-center p-8 h-full">
            <h2 className="text-xl font-bold">Patient Not Found</h2>
        </div>
      )
  }

  return (
    <div className="flex overflow-auto flex-col bg-white text-slate-800 h-full w-full relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10 w-full shrink-0 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Patient Health Record</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-slate-100 text-slate-500 rounded-full"
          onClick={() => closePhrTab(`phr-${patient.patientId}`)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-6 overflow-auto bg-[#fafafa] flex-1 w-full max-w-[1700px] mx-auto">
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 md:flex-row md:items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-[#eaf3fd] flex items-center justify-center shrink-0 mt-1">
               <span className="text-xl font-bold text-[#0f62fe]">
                  {patient.profile.name.split(' ').map((n: string) => n[0]).join('')}
               </span>
            </div>
            
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800">{patient.profile.name}</h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs font-bold uppercase">MALE</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">{patient.profile.age} years</span>
               </div>
               
               <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-slate-400" />
                     <span>03/02/1960</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Phone className="h-4 w-4 text-slate-400" />
                     <span>3456789876</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <BriefcaseMedical className="h-4 w-4 text-slate-400" />
                     <span>MRT-0001306</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 text-sm">
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold">+</span>
                  <span className="font-bold text-slate-700">Pharmacy Info:</span>
                  <span className="text-slate-500">No pharmacy information available</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button className="bg-[#0f62fe] hover:bg-blue-700 text-white rounded-lg h-9">
                <FileText className="h-4 w-4 mr-2" />
                Edit Intake Form
             </Button>
             
             <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">RPM</span>
             </div>
             
             <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">CCM</span>
             </div>
             
             <Button variant="secondary" className="bg-slate-200 text-slate-400 cursor-not-allowed rounded-3xl h-9 px-4 ml-2">
                <div className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center mr-2 text-[10px]">+</div>
                Select Program
             </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-6 items-start h-[calc(100vh-280px)] min-h-[500px]">
           <div className="w-[260px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden shrink-0 pb-4 pt-10 relative">
               <div className="absolute top-4 right-4 h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                  <div className="w-3 h-3 border-b-2 border-r-2 border-slate-400 rotate-45 mb-1 relative left-[-2px]"></div>
               </div>
               <nav className="flex flex-col gap-1 w-full pl-0 flex-1 overflow-y-auto mt-4 custom-scrollbar pr-2">
                  <a href="#" className="flex items-center gap-3 px-6 py-3 bg-[#e8f0fe] text-[#0f62fe] font-bold text-sm border-l-4 border-[#0f62fe]">
                     <div className="grid grid-cols-2 gap-[2px] w-[14px]">
                        <div className="h-1.5 w-full bg-[#0f62fe]"></div>
                        <div className="h-1.5 w-full bg-[#0f62fe]"></div>
                        <div className="h-1.5 w-full bg-[#0f62fe]"></div>
                        <div className="h-1.5 w-full bg-[#0f62fe]"></div>
                     </div>
                     Master Problem List
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <AlertTriangle className="h-4 w-4" />
                     Master Allergy List
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <div className="h-4 w-4 bg-slate-500 text-white rounded-[2px] flex items-center justify-center font-bold text-[10px]">+</div>
                     Master Medications
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <BriefcaseMedical className="h-4 w-4" />
                     Master Surgical History
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <div className="flex gap-[1px]">
                        <div className="w-1.5 h-3 bg-slate-500 rounded-sm"></div>
                        <div className="w-1.5 h-2.5 bg-slate-500 rounded-sm mt-0.5"></div>
                     </div>
                     Master Family History
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <div className="relative">
                        <BriefcaseMedical className="h-4 w-4" />
                        <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-white flex items-center justify-center">
                           <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                        </div>
                     </div>
                     Master Past Medical...
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 py-3 text-slate-600 font-semibold text-sm hover:bg-slate-50 border-l-4 border-transparent">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                     </div>
                     Master Social History
                  </a>
               </nav>
           </div>
           
           <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
               <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-[#eaf3fd] bg-opacity-30">
                  <h3 className="text-slate-800 font-bold text-[15px]">Master Problem List</h3>
                  <Button size="icon" className="h-8 w-8 rounded bg-violet-500 hover:bg-violet-600 text-white">
                     <Plus className="h-4 w-4" />
                  </Button>
               </div>
               
               <div className="flex-1 w-full flex flex-col items-center">
                  <div className="w-full grid grid-cols-5 bg-[#fafafa] border-b border-slate-200 px-6 py-4">
                     <div className="text-slate-700 font-bold flex items-center gap-1 text-[13px]">
                        Problem Name <span className="text-red-500">*</span>
                     </div>
                     <div className="text-slate-700 font-bold text-[13px] text-center">ICD-10 Code</div>
                     <div className="text-slate-700 font-bold text-[13px] text-center">Start Date</div>
                     <div className="text-slate-700 font-bold text-[13px] text-center">End Date</div>
                     <div className="text-slate-700 font-bold text-[13px] pl-4">Notes</div>
                  </div>
                  
                  <div className="w-full h-24 flex items-center justify-center text-slate-700 font-medium text-sm">
                     No problems added yet
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  )
}
