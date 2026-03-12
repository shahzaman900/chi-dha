"use client";

import { usePatientStore, SoapNote } from "@/store/patient-store";
import {
  Phone,
  AlertTriangle,
  Stethoscope,
  Activity,
  FileText,
  Send,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { EscalateSheet } from "@/components/actions/escalate-sheet";
import { toast } from "sonner";
import copilotData from "@/data/ai-copilot-mock.json";

// --- Type Definitions for imported data ---
interface TranscriptMessage {
  speaker: "ai" | "patient";
  text: string;
}

interface SuggestedQuestion {
  text: string;
  tags: string[];
}

interface DdxItem {
  name: string;
  probability: number;
  color: string;
  isPrimary: boolean;
  reasoning: string;
}

// --- Color mapping for DDx items ---
const ddxColorMap: Record<
  string,
  {
    border: string;
    leftBar: string;
    title: string;
    value: string;
    progress: string;
    borderHover: string;
  }
> = {
  amber: {
    border: "border-amber-400 border-[2px]",
    leftBar: "bg-amber-400",
    title: "text-amber-700",
    value: "text-amber-600",
    progress: "bg-amber-400",
    borderHover: "",
  },
  blue: {
    border: "border-slate-200",
    leftBar: "bg-blue-400",
    title: "text-blue-700",
    value: "text-blue-600",
    progress: "bg-blue-400",
    borderHover: "hover:border-blue-300",
  },
  slate: {
    border: "border-slate-200",
    leftBar: "bg-slate-300",
    title: "text-slate-700",
    value: "text-slate-500",
    progress: "bg-slate-300",
    borderHover: "hover:border-slate-300",
  },
};

export function LiveAiCopilotDashboard({ patientId }: { patientId: string }) {
  const { patients, escalateToDoctor } = usePatientStore();
  const [activeTab, setActiveTab] = useState<"sick" | "preventive">("sick");
  const [nurseInput, setNurseInput] = useState("");
  const [activeRightTab, setActiveRightTab] = useState<"ddx" | "soap">("ddx");
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const patient = patients.find((p) => p.id === patientId);

  const handleEscalate = (pId: string, dId: string, soap: SoapNote) => {
    escalateToDoctor(pId, dId, soap);
    setIsEscalateOpen(false);
    toast.success("Patient successfully referred to doctor.");
  };

  // Destructure imported data
  const transcript = copilotData.transcript as TranscriptMessage[];
  const sickQuestions = copilotData.suggestedQuestions
    .sick as SuggestedQuestion[];
  const preventiveQuestions = copilotData.suggestedQuestions
    .preventive as SuggestedQuestion[];
  const ddxItems = copilotData.differentialDiagnosis as DdxItem[];
  const predictions = copilotData.aiPredictions;
  const callDuration = copilotData.callDuration;

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [patientId]);

  if (!patient) return null;

  // Helper to find the "highlighted" prediction
  const predictionItems = [
    { label: "Emergency", value: predictions.emergency, highlighted: false },
    {
      label: "Provider Req.",
      value: predictions.providerRequired,
      highlighted: false,
    },
    {
      label: "Nurse Handle",
      value: predictions.nurseHandle,
      highlighted: true,
    },
    { label: "False Alarm", value: predictions.falseAlarm, highlighted: false },
  ];

  return (
    <div className="bg-white flex-1 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
      {/* --- TOP BAR (HUD) --- */}
      <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        {/* Patient Info */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {patient.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {patient.name}
              </h2>
              <Badge
                variant="outline"
                className="bg-rose-50 text-rose-700 border-rose-200"
              >
                {patient.aiTriageScore?.toFixed(1) ||
                  patient.ewsScore.toFixed(1)}{" "}
                High Risk
              </Badge>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {patient.aiEngagement?.includes("Text") ? "LIVE CHAT IN PROGRESS" : "LIVE CALL IN PROGRESS"}
              </div>
              {patient.isNurseActiveInCopilot && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 px-2 py-0.5 rounded-full border border-indigo-700 shadow-sm animate-in fade-in zoom-in duration-300">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  NURSE HAS TAKEN OVER
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-4 mt-0.5">
              <span>{patient.age} yrs • Male</span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> +1 (555) 019-2834
              </span>
            </p>
          </div>
        </div>

        {/* AI Confidence & Predictions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            {predictionItems.map((item) => (
              <div
                key={item.label}
                className={`flex flex-col items-center justify-center px-4 py-1.5 rounded shadow-sm min-w-[100px] ${
                  item.highlighted
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-slate-100"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${
                    item.highlighted
                      ? "text-blue-700 font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`text-lg font-bold ${
                    item.highlighted ? "text-blue-700" : "text-slate-800"
                  }`}
                >
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN BODY (3 Columns) --- */}
      <div className="flex-1 flex overflow-hidden bg-[#f4f6f8] p-4 gap-4">
        {/* COLUMN 1: Live Transcript */}
        <div className="w-[35%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity
                className={`h-4 w-4 ${patient.isNurseActiveInCopilot ? "text-indigo-600" : "text-blue-600"}`}
              />
              Live Transcript: {patient.isNurseActiveInCopilot ? "Nurse" : "AI"} &amp; Patient
            </h3>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {callDuration}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {transcript.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.speaker === "patient" ? "flex-row-reverse" : ""}`}
              >
                {msg.speaker === "ai" ? (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                    PT
                  </div>
                )}
                <div
                  className={`${
                    msg.speaker === "ai"
                      ? "bg-white border border-slate-200 rounded-2xl rounded-tl-sm text-[14px] text-slate-700 shadow-sm"
                      : "bg-blue-600 text-white rounded-2xl rounded-tr-sm text-[14px] shadow-sm"
                  } px-4 py-3 max-w-[85%]`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Input & Join Action */}
          <div className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
            {!patient.isNurseActiveInCopilot ? (
              <Button
                size="lg"
                onClick={() => usePatientStore.getState().toggleCopilotTakeover(patient.id, true)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md font-bold text-[13px] h-12 px-4 shrink-0 flex items-center gap-1.5 rounded-xl"
              >
                <AlertTriangle className="h-4 w-4" />
                {patient.aiEngagement?.includes("Text") ? "TAKE OVER CHAT" : "JOIN CALL"}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => usePatientStore.getState().toggleCopilotTakeover(patient.id, false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold text-[13px] h-12 px-4 shrink-0 flex items-center gap-1.5 rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
                HANDOFF AI
              </Button>
            )}
            <div className="relative flex-1">
              <Input
                placeholder={patient.isNurseActiveInCopilot ? "Type your message to patient..." : "Type a message to inject into AI prompt..."}
                className="pr-10 h-12 rounded-xl bg-slate-50 border-slate-300 focus-visible:ring-blue-500 text-sm"
                value={nurseInput}
                onChange={(e) => setNurseInput(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-blue-600 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Suggested Questions */}
        <div className="w-[30%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Suggested Questions
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-indigo-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto bg-slate-50/30">
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "sick" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                onClick={() => setActiveTab("sick")}
              >
                Sick Visit Questions
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "preventive" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                onClick={() => setActiveTab("preventive")}
              >
                Preventive Questions
              </button>
            </div>

            <div className="space-y-3">
              {(activeTab === "sick" ? sickQuestions : preventiveQuestions).map(
                (q, i) => (
                  <div
                    key={i}
                    className={`bg-white border text-left p-4 rounded-xl shadow-sm transition-colors cursor-pointer group ${
                      activeTab === "sick"
                        ? "border-indigo-100 hover:border-indigo-300"
                        : "border-slate-200"
                    }`}
                  >
                    <p className="text-[14px] text-slate-700 font-medium leading-snug group-hover:text-indigo-800">
                      &quot;{q.text}&quot;
                    </p>
                    {q.tags.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {q.tags.map((tag, j) => (
                          <Badge
                            key={j}
                            variant="outline"
                            className="text-[10px] text-indigo-600 bg-indigo-50 border-indigo-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: Differential Diagnosis / SOAP Note */}
        <div className="w-[35%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-14 border-b border-slate-100 flex items-center px-4 bg-white shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-lg w-full">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeRightTab === "ddx" ? "bg-white shadow text-emerald-700" : "text-slate-500 hover:text-slate-700"}`}
                onClick={() => setActiveRightTab("ddx")}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Diagnosis
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeRightTab === "soap" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                onClick={() => setActiveRightTab("soap")}
              >
                <FileText className="h-3.5 w-3.5" />
                SOAP Note
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto bg-slate-50/30">
            {activeRightTab === "ddx" ? (
              <div className="space-y-4">
                {/* Conclude Confidence */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Conclude Confidence
                    </h4>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      AI confidence to conclude assessment
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${predictions.concludeConfidence}%` }}
                      ></div>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {predictions.concludeConfidence}%
                    </span>
                  </div>
                </div>

                {ddxItems.map((item, i) => {
                  const colors = ddxColorMap[item.color] || ddxColorMap.slate;
                  return (
                    <div
                      key={i}
                      className={`bg-white ${colors.border} rounded-xl p-4 shadow-sm relative overflow-hidden ${colors.borderHover} transition-colors ${!item.isPrimary ? "opacity-80" : ""}`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.leftBar}`}
                      ></div>
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <h4
                          className={`font-bold ${colors.title} text-[15px] leading-tight pr-4`}
                        >
                          {item.name}
                        </h4>
                        <div className="flex flex-col items-end">
                          <span
                            className={`${item.isPrimary ? "text-xl" : "text-lg"} font-bold ${colors.value}`}
                          >
                            {item.probability}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                            Probability
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-[13px] ${item.isPrimary ? "text-slate-600" : "text-slate-500"} leading-relaxed pl-2 mt-2`}
                      >
                        {item.reasoning}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live SOAP Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      Live SOAP Summary
                    </h4>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse">AI GENERATING...</Badge>
                  </div>

                  {/* Subjective */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div> Subjective
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-bold text-slate-500 mb-1">Chief Complaint</div>
                      <p className="text-sm text-slate-800 font-medium">Chest pain with shortness of breath</p>
                      
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-1">HPI Elements</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[9px] text-slate-400 uppercase">Onset</div>
                          <div className="text-xs text-slate-700">Sudden, 45 mins ago</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="text-[9px] text-slate-400 uppercase">Character</div>
                          <div className="text-xs text-slate-700">Crushing, heavy</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div> Objective
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="grid grid-cols-4 gap-2">
                        {[{l: "HR", v: "112"}, {l: "SpO2", v: "94%"}, {l: "RR", v: "22"}, {l: "BP", v: "155/95"}].map(v => (
                          <div key={v.l} className="text-center bg-slate-50 py-1.5 rounded border border-slate-100">
                            <div className="text-[9px] text-slate-400 uppercase font-bold">{v.l}</div>
                            <div className="text-xs font-bold text-slate-800">{v.v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation</div>
                        <p className="text-xs text-slate-600 italic">Patient appearing diaphoretic and anxious.</p>
                      </div>
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div> Assessment
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">1. ACS / Unstable Angina</span>
                          <span className="text-[10px] font-bold text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded border border-rose-100 uppercase">High Risk</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">2. Pulmonary Embolism</span>
                          <span className="text-[10px] font-bold text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded border border-amber-100 uppercase">Consider</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div> Plan
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 shadow-sm">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-xs text-indigo-800">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></div>
                          Obtain immediate 12-lead EKG
                        </li>
                        <li className="flex items-start gap-2 text-xs text-indigo-800">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1 shrink-0"></div>
                          Administer 324mg Aspirin
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsEscalateOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Review & Escalate Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EscalateSheet 
        patient={patient}
        open={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        onConfirm={handleEscalate}
      />
    </div>
  );
}
