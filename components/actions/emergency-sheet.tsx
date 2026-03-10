"use client"

import { Patient } from "@/store/patient-store"
import { Siren, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useState } from "react"

interface EmergencySheetProps {
  patient: Patient | undefined
  open: boolean
  onClose: () => void
  onConfirm: (patientId: string, dispatchRrt: boolean, dispatchPhysician: boolean) => void
}

export function EmergencySheet({ patient, open, onClose, onConfirm }: EmergencySheetProps) {
  const [dispatchRrt, setDispatchRrt] = useState(true)
  const [dispatchPhysician, setDispatchPhysician] = useState(true)

  if (!patient) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-red-500 border-l-[6px]">
        <SheetHeader className="px-6 py-5 bg-red-600 border-b border-red-700 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Siren className="h-6 w-6 text-white animate-pulse" />
            <SheetTitle className="text-xl text-white">Trigger Emergency Protocol</SheetTitle>
          </div>
          <SheetDescription className="text-red-100 font-medium">
            You are about to initiate a Code Blue / Rapid Response.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Location Warning Box */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm text-center">
            <h3 className="font-bold text-xl text-red-900 mb-1">{patient.name}</h3>
            <p className="text-red-700 font-medium">{patient.age}y • MRN: {patient.id.padStart(6, '0')}</p>
            
            <div className="mt-4 inline-block bg-white px-6 py-3 rounded-lg border-2 border-red-300 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Current Location</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">ROOM 402B</p>
            </div>
          </div>

          {/* Dispatch Protocols */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 ml-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-600" />
              Emergency Dispatch Options
            </h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                <Checkbox checked={dispatchRrt} onCheckedChange={(c) => setDispatchRrt(!!c)} className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Deploy Rapid Response Team (RRT)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Dispatches the internal critical care team immediately to Room 402B.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                <Checkbox checked={dispatchPhysician} onCheckedChange={(c) => setDispatchPhysician(!!c)} className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Alert On-Call Attending</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sends priority SMS override to Dr. Smith&apos;s mobile device.</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                <Checkbox checked={true} disabled className="mt-0.5 data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400 opacity-50" />
                <div className="opacity-70">
                  <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    Automated Crash Cart Request <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold tracking-wider">Default</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">System automatically routes nearest crash cart based on RFID.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg text-lg h-12 flex items-center gap-2"
            onClick={() => {
              onConfirm(patient.id, dispatchRrt, dispatchPhysician);
              onClose();
              setDispatchRrt(true);
              setDispatchPhysician(true);
            }}
          >
            <Siren className="h-5 w-5" />
            Dispatch Emergency
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
