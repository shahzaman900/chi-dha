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
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface EmergencySheetProps {
  patient: Patient | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm: (
    patientId: string,
    dispatchData: {
      dispatchRrt: boolean;
      dispatchPhysician: boolean;
      transportActions: string[];
      standingOrders: string[];
      instructions: string[];
      hospitalName: string;
      protocol: string;
      eta: string;
    }
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

  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [recentVitals, setRecentVitals] = useState<any>(null);

  useEffect(() => {
    if (open && patient?.id) {
      fetch(`http://localhost:3001/patients/${patient.id}/emergency-protocol-data`)
        .then((res) => res.json())
        .then((data) => {
          setPatientInfo(data.patient);
          setRecentVitals(data.recentVitals);
          if (data.currentProtocol) {
            if (data.currentProtocol.instructions) setInstructions(data.currentProtocol.instructions);
            if (data.currentProtocol.standingOrders) setStandingOrders(data.currentProtocol.standingOrders);
            if (data.currentProtocol.actionsTaken) setTransportActions(data.currentProtocol.actionsTaken);
            if (data.currentProtocol.protocol) setProtocol(data.currentProtocol.protocol);
            if (data.currentProtocol.eta) setEta(data.currentProtocol.eta.toString());
          }
        })
        .catch(console.error);
    }
  }, [open, patient?.id]);

  const [location, setLocation] = useState("G 7 Islamabad");
  const [room, setRoom] = useState("Room 402B");
  const [doctor, setDoctor] = useState("Dr. Smith");
  const [eta, setEta] = useState("8");
  const [protocol, setProtocol] = useState("CODE_BLUE_CARDIAC_ALERT");

  // Sync hospital once loaded
  useEffect(() => {
    if (patientInfo?.hospitalName) {
       setLocation(patientInfo.hospitalName);
    }
  }, [patientInfo?.hospitalName]);

  // Ensure hooks are called before this guard to comply with Rule of Hooks
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
    onConfirm(patient.id, {
      dispatchRrt,
      dispatchPhysician,
      transportActions,
      standingOrders,
      instructions,
      hospitalName: location,
      protocol: protocol,
      eta: eta
    });
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
              <h3 className="font-bold text-lg text-red-900">{patient.name}</h3>
              <p className="text-red-700 text-sm font-medium">
                {patient.age}y &bull; MRN:{" "}
                {patient.mrn || patient.id.padStart(6, "0")}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border-2 border-red-300 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Location
              </p>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-6 text-base font-black text-slate-900 border-none px-0 text-center bg-transparent w-full shadow-none focus-visible:ring-0 placeholder:text-slate-400"
              />
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
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    Critical care team to <Input value={room} onChange={e => setRoom(e.target.value)} className="h-4 p-0 m-0 w-20 text-xs border-b border-t-0 border-x-0 border-dashed border-slate-300 rounded-none bg-transparent shadow-none focus-visible:ring-0 text-slate-500" />
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
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    Priority SMS to <Input value={doctor} onChange={e => setDoctor(e.target.value)} className="h-4 p-0 m-0 w-20 text-xs border-b border-t-0 border-x-0 border-dashed border-slate-300 rounded-none bg-transparent shadow-none focus-visible:ring-0 text-slate-500" />
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
                <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                  ETA <Input value={eta} onChange={e => setEta(e.target.value)} className="h-5 p-0 m-0 w-6 text-sm font-bold border-b border-t-0 border-x-0 border-red-300 rounded-none bg-transparent shadow-none focus-visible:ring-0 text-red-600 text-center" /> min
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
                    {patientInfo?.hospitalName || "Dubai General Hospital — ER Bay 3"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Protocol
                  </span>
                  <select 
                    value={protocol} 
                    onChange={e => setProtocol(e.target.value)}
                    className="text-sm font-bold bg-transparent border-none text-red-700 outline-none cursor-pointer pl-0 focus:ring-0"
                  >
                    <option value="CODE_BLUE_CARDIAC_ALERT">Code Blue — Cardiac Alert</option>
                    <option value="RAPID_RESPONSE">Rapid Response</option>
                    <option value="STROKE_ALERT">Stroke Alert</option>
                    <option value="TRAUMA_ACTIVATION">Trauma Activation</option>
                    <option value="SEPSIS_ALERT">Sepsis Alert</option>
                  </select>
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
                    {recentVitals?.heartRate || patient.vitalsTrend?.hr?.slice(-1)[0] || "—"}{" "}
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
                    {recentVitals?.spO2 || patient.vitalsTrend?.spo2?.slice(-1)[0] || "—"}
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
                    {recentVitals ? `${recentVitals.systolic}/${recentVitals.diastolic}` : (patient.vitalsTrend?.bp?.slice(-1)[0] || "—")}
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
