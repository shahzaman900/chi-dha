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
import { usePatientStore, Patient } from "@/store/patient-store";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Siren,
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
} from "lucide-react";
import { useState } from "react";
import { AcknowledgeSheet } from "@/components/actions/acknowledge-sheet";
import { SparkLine } from "@/components/ui/sparkline";

export function PatientTable() {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    openPhrTab,
    acknowledgeAlert,
    currentMainTab,
    setCurrentMainTab,
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

  // Filtering State
  const [activeFilter, setActiveFilter] = useState<
    "all" | "needs_action" | "in_progress" | "resolved"
  >("all");

  const getFilteredPatients = () => {
    let filtered = [...patients];

    if (activeFilter === "needs_action") {
      filtered = filtered.filter((p) =>
        [
          "Emergency Protocol",
          "Timeout Escalation",
          "Urgent Triage",
          "AI Outreach",
        ].includes(p.status),
      );
    } else if (activeFilter === "in_progress") {
      filtered = filtered.filter((p) =>
        ["Nurse Alerted", "Refer to Doctor"].includes(p.status),
      );
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((p) =>
        ["Resolved", "Stable / Monitoring"].includes(p.status),
      );
    }

    return filtered.sort(
      (a, b) => (b.aiTriageScore || 0) - (a.aiTriageScore || 0),
    );
  };

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
    type: "encounter" | "phr" = "encounter",
  ) => {
    openPhrTab(patientId, patientName, type);
    setContextMenuOpenId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Emergency Protocol":
      case "Timeout Escalation":
        return <Siren className="h-4 w-4 text-red-500 mr-2" />;
      case "Urgent Triage":
      case "Nurse Alerted":
      case "Refer to Doctor":
        return <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />;
      case "AI Outreach":
        return <Activity className="h-4 w-4 text-blue-500 mr-2" />;
      case "Stable / Monitoring":
      case "Resolved":
        return <Check className="h-4 w-4 text-emerald-500 mr-2" />;
      default:
        return <Check className="h-4 w-4 text-slate-400 mr-2" />;
    }
  };

  const getAiTriageStatus = (score: number) => {
    if (score >= 9) return "critical";
    if (score >= 7) return "high risk";
    if (score >= 5) return "medium risk";
    return "stable";
  };

  const getAiTriageColorStyles = (score: number) => {
    if (score >= 9) return "text-red-700 bg-red-50 border-red-200";
    if (score >= 7) return "text-orange-700 bg-orange-50 border-orange-200";
    if (score >= 5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
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
            <h2 className="font-bold text-slate-800 text-[15px]">EWS List</h2>
            <Search className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-700 transition" />
          </div>

          <div className="h-8 flex items-center bg-white/60 border border-brand-100 rounded-md p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter("all");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === "all" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              All
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter("needs_action");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 ${activeFilter === "needs_action" ? "bg-red-50 text-red-700 shadow-sm border border-red-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Requires Action
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter("in_progress");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === "in_progress" ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              In Progress
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveFilter("resolved");
              }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === "resolved" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              Resolved / Stable
            </button>
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
            p.status !== "Nurse Alerted" &&
            p.status !== "Refer to Doctor",
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
                Patient
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                AI Triage score{" "}
                <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Status{" "}
                <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                EWS Score
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Vitals Trend
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                AI Engagement{" "}
                <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Initiated By{" "}
                <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">
                Escalated By{" "}
                <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" />
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
                  <TableCell className="text-slate-700 whitespace-nowrap">
                    {patient.name}{" "}
                    <span className="text-slate-400">({patient.age}y)</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {patient.aiTriageScore ? (
                      patient.aiTriageScore >= 9 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionSheetPatientId(patient.id);
                          }}
                          className="inline-flex items-center gap-1.5 font-bold border px-2.5 py-1 rounded-lg bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer animate-pulse"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {patient.aiTriageScore} (
                          {getAiTriageStatus(patient.aiTriageScore)})
                        </button>
                      ) : (
                        <div
                          className={`inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded ${getAiTriageColorStyles(patient.aiTriageScore)}`}
                        >
                          {patient.aiTriageScore} (
                          {getAiTriageStatus(patient.aiTriageScore)})
                        </div>
                      )
                    ) : (
                      <div className="inline-flex items-center justify-center font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        -
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center text-slate-700">
                      {getStatusIcon(patient.status)}
                      <span
                        className={
                          ["Emergency Protocol", "Timeout Escalation"].includes(
                            patient.status,
                          )
                            ? "text-red-500 font-medium"
                            : [
                                  "Urgent Triage",
                                  "Nurse Alerted",
                                  "Refer to Doctor",
                                ].includes(patient.status)
                              ? "text-orange-500 font-medium"
                              : patient.status === "AI Outreach"
                                ? "text-blue-500 font-medium"
                                : "text-emerald-500 font-medium"
                        }
                      >
                        {patient.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="inline-flex items-center justify-center font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {patient.ewsScore}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {patient.vitalsTrend ? (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <SparkLine
                            data={patient.vitalsTrend.hr}
                            width={64}
                            height={24}
                            color="#ef4444"
                            fillColor="#ef4444"
                          />
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            HR
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <SparkLine
                            data={patient.vitalsTrend.spo2}
                            width={64}
                            height={24}
                            color="#3b82f6"
                            fillColor="#3b82f6"
                          />
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                            SpO₂
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {patient.aiEngagement ? (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          patient.aiEngagement.includes("Call")
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : patient.aiEngagement.includes("Text")
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                        } border`}
                      >
                        {patient.aiEngagement.includes("Call") ? (
                          <Phone className="h-3 w-3" />
                        ) : patient.aiEngagement.includes("Text") ? (
                          <MessageSquare className="h-3 w-3" />
                        ) : null}
                        <span
                          className={
                            patient.aiEngagement.includes("In Progress") ||
                            patient.aiEngagement.includes("Active") ||
                            patient.aiEngagement.includes("Awaiting")
                              ? "animate-pulse"
                              : ""
                          }
                        >
                          {patient.aiEngagement}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">
                    {patient.initiatedBy || "-"}
                  </TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">
                    {patient.escalatedBy ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium border border-red-200 bg-red-50 text-red-600">
                        {patient.escalatedBy}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Added empty spacer to ensure table items don't hide behind floating button */}
            <TableRow className="border-transparent hover:bg-transparent">
              <TableCell
                colSpan={7}
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
                  "Nurse Alerted",
                  "Refer to Doctor",
                  "Resolved",
                  "Stable / Monitoring",
                ].includes(patient.status);
                const canAcknowledge =
                  !isAlreadyHandled &&
                  (!isHumanInitiated ||
                    patient.status === "Emergency Protocol" ||
                    patient.status === "Timeout Escalation");

                return (
                  <>
                    {canAcknowledge && (
                      <div className="pb-1 mb-1 border-b border-slate-100">
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
                      </div>
                    )}
                    <div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() =>
                          handleViewPhr(patient.id, patient.name, "encounter")
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <span>View Encounter</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                          E
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md mt-0.5"
                        onClick={() =>
                          handleViewPhr(patient.id, patient.name, "phr")
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span>View PHR</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                          P
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
