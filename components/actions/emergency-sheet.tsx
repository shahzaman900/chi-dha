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
  const [newInstruction, setNewInstruction] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newOrder, setNewOrder] = useState("");

  const [transportActions, setTransportActions] = useState([
    "Ambulance Unit 3 en route",
    "Paramedic team alerted",
    "Rapid Response Team mobilized",
    "Attending physician paged",
  ]);
  const [standingOrders, setStandingOrders] = useState([
    "12-lead ECG on arrival",
    "Troponin + BNP stat",
    "Crash cart standby",
    "IV access x2 large bore",
  ]);
  const [instructions, setInstructions] = useState([
    "Continuous telemetry monitoring",
    "O2 titrate to SpO2 > 94%",
    "NPO status",
    "Prepare for possible intubation",
  ]);

  if (!patient) return null;

  const handleClose = () => {
    onClose();
    setDispatchRrt(true);
    setDispatchPhysician(true);
    setNewInstruction("");
    setNewAction("");
    setNewOrder("");
  };

  const handleDispatch = () => {
    onConfirm(patient.id, dispatchRrt, dispatchPhysician);
    handleClose();
  };

  const addToList = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (trimmed) {
      setter((prev) => [...prev, trimmed]);
      inputSetter("");
    }
  };

  const removeFromList = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="sm:max-w-[700px] w-full p-0 bg-slate-50 border-l-red-500 border-l-[6px] flex flex-col h-full overflow-hidden"
      >
        {/* Fixed header */}
        <SheetHeader className="px-6 py-4 bg-red-600 border-b border-red-700 text-white shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Siren className="h-6 w-6 text-white animate-pulse" />
            <SheetTitle className="text-xl text-white">
              Emergency Protocol
            </SheetTitle>
          </div>
          <SheetDescription className="text-red-100 font-medium">
            Code Blue / Rapid Response for {patient.name}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {/* Patient Info */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-red-900">
                {patient.name}
              </h3>
              <p className="text-red-700 text-sm font-medium">
                {patient.age}y &bull; MRN:{" "}
                {patient.mrn || patient.id.padStart(6, "0")}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border-2 border-red-300 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Location
              </p>
              <p className="text-base font-black text-slate-900">
                G 7 Islamabad
              </p>
            </div>
          </div>

          {/* Dispatch Options */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-red-600" /> Dispatch
                Options
              </h3>
            </div>
            <div className="p-4 space-y-2.5">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-red-300 transition-colors">
                <Checkbox
                  checked={dispatchRrt}
                  onCheckedChange={(c) => setDispatchRrt(!!c)}
                  className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    Deploy Rapid Response Team
                  </p>
                  <p className="text-xs text-slate-500">
                    Critical care team to Room 402B
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-red-300 transition-colors">
                <Checkbox
                  checked={dispatchPhysician}
                  onCheckedChange={(c) => setDispatchPhysician(!!c)}
                  className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    Alert On-Call Attending
                  </p>
                  <p className="text-xs text-slate-500">
                    Priority SMS to Dr. Smith
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* ER Transport */}
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2.5 border-b border-red-200 flex items-center justify-between">
              <h3 className="font-bold text-red-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <Ambulance className="h-3.5 w-3.5" /> Immediate ER Transport
              </h3>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                  Dispatched
                </Badge>
                <span className="text-sm font-bold text-red-600">
                  ETA 8 min
                </span>
              </div>
            </div>
            <div className="p-4">
              <EditableList
                label="Actions Taken"
                items={transportActions}
                color="red"
                placeholder="Add action..."
                inputValue={newAction}
                onInputChange={setNewAction}
                onAdd={() =>
                  addToList(newAction, setTransportActions, setNewAction)
                }
                onRemove={(i) => removeFromList(i, setTransportActions)}
              />
            </div>
          </div>

          {/* ER Triage */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200">
              <h3 className="font-bold text-amber-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <Hospital className="h-3.5 w-3.5" /> ER Triage Notification
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Hospital
                  </span>
                  <p className="text-sm text-slate-800 font-semibold">
                    Dubai General Hospital — ER Bay 3
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Protocol
                  </span>
                  <p className="text-sm text-red-700 font-bold">
                    Code Blue — Cardiac Alert
                  </p>
                </div>
              </div>
              <EditableList
                label="Standing Orders"
                items={standingOrders}
                color="amber"
                placeholder="Add standing order..."
                inputValue={newOrder}
                onInputChange={setNewOrder}
                onAdd={() =>
                  addToList(newOrder, setStandingOrders, setNewOrder)
                }
                onRemove={(i) => removeFromList(i, setStandingOrders)}
              />
            </div>
          </div>

          {/* Clinical Handoff */}
          <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-200">
              <h3 className="font-bold text-blue-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <HeartPulse className="h-3.5 w-3.5" /> Clinical Handoff Data
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-50 rounded-lg border p-2 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">
                    HR
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {patient.vitalsTrend?.hr?.slice(-1)[0] || "—"}{" "}
                    <span className="text-[10px] font-normal text-slate-500">
                      bpm
                    </span>
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg border p-2 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">
                    SpO2
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {patient.vitalsTrend?.spo2?.slice(-1)[0] || "—"}
                    <span className="text-[10px] font-normal text-slate-500">
                      %
                    </span>
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg border p-2 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">
                    BP
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {patient.vitalsTrend?.bp?.slice(-1)[0] || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg border p-2 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">
                    EWS
                  </span>
                  <p className="text-sm font-bold text-red-600">
                    {patient.ewsScore ?? "—"}
                  </p>
                </div>
              </div>
              <EditableList
                label="Instructions"
                items={instructions}
                color="blue"
                placeholder="Add instruction..."
                inputValue={newInstruction}
                onInputChange={setNewInstruction}
                onAdd={() =>
                  addToList(newInstruction, setInstructions, setNewInstruction)
                }
                onRemove={(i) => removeFromList(i, setInstructions)}
              />
            </div>
          </div>
        </div>

        {/* Fixed bottom */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg h-11 flex items-center gap-2"
            onClick={handleDispatch}
          >
            <Siren className="h-5 w-5" />
            Dispatch Emergency
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Reusable editable list ── */

const colorMap: Record<
  string,
  { dot: string; border: string; text: string; bg: string }
> = {
  red: {
    dot: "bg-red-500",
    border: "border-red-300",
    text: "text-red-600",
    bg: "hover:bg-red-50",
  },
  amber: {
    dot: "bg-amber-500",
    border: "border-amber-300",
    text: "text-amber-600",
    bg: "hover:bg-amber-50",
  },
  blue: {
    dot: "bg-blue-500",
    border: "border-blue-300",
    text: "text-blue-600",
    bg: "hover:bg-blue-50",
  },
};

function EditableList({
  label,
  items,
  color,
  placeholder,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  color: "red" | "amber" | "blue";
  placeholder: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  const c = colorMap[color];
  return (
    <div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}
      >
        {label}
      </span>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 text-sm text-slate-700 group px-2 py-1 rounded-md hover:bg-slate-50"
          >
            <div className="flex items-start gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${c.dot} mt-1.5 shrink-0`}
              />
              {item}
            </div>
            <button
              onClick={() => onRemove(i)}
              className="text-slate-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          className="text-sm h-7"
        />
        <Button
          size="sm"
          variant="outline"
          className={`shrink-0 h-7 ${c.border} ${c.text} ${c.bg}`}
          onClick={onAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
