"use client";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatientStore, Patient, getAiTriageStatus, getEwsColorStyles, formatStatus } from "@/store/patient-store";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  Search,
  Filter,
  Settings,
  Activity,
  Phone,
  Clock,
  MessageSquare,
  AlertCircle,
  FileText,
  User,
  History as HistoryIcon,
  Pencil,
  Users,
  Calculator,
  BarChart3,
  Siren,
  ArrowRightLeft,
  ShieldCheck,
  Brain,
  Monitor,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { AcknowledgeSheet } from "@/components/actions/acknowledge-sheet";
import { TransferModal } from "@/components/actions/transfer-modal";
import { ConditionModal } from "@/components/actions/condition-modal";
import { AssignmentModal } from "@/components/actions/assignment-modal";
import { SparkLine } from "@/components/ui/sparkline";
import { VitalsHistoryModal } from "@/components/vitals-history-modal";

const formatRelativeTime = (timestamp?: string) => {
  if (!timestamp) return "";
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return "Just now";
};

const formatDateTime = (timestamp?: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function PatientTable() {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    openPhrTab,
    acknowledgeAlert,
    currentMainTab,
    setCurrentMainTab,
    activeFilter,
    getFilteredPatients,
    transferPatient,
    changeCondition,
    assignToActor,
    availableClinicians,
    currentUser,
  } = usePatientStore();

  // Context Menu State
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(
    null,
  );
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Action Sheet State
  const [actionSheetPatientId, setActionSheetPatientId] = useState<
    string | null
  >(null);
  const [transferModalPatientId, setTransferModalPatientId] = useState<
    string | null
  >(null);
  const [conditionModalPatientId, setConditionModalPatientId] = useState<
    string | null
  >(null);
  const [assignmentModalPatientId, setAssignmentModalPatientId] = useState<
    string | null
  >(null);
  const [vitalsModalPatientId, setVitalsModalPatientId] = useState<string | null>(null);



  const handleRowClick = (e: React.MouseEvent, id: string) => {
    // Only select if they specifically clicked the checkbox or if it's not a context menu interaction
    // Since we're changing this to open a menu on click, we'll stop the selection toggle here
    // But keep standard selection logic isolated

    // Instead of selecting, open context menu where clicked:
    setContextMenuOpenId(contextMenuOpenId === id ? null : id);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedPatientId(id === selectedPatientId ? null : id);
  };

  const handleViewPhr = (
    patientId: string,
    patientName: string,
    type: "encounter" | "phr" | "copilot" = "encounter",
  ) => {
    openPhrTab(patientId, patientName, type);
    setContextMenuOpenId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EMERGENCY_PROTOCOL":
      case "TIMEOUT_ESCALATION":
        return <Siren className="h-4 w-4 text-red-500 mr-2" />;
      case "URGENT_TRIAGE":
      case "NURSE_ALERTED":
      case "REFER_TO_DOCTOR":
        return <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />;
      case "AI_OUTREACH":
        return <Activity className="h-4 w-4 text-blue-500 mr-2" />;
      case "STABLE_MONITORING":
      case "RESOLVED":
        return <Check className="h-4 w-4 text-emerald-500 mr-2" />;
      default:
        return <Check className="h-4 w-4 text-slate-400 mr-2" />;
    }
  };



  const getAiTriageColorStyles = (score: number) => {
    if (score >= 9) return "text-red-700 bg-red-50 border-red-200";
    if (score >= 7) return "text-orange-700 bg-orange-50 border-orange-200";
    if (score >= 5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (score >= 3) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-white w-full h-full relative"
      onClick={() => setContextMenuOpenId(null)}
    >
      {/* Darker Header Above Table with Filters */}
      <div className="bg-[#eaf3fd] h-14 border-b border-[#dce9f8] flex items-center justify-between px-6 rounded-t-lg shrink-0 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800 text-[15px]">
              {activeFilter === "all" ? "All Patients" : 
               activeFilter === "ai_outreach" ? "AI Outreach List" :
               activeFilter === "require_action" ? "Action Required" :
               activeFilter === "in_progress" ? "In Progress cases" : "Resolved Cases"}
            </h2>
            <Search className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-700 transition" />
            {currentUser?.isSupervisor && (
              <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f62fe]">Supervisor Mode</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-slate-500 text-sm font-medium">
          {getFilteredPatients().length} records
        </div>
      </div>

      {/* Critical Alert Popup Banner */}
      {(() => {
        const criticalPatients = getFilteredPatients().filter(
          (p) =>
            p.aiTriageScore &&
            p.aiTriageScore >= 9 &&
            p.status !== "NURSE_ALERTED" &&
            p.status !== "REFER_TO_DOCTOR",
        );
        if (criticalPatients.length === 0) return null;
        return (
          <div className="bg-red-600 px-5 py-3 shrink-0 border-b border-red-700 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Siren className="h-4 w-4 text-white animate-pulse" />
              <span className="text-white font-bold text-sm">
                {criticalPatients.length} Critical Alert
                {criticalPatients.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {criticalPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionSheetPatientId(p.id);
                  }}
                  className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-red-700 rounded-lg px-3 py-1.5 text-sm font-semibold shadow-sm border border-red-300 transition-all hover:shadow-md cursor-pointer"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {p.name}
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-1.5 py-0.5 rounded">
                    {p.aiTriageScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="flex-1 overflow-auto relative">
        <Table>
          <TableHeader className="bg-[#eaf3fd] sticky top-0 z-10 shadow-sm shadow-[#eaf3fd]/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px] px-6 py-4">
                <Checkbox className="border-slate-400 bg-white data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe] rounded-sm" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                MR No
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Patient Name
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap text-center">
                EWS Score
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap text-center">
                Triage Score
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap text-center">
                Peak Triage
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Condition
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Transfer
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredPatients().map((patient: Patient) => {
              const isSelected = selectedPatientId === patient.id;
              const isMenuOpen = contextMenuOpenId === patient.id;

              return (
                <TableRow
                  key={patient.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(e, patient.id);
                  }}
                  className={`
                      border-b border-slate-100 transition-all cursor-pointer group text-[13px] text-slate-600
                      ${
                        isSelected || isMenuOpen
                          ? "bg-brand-50/50"
                          : "bg-white hover:bg-slate-50"
                      }
                  `}
                >
                  <TableCell className="px-6 py-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {
                        // Handled by onClick below to safely pass event
                      }}
                      className="border-slate-400 bg-white data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe] rounded-sm z-10 relative"
                      onClick={(e) => handleCheckboxClick(e, patient.id)}
                    />
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium whitespace-nowrap">
                    #{patient.mrn || "2024-" + patient.id.slice(0, 4)}
                  </TableCell>
                  <TableCell className="text-slate-700 whitespace-nowrap font-semibold">
                    {patient.name}{" "}
                    <span className="text-slate-400 font-normal">({patient.age}y)</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded min-w-[32px] ${getEwsColorStyles(patient.ewsScore)}`}>
                        {patient.ewsScore}
                      </div>
                      {patient.ewsLastUpdated && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatRelativeTime(patient.ewsLastUpdated)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    {patient.aiTriageScore ? (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded min-w-[32px] ${getAiTriageColorStyles(patient.aiTriageScore)}`}
                        >
                          {patient.aiTriageScore}
                        </div>
                        <div className="flex flex-col items-center leading-tight">
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {formatDateTime(patient.triageLastUpdated)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            By {patient.triageTriggeredBy || "AI"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    {patient.peakAiTriageScore ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className={`inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded min-w-[32px] ${getAiTriageColorStyles(patient.peakAiTriageScore)}`}
                          >
                            {patient.peakAiTriageScore}
                          </div>
                          {patient.peakAiTriageScore > (patient.aiTriageScore || 0) && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <div className="flex flex-col items-center leading-tight">
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {formatDateTime(patient.peakTriageLastUpdated)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            By {patient.peakTriageTriggeredBy || "AI"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border w-fit
                        ${patient.aiTriageScore && patient.aiTriageScore >= 9 ? "bg-red-50 border-red-200 text-red-700" :
                          patient.aiTriageScore && patient.aiTriageScore >= 7 ? "bg-orange-50 border-orange-200 text-orange-700" :
                          patient.aiTriageScore && patient.aiTriageScore >= 5 ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                          patient.aiTriageScore && patient.aiTriageScore >= 3 ? "bg-blue-50 border-blue-200 text-blue-700" :
                          "bg-emerald-50 border-emerald-200 text-emerald-700"}
                      `}>
                        {getAiTriageStatus(patient.aiTriageScore || 0).toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                          {patient.conditionChangedBy}
                          <span className="text-[10px] text-slate-400 font-normal">({patient.conditionChangedByRole})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(patient.conditionChangedAt)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm ${
                          patient.toActorType === "AI" ? "bg-purple-100 text-purple-600" :
                          patient.toActorType === "SYSTEM" ? "bg-slate-100 text-slate-600" :
                          patient.toActorType === "PROVIDER" ? "bg-brand-100 text-brand-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {patient.toActorType === "AI" ? <Brain className="h-4 w-4" /> :
                           patient.toActorType === "SYSTEM" ? <Monitor className="h-4 w-4" /> :
                           patient.toUser ? patient.toUser.split(" ").map(n => n[0]).join("") : 
                           patient.toActorType === "PROVIDER" ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        {patient.toUser && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>
                      
                      <div className="flex flex-col leading-tight">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-[12px] whitespace-nowrap leading-none">
                            {patient.toUser ? (
                              `${patient.toUserRole || (patient.toActorType === "PROVIDER" ? "Provider" : "Nurse")}: ${patient.toUser}`
                            ) : (
                              patient.toActorType === "AI" ? "AI Engine: Active" : 
                              patient.toActorType === "SYSTEM" ? "System: Monitoring" :
                              patient.toActorType === "PROVIDER" ? "Provider: Pending" : "Nurse: Pending"
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal italic leading-none mt-1">
                            {patient.toUser ? "Assigned Clinician" : "Awaiting Routing"}
                          </span>
                        </div>
                        <div className={`text-[9px] font-bold uppercase tracking-wider px-1 py-0 rounded w-fit mt-0.5 ${
                          patient.toActorType === "AI" ? "text-purple-600 bg-purple-50" :
                          patient.toActorType === "SYSTEM" ? "text-slate-500 bg-slate-100" :
                          patient.toActorType === "PROVIDER" ? "text-brand-700 bg-brand-50" :
                          "text-blue-700 bg-blue-50"
                        }`}>
                          {patient.toActorType}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Added empty spacer to ensure table items don't hide behind floating button */}
            <TableRow className="border-transparent hover:bg-transparent">
              <TableCell
                colSpan={8}
                className="h-16 cursor-default"
              ></TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Global Floating Context Menu */}
        {contextMenuOpenId && (
          <div
            className="fixed z-50 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[240px] p-1 border border-slate-200 shadow-xl rounded-lg bg-white overflow-hidden flex flex-col">
              {(() => {
                const patient = patients.find(
                  (p) => p.id === contextMenuOpenId,
                );
                if (!patient) return null;

                const isHumanInitiated =
                  patient.initiatedBy === "Nurse" ||
                  patient.initiatedBy === "Caregiver / Family";
                const isAlreadyHandled = [
                  "NURSE_ALERTED",
                  "REFER_TO_DOCTOR",
                  "RESOLVED",
                  "STABLE_MONITORING",
                ].includes(patient.status);
                const canAcknowledge =
                  !isAlreadyHandled &&
                  (!isHumanInitiated ||
                    patient.status === "EMERGENCY_PROTOCOL" ||
                    patient.status === "TIMEOUT_ESCALATION");

                return (
                  <>
                    {(canAcknowledge || patient.status === "AI_OUTREACH") && (
                      <div className="pb-1 mb-1 border-b border-slate-100">
                        {canAcknowledge && (
                          <div
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-[13px] text-orange-700 transition-colors rounded-md font-medium"
                            onClick={() => {
                              setActionSheetPatientId(patient.id);
                              setContextMenuOpenId(null);
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <AlertCircle className="h-4 w-4" />
                              <span>Acknowledge Alert</span>
                            </div>
                          </div>
                        )}
                        {patient.status === "AI_OUTREACH" && (
                          <div
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                            onClick={() => {
                              handleViewPhr(patient.id, patient.name, "copilot");
                              setContextMenuOpenId(null);
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <MessageSquare className="h-4 w-4 text-slate-500" />
                              <span>View Communication</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                              C
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pb-1 mb-1 border-b border-slate-100">
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-brand-50 focus:bg-brand-50 text-[13px] text-brand-700 transition-colors rounded-md font-medium"
                        onClick={() => {
                          handleViewPhr(patient.id, patient.name, "encounter");
                          setContextMenuOpenId(null);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Stethoscope className="h-4 w-4" />
                          <span>Show Patient Details</span>
                        </div>
                        <span className="text-[10px] text-brand-400 font-medium px-1 underline underline-offset-2">
                          D
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => {
                          handleViewPhr(patient.id, patient.name, "phr");
                          setContextMenuOpenId(null);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-slate-500" />
                          <span>View PHR</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium px-1 underline underline-offset-2">
                          P
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => {
                          setVitalsModalPatientId(patient.id);
                          setContextMenuOpenId(null);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <span>View Vitals History</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium px-1 underline underline-offset-2">
                          V
                        </span>
                      </div>
                    </div>

                    <div className="pb-1 mb-1 border-b border-slate-100">
                      {[
                        "Triage Scores History",
                        "EWS Scores History",
                        "Patient Condition History",
                        "Transfer History"
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                          onClick={() => setContextMenuOpenId(null)}
                        >
                          <div className="flex items-center gap-2.5">
                            <HistoryIcon className="h-4 w-4 text-slate-500" />
                            <span>{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pb-1 mb-1 border-b border-slate-100">
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => {
                          setConditionModalPatientId(patient.id);
                          setContextMenuOpenId(null);
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Pencil className="h-4 w-4 text-slate-500" />
                          <span>Change Condition</span>
                        </div>
                      </div>
                      {currentUser?.isSupervisor && (
                        <div
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                          onClick={() => {
                            setAssignmentModalPatientId(patient.id);
                            setContextMenuOpenId(null);
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                            <span>Change Assignment</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => setContextMenuOpenId(null)}
                      >
                        <div className="flex items-center gap-2.5">
                          <Calculator className="h-4 w-4 text-slate-500" />
                          <span>Calculate EWS</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium px-1 underline underline-offset-2">
                          E
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => setContextMenuOpenId(null)}
                      >
                        <div className="flex items-center gap-2.5">
                          <BarChart3 className="h-4 w-4 text-slate-500" />
                          <span>Calculate Triage Score</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium px-1 underline underline-offset-2">
                          T
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute right-4 bottom-[72px] z-20">
        <div className="bg-[#00a2ff] hover:bg-blue-500 rounded-xl h-[52px] w-[52px] shadow-lg flex items-center justify-center cursor-pointer transition-colors shadow-blue-400/30">
          <Settings className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Action Sheets */}
      <AcknowledgeSheet
        patient={patients.find((p) => p.id === actionSheetPatientId)}
        open={!!actionSheetPatientId}
        onClose={() => setActionSheetPatientId(null)}
        onConfirm={acknowledgeAlert}
      />
      <TransferModal
        patient={patients.find((p) => p.id === transferModalPatientId)}
        open={!!transferModalPatientId}
        onClose={() => setTransferModalPatientId(null)}
        onConfirm={transferPatient}
      />
      <ConditionModal
        patient={patients.find((p) => p.id === conditionModalPatientId)}
        open={!!conditionModalPatientId}
        onClose={() => setConditionModalPatientId(null)}
        onConfirm={changeCondition}
        role={currentMainTab === "doctor" ? "Doctor" : "Nurse"}
      />
      <AssignmentModal
        patient={patients.find((p) => p.id === assignmentModalPatientId)}
        open={!!assignmentModalPatientId}
        onClose={() => setAssignmentModalPatientId(null)}
        onConfirm={assignToActor}
        clinicians={availableClinicians}
      />
      <VitalsHistoryModal
        patient={patients.find((p) => p.id === vitalsModalPatientId) || null}
        isOpen={!!vitalsModalPatientId}
        onClose={() => setVitalsModalPatientId(null)}
      />
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 text-sm text-slate-500 w-full shrink-0">
        <div className="flex items-center gap-3">
          <span>Version 1.124</span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-700">Make Master Tab</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span>Rows per page: 30</span>
          <span className="font-medium text-slate-700">1 - 30 of 30</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
