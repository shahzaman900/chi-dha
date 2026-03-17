"use client";

import { Patient, getAiTriageStatus } from "@/store/patient-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, History, CheckCircle2, Activity, Siren, ShieldAlert } from "lucide-react";

interface ConditionModalProps {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm: (patientId: string, newScore: number, role: "Nurse" | "Doctor") => void;
  role: "Nurse" | "Doctor";
}

export function ConditionModal({ patient, open, onClose, onConfirm, role }: ConditionModalProps) {
  if (!patient) return null;

  const currentStatus = getAiTriageStatus(patient.aiTriageScore || 0);

  const options = [
    {
      score: 9,
      label: "Critical",
      status: "critical",
      icon: <Siren className="h-5 w-5 text-red-600" />,
      description: "Immediate life-threatening risk. Requires emergency intervention.",
      color: "hover:bg-red-50 hover:border-red-200 text-red-700",
      roleRequired: "Any"
    },
    {
      score: 7,
      label: "High Risk",
      status: "high risk",
      icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
      description: "Severe physiological disturbance. Frequent monitoring required.",
      color: "hover:bg-orange-50 hover:border-orange-200 text-orange-700",
      roleRequired: "Any"
    },
    {
      score: 5,
      label: "Medium Risk",
      status: "medium risk",
      icon: <History className="h-5 w-5 text-yellow-600" />,
      description: "Moderate risk. Increased clinical vigilance required.",
      color: "hover:bg-yellow-50 hover:border-yellow-200 text-yellow-700",
      roleRequired: "Any"
    },
    {
      score: 3,
      label: "Low Risk",
      status: "low risk",
      icon: <Activity className="h-5 w-5 text-blue-600" />,
      description: "Minor risk. Standard observation protocol.",
      color: "hover:bg-blue-50 hover:border-blue-200 text-blue-700",
      roleRequired: "Any"
    },
    {
      score: 0,
      label: "Stable",
      status: "stable",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      description: "Patient is physiologically stable. Standard monitoring.",
      color: "hover:bg-emerald-50 hover:border-emerald-200 text-emerald-700",
      roleRequired: "Doctor" // Only doctor can downgrade from Critical to Stable directly
    },
  ] as const;

  const isOptionDisabled = (optionStatus: string) => {
    // Clinical Rule: Nurses cannot downgrade CRITICAL to STABLE directly.
    if (role === "Nurse" && currentStatus === "critical" && optionStatus === "stable") {
      return true;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="px-6 py-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-brand-100 p-2 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Change Patient Condition</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Updating status for {patient.name} as {role}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-3">
          {options.map((option) => {
            const disabled = isOptionDisabled(option.status);
            const isCurrent = currentStatus === option.status;

            return (
              <button
                key={option.score}
                disabled={disabled || isCurrent}
                onClick={() => {
                  onConfirm(patient.id, option.score, role);
                  onClose();
                }}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border transition-all text-left group shadow-sm
                  ${isCurrent ? "border-slate-300 bg-slate-50 opacity-80 cursor-default" : 
                    disabled ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed" : 
                    `border-slate-200 bg-white ${option.color}`}
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${isCurrent ? "bg-slate-200" : "bg-slate-50 group-hover:bg-white"}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-[15px]">{option.label}</div>
                    {isCurrent && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                    {disabled && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1"><ShieldAlert className="h-2.5 w-2.5"/> MD Only</span>}
                  </div>
                  <div className="text-slate-500 text-[13px] font-medium leading-tight mt-0.5">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-bold"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
