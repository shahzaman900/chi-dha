"use client";

import { Patient } from "@/store/patient-store";
import {
  Siren,
  Activity,
  Ambulance,
  Hospital,
  HeartPulse,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface EmergencySheetProps {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    patientId: string,
    dispatchRrt: boolean,
    dispatchPhysician: boolean,
  ) => void;
}

export function EmergencySheet({
  patient,
  open,
  onClose,
  onConfirm,
}: EmergencySheetProps) {
  const [dispatchRrt, setDispatchRrt] = useState(true);
  const [dispatchPhysician, setDispatchPhysician] = useState(true);
  const [step, setStep] = useState<"dispatch" | "protocol">("dispatch");
  const [nurseInstructions, setNurseInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState("");

  if (!patient) return null;

  const handleDispatch = () => {
    onConfirm(patient.id, dispatchRrt, dispatchPhysician);
    setStep("protocol");
  };

  const handleClose = () => {
    onClose();
    setStep("dispatch");
    setDispatchRrt(true);
    setDispatchPhysician(true);
    setNurseInstructions([]);
    setNewInstruction("");
  };

  const addInstruction = () => {
    const trimmed = newInstruction.trim();
    if (trimmed) {
      setNurseInstructions((prev) => [...prev, trimmed]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    setNurseInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const actions: string[] = [
    "Ambulance Unit 3 en route",
    "Paramedic team alerted",
    ...(dispatchRrt ? ["Rapid Response Team mobilized"] : []),
    ...(dispatchPhysician ? ["Attending physician paged"] : []),
  ];

  const ewsScore = patient.ewsScore ?? "—";
  const metrics = (patient as any).metrics || {};

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="sm:max-w-[700px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-red-500 border-l-[6px]">
        <SheetHeader className="px-6 py-5 bg-red-600 border-b border-red-700 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Siren className="h-6 w-6 text-white animate-pulse" />
            <SheetTitle className="text-xl text-white">
              {step === "dispatch"
                ? "Trigger Emergency Protocol"
                : "Emergency Protocol Details"}
            </SheetTitle>
          </div>
          <SheetDescription className="text-red-100 font-medium">
            {step === "dispatch"
              ? "You are about to initiate a Code Blue / Rapid Response."
              : `Emergency dispatched for ${patient.name}`}
          </SheetDescription>
        </SheetHeader>

        {step === "dispatch" ? (
          <>
            <div className="flex-1 p-6 flex flex-col gap-6">
              {/* Location Warning Box */}
              <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm text-center">
                <h3 className="font-bold text-xl text-red-900 mb-1">
                  {patient.name}
                </h3>
                <p className="text-red-700 font-medium">
                  {patient.age}y • MRN:{" "}
                  {patient.mrn || patient.id.padStart(6, "0")}
                </p>

                <div className="mt-4 inline-block bg-white px-6 py-3 rounded-lg border-2 border-red-300 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                    Current Location
                  </p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    G 7 Islamabad
                  </p>
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
                    <Checkbox
                      checked={dispatchRrt}
                      onCheckedChange={(c) => setDispatchRrt(!!c)}
                      className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Deploy Rapid Response Team (RRT)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dispatches the internal critical care team immediately
                        to Room 402B.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                    <Checkbox
                      checked={dispatchPhysician}
                      onCheckedChange={(c) => setDispatchPhysician(!!c)}
                      className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Alert On-Call Attending
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sends priority SMS override to Dr. Smith&apos;s mobile
                        device.
                      </p>
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
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg text-lg h-12 flex items-center gap-2"
                onClick={handleDispatch}
              >
                <Siren className="h-5 w-5" />
                Dispatch Emergency
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
              {/* Immediate ER Transport */}
              <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
                <div className="bg-red-50 px-5 py-3 border-b border-red-200">
                  <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Ambulance className="h-4 w-4" /> Immediate ER Transport
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      Dispatched
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">ETA</span>
                    <span className="text-lg font-bold text-red-600">
                      8 minutes
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Actions Taken
                    </span>
                    <ul className="mt-2 space-y-2">
                      {actions.map((action, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ER Triage Notification */}
              <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
                <div className="bg-amber-50 px-5 py-3 border-b border-amber-200">
                  <h3 className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Hospital className="h-4 w-4" /> ER Triage Notification
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Hospital
                    </span>
                    <p className="text-sm text-slate-800 font-semibold mt-1">
                      Dubai General Hospital — ER Bay 3
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Protocol
                    </span>
                    <p className="text-sm text-red-700 font-bold mt-1">
                      Code Blue — Cardiac Alert
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      Standing Orders
                    </span>
                    <ul className="mt-2 space-y-2">
                      {[
                        "12-lead ECG on arrival",
                        "Troponin + BNP stat",
                        "Crash cart standby",
                        "IV access x2 large bore",
                      ].map((order, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {order}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Clinical Handoff Data */}
              <div className="bg-white border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-5 py-3 border-b border-blue-200">
                  <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" /> Clinical Handoff Data
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Current Vitals
                    </span>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-slate-50 rounded-lg border p-3 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          HR
                        </span>
                        <p className="text-lg font-bold text-slate-800">
                          {patient.vitalsTrend?.hr?.slice(-1)[0] || "—"} bpm
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg border p-3 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          SpO2
                        </span>
                        <p className="text-lg font-bold text-slate-800">
                          {patient.vitalsTrend?.spo2?.slice(-1)[0] || "—"}%
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg border p-3 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          BP
                        </span>
                        <p className="text-lg font-bold text-slate-800">
                          {patient.vitalsTrend?.bp?.slice(-1)[0] || "—"} mmHg
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg border p-3 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          EWS
                        </span>
                        <p className="text-lg font-bold text-red-600">
                          {ewsScore}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Default instructions */}
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Instructions
                    </span>
                    <ul className="mt-2 space-y-2">
                      {[
                        "Continuous telemetry monitoring",
                        "O2 titrate to SpO2 > 94%",
                        "NPO status",
                        "Prepare for possible intubation",
                      ].map((inst, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nurse-added instructions */}
                  {nurseInstructions.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Nurse-Added Instructions
                      </span>
                      <ul className="mt-2 space-y-2">
                        {nurseInstructions.map((inst, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-2 text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {inst}
                            </div>
                            <button
                              onClick={() => removeInstruction(i)}
                              className="text-slate-400 hover:text-red-500 shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add instruction input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add nurse instruction..."
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInstruction()}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      onClick={addInstruction}
                      disabled={!newInstruction.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="p-4 bg-white border-t border-slate-200 mt-auto">
              <Button
                className="w-full bg-slate-700 hover:bg-slate-800 text-white h-11"
                onClick={handleClose}
              >
                Close Protocol View
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
