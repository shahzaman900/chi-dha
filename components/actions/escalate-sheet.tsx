"use client"

import { Patient } from "@/store/patient-store"
import { Stethoscope, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface EscalateSheetProps {
  patient: Patient | undefined
  open: boolean
  onClose: () => void
  onConfirm: (patientId: string, doctorId: string, assessment: string, recommendation: string) => void
}

export function EscalateSheet({ patient, open, onClose, onConfirm }: EscalateSheetProps) {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [sbarAssessment, setSbarAssessment] = useState("")
  const [sbarRecommendation, setSbarRecommendation] = useState("")

  if (!patient) return null

  const handleClose = () => {
    onClose();
    setSelectedDoctor("");
    setSbarAssessment("");
    setSbarRecommendation("");
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-indigo-500 border-l-[4px]">
        <SheetHeader className="px-6 py-5 bg-indigo-600 border-b border-indigo-700 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="h-5 w-5 text-indigo-100" />
            <SheetTitle className="text-xl text-white">Escalate to Physician</SheetTitle>
          </div>
          <SheetDescription className="text-indigo-100 font-medium">
            Formal Clinical SBAR Handoff
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 flex flex-col gap-6">
          
          {/* Physician Selection */}
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wider">Select Attending Physician</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-full bg-white border-slate-200 h-12 shadow-sm focus:ring-indigo-500">
                <SelectValue placeholder="Assign to an on-call doctor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr_smith">Dr. Sarah Smith (Cardiology)</SelectItem>
                <SelectItem value="dr_jones">Dr. Michael Jones (Pulmonology)</SelectItem>
                <SelectItem value="dr_patel">Dr. Amit Patel (Internal Med)</SelectItem>
                <SelectItem value="dr_chen">Dr. Emily Chen (Hospitalist)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> 
                SBAR Clinical Handoff Form
              </h3>
            </div>
            
            <div className="p-4 flex flex-col gap-4 flex-1">
              {/* S: Situation */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">S</div>
                  <label className="text-sm font-bold text-slate-700">Situation <span className="text-slate-400 font-normal text-xs">(Auto-filled)</span></label>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  Escalating patient {patient.name} ({patient.age}y). EWS Score is currently {patient.ewsScore} (Condition: {patient.status}). Patient triggered automated early warning for anomalous vital trends.
                </div>
              </div>
              
              {/* B: Background */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">B</div>
                  <label className="text-sm font-bold text-slate-700">Background <span className="text-slate-400 font-normal text-xs">(Auto-filled)</span></label>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  Admitted securely 2 days ago. Primary DX: exacerbation of chronic condition. Latest AI Triage Risk index is {patient.aiTriageScore}/10. 
                </div>
              </div>

              {/* A: Assessment */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">A</div>
                  <label className="text-sm font-bold text-slate-900">Assessment <span className="text-red-500">*</span></label>
                </div>
                <Textarea 
                  placeholder="What is your clinical assessment of the current situation?"
                  className="flex-1 min-h-[80px] resize-none bg-white border-slate-300 focus-visible:ring-indigo-500 shadow-inner"
                  value={sbarAssessment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSbarAssessment(e.target.value)}
                />
              </div>

              {/* R: Recommendation */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">R</div>
                  <label className="text-sm font-bold text-slate-900">Recommendation / Request <span className="text-red-500">*</span></label>
                </div>
                <Textarea 
                  placeholder="What do you need the physician to do? (e.g., 'Please evaluate patient at bedside' or 'Requesting order for Lasix 40mg IV')"
                  className="flex-1 min-h-[80px] resize-none bg-white border-slate-300 focus-visible:ring-indigo-500 shadow-inner"
                  value={sbarRecommendation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSbarRecommendation(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
            disabled={!selectedDoctor || !sbarAssessment || !sbarRecommendation}
            onClick={() => {
              onConfirm(patient.id, selectedDoctor, sbarAssessment, sbarRecommendation);
              handleClose();
            }}
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Send Handoff & Escalate
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
