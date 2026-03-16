"use client";

import { Patient } from "@/store/patient-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, History, CheckCircle2, ArrowRightLeft } from "lucide-react";

interface TransferModalProps {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm: (patientId: string, targetTab: "needs_action" | "in_progress" | "resolved") => void;
}

export function TransferModal({ patient, open, onClose, onConfirm }: TransferModalProps) {
  if (!patient) return null;

  const options = [
    {
      id: "needs_action",
      label: "Required Action",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      description: "Transfer patient to the urgent action queue.",
      color: "hover:bg-red-50 hover:border-red-200 text-red-700",
    },
    {
      id: "in_progress",
      label: "In Progress",
      icon: <History className="h-5 w-5 text-orange-500" />,
      description: "Mark patient as currently being handled by staff.",
      color: "hover:bg-orange-50 hover:border-orange-200 text-orange-700",
    },
    {
      id: "resolved",
      label: "Resolved",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      description: "Complete the encounter and move to stabilized monitoring.",
      color: "hover:bg-emerald-50 hover:border-emerald-200 text-emerald-700",
    },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader className="px-6 py-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-brand-100 p-2 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Transfer Patient</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Choose the target queue for {patient.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onConfirm(patient.id, option.id);
                onClose();
              }}
              className={`flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white transition-all text-left group shadow-sm ${option.color}`}
            >
              <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-white transition-colors">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[15px]">{option.label}</div>
                <div className="text-slate-500 text-[13px] font-medium leading-tight mt-0.5">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-bold"
          >
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
