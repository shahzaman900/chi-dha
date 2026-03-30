"use client";

import * as React from "react";
import { Patient, Clinician, ActorType } from "@/store/patient-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, ShieldCheck, User, Brain, Monitor, Stethoscope } from "lucide-react";

interface AssignmentModalProps {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm: (patientId: string, actorType: ActorType, clinicianId?: string) => void;
  clinicians: Clinician[];
}

export function AssignmentModal({ patient, open, onClose, onConfirm, clinicians }: AssignmentModalProps) {
  const [selectedActor, setSelectedActor] = React.useState<ActorType>("NURSE");
  const [selectedClinicianId, setSelectedClinicianId] = React.useState<string>("");

  if (!patient) return null;

  const filteredClinicians = clinicians.filter((c) => {
    if (selectedActor === "PROVIDER") return c.role === "Doctor";
    if (selectedActor === "NURSE") return c.role === "Nurse";
    return false;
  });

  const handleConfirm = () => {
    onConfirm(patient.id, selectedActor, selectedClinicianId || undefined);
    onClose();
  };

  const actorOptions = [
    { value: "PROVIDER", label: "Provider", icon: <Stethoscope className="h-4 w-4" /> },
    { value: "NURSE", label: "Nurse", icon: <User className="h-4 w-4" /> },
    { value: "AI", label: "AI Engine", icon: <Brain className="h-4 w-4" /> },
    { value: "SYSTEM", label: "System (Auto)", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="px-6 py-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-brand-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Change Assignment</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Route {patient.name} to the appropriate actor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="actor" className="text-sm font-bold text-slate-700">Assign to</Label>
            <Select 
              value={selectedActor} 
              onValueChange={(val) => {
                setSelectedActor(val as ActorType);
                setSelectedClinicianId(""); // Reset clinician when actor changes
              }}
            >
              <SelectTrigger id="actor" className="w-full h-11 bg-white border-slate-200">
                <SelectValue placeholder="Select actor type" />
              </SelectTrigger>
              <SelectContent>
                {actorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedActor === "PROVIDER" || selectedActor === "NURSE") && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="clinician" className="text-sm font-bold text-slate-700">
                Select {selectedActor === "PROVIDER" ? "Doctor" : "Nurse"}
              </Label>
              <Select value={selectedClinicianId} onValueChange={setSelectedClinicianId}>
                <SelectTrigger id="clinician" className="w-full h-11 bg-white border-slate-200">
                  <SelectValue placeholder={`Select a ${selectedActor === "PROVIDER" ? "doctor" : "nurse"}`} />
                </SelectTrigger>
                <SelectContent>
                  {filteredClinicians.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2">
                            <span>{c.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                c.status === "Available" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                            }`}>
                                {c.status}
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                          {c.workload} active
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#0f62fe] hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-md"
            disabled={(selectedActor === "PROVIDER" || selectedActor === "NURSE") && !selectedClinicianId}
          >
            Confirm Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
