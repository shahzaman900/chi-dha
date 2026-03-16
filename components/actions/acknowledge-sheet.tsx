"use client"

import { Patient } from "@/store/patient-store"
import { AlertCircle, Siren, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useState } from "react"

interface AcknowledgeSheetProps {
  patient: Patient | undefined
  open: boolean
  onClose: () => void
  onConfirm: (patientId: string, note: string) => void
}

export function AcknowledgeSheet({ patient, open, onClose, onConfirm }: AcknowledgeSheetProps) {
  const [actionNote, setActionNote] = useState("")

  if (!patient) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto">
        <SheetHeader className="px-6 py-5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <SheetTitle className="text-xl">Acknowledge Alert</SheetTitle>
          </div>
          <SheetDescription>
            Review clinical context and take ownership of this alert.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Patient Summary Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{patient.name}</h3>
                <p className="text-slate-500 text-sm">{patient.age}y • MRN: {patient.id.padStart(6, '0')} • Room 402B</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded text-orange-700 bg-orange-50 border-orange-200 mb-1">
                  AI Score: {patient.aiTriageScore}
                </div>
                <span className="text-xs font-medium text-slate-500">EWS: {patient.ewsScore}</span>
              </div>
            </div>

            {/* Why are they here? */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-1">Trigger Event</p>
              <p className="text-sm text-slate-600 bg-orange-50/50 p-3 rounded-md border border-orange-100 flex items-start gap-2">
                <Siren className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <span>
                  {patient.status === "Emergency Protocol" || patient.ewsScore >= 9
                    ? `Critical EWS triggered (${patient.ewsScore}). AI detecting physiological distress.`
                    : `${patient.trend} trend detected. AI monitoring initiated for ${patient.name}.`}
                </span>
              </p>
            </div>
          </div>

          {/* Vitals Snapshot */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 ml-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Latest Vitals
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Heart Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">
                    {patient.draftSoapNote?.objective?.vitals?.hr || patient.vitalsTrend?.hr?.[patient.vitalsTrend.hr.length - 1] || "—"}
                  </span>
                  <span className="text-xs text-red-500 font-bold">↑</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">SpO2</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold ${(Number(patient.draftSoapNote?.objective?.vitals?.spo2) || 0) < 90 ? "text-red-600" : "text-slate-900"}`}>
                    {patient.draftSoapNote?.objective?.vitals?.spo2 || patient.vitalsTrend?.spo2?.[patient.vitalsTrend.spo2.length - 1] || "—"}%
                  </span>
                  <span className="text-xs text-red-500 font-bold">↓</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Blood Press.</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">
                    {patient.draftSoapNote?.objective?.vitals?.bpSystolic 
                      ? `${patient.draftSoapNote.objective.vitals.bpSystolic}/${patient.draftSoapNote.objective.vitals.bpDiastolic}`
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Temp</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">
                    {patient.draftSoapNote?.objective?.vitals?.temp || "—"}°
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nurse Assessment Note */}
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2 ml-1">Initial Assessment Note (Optional)</label>
            <Textarea 
              placeholder="E.g. Patient appears flushed, applying supplemental oxygen..."
              className="flex-1 min-h-[120px] resize-none bg-white border-slate-200 focus-visible:ring-brand-500"
              value={actionNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionNote(e.target.value)}
            />
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              onClose();
              setActionNote("");
            }}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
            onClick={() => {
              onConfirm(patient.id, actionNote);
              onClose();
              setActionNote("");
            }}
          >
            Take Ownership
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
