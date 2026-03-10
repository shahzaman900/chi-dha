"use client"

import { Patient } from "@/store/patient-store"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

interface ResolveSheetProps {
  patient: Patient | undefined
  open: boolean
  onClose: () => void
  onConfirm: (patientId: string, reason: string, note: string) => void
}

export function ResolveSheet({ patient, open, onClose, onConfirm }: ResolveSheetProps) {
  const [resolutionReason, setResolutionReason] = useState("")
  const [closingNote, setClosingNote] = useState("")
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false)
  const [adjustBaselines, setAdjustBaselines] = useState(false)

  if (!patient) return null

  const handleClose = () => {
    onClose();
    setResolutionReason("");
    setClosingNote("");
    setScheduleFollowUp(false);
    setAdjustBaselines(false);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-emerald-500 border-l-[4px]">
        <SheetHeader className="px-6 py-5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <SheetTitle className="text-xl">Resolve Alert Encounter</SheetTitle>
          </div>
          <SheetDescription>
            Document the clinical resolution to safely close this loop.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Patient Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{patient.name}</h3>
              <p className="text-slate-500 text-sm">MRN: {patient.id.padStart(6, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Status</p>
              <p className="text-sm font-medium text-slate-700">{patient.status}</p>
            </div>
          </div>
          
          {/* Resolution Form */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* 1. Reason */}
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Resolution Reason <span className="text-red-500">*</span></label>
              <Select value={resolutionReason} onValueChange={setResolutionReason}>
                <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Select primary reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stabilized">Patient Stabilized Post-Intervention</SelectItem>
                  <SelectItem value="false_alarm">False Alarm / Sensor Artifact</SelectItem>
                  <SelectItem value="medication_adjusted">Medication Adjusted</SelectItem>
                  <SelectItem value="admitted">Admitted to Hospital / ER</SelectItem>
                  <SelectItem value="patient_refused">Patient Refused Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Closing Note */}
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">Final Clinical Note <span className="text-red-500">*</span></label>
              <Textarea 
                placeholder="Document your final assessment, interventions provided, and the patient's response..."
                className="flex-1 min-h-[120px] resize-none bg-white border-slate-300 focus-visible:ring-emerald-500 shadow-inner"
                value={closingNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClosingNote(e.target.value)}
              />
            </div>

            {/* 3. Follow-up Checkboxes */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3">Post-Resolution Plan</h4>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={scheduleFollowUp} onCheckedChange={(c) => setScheduleFollowUp(!!c)} className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Schedule 24h Telemed Follow-up</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={adjustBaselines} onCheckedChange={(c) => setAdjustBaselines(!!c)} className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Adjust Personal EWS Baselines</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">The system will use today&apos;s vitals to recalibrate this patient&apos;s &quot;normal&quot; thresholds to prevent future false alarms.</p>
                  </div>
                </label>
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
            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
            disabled={!resolutionReason || !closingNote}
            onClick={() => {
              onConfirm(patient.id, resolutionReason, closingNote);
              handleClose();
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Sign-off & Resolve
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
