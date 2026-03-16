"use client";

import { TimelineEvent } from "@/store/patient-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Ambulance,
  Hospital,
  HeartPulse,
  Stethoscope,
  Bot,
  User,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface EventDetailModalProps {
  event: TimelineEvent | null;
  open: boolean;
  onClose: () => void;
}

export function EventDetailModal({
  event,
  open,
  onClose,
}: EventDetailModalProps) {
  if (!event || !event.details) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] p-0 border-border bg-white overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {event.detailType === "ai-assessment" && (
              <>
                <Bot className="h-5 w-5 text-blue-600" /> AI Assessment Details
              </>
            )}
            {event.detailType === "emergency-protocol" && (
              <>
                <Ambulance className="h-5 w-5 text-red-600" /> Emergency
                Protocol Details
              </>
            )}
            {event.detailType === "escalation" && (
              <>
                <Stethoscope className="h-5 w-5 text-indigo-600" /> Escalation
                Details
              </>
            )}
            {event.detailType === "resolution" && (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Resolution
                Details
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">{event.time}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {event.detailType === "ai-assessment" && (
            <AiAssessmentView details={event.details} />
          )}
          {event.detailType === "emergency-protocol" && (
            <EmergencyProtocolView details={event.details} />
          )}
          {event.detailType === "escalation" && (
            <EscalationView details={event.details} />
          )}
          {event.detailType === "resolution" && (
            <ResolutionView details={event.details} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AiAssessmentView({
  details,
}: {
  details: NonNullable<TimelineEvent["details"]>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Initial DDx */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
          <h3 className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4" /> Initial Differential Diagnosis
          </h3>
          <p className="text-xs text-amber-600 mt-0.5">Pre-Q&A probabilities</p>
        </div>
        <div className="p-4 space-y-4">
          {details.initialDiagnosis?.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {d.name}
                </span>
                <span className="text-sm font-bold text-amber-600">
                  {d.probability}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${d.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Bot className="h-4 w-4" /> CHI Agent Transcript
          </h3>
          <p className="text-xs text-blue-600 mt-0.5">
            AI ↔ Patient conversation
          </p>
        </div>
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {details.transcript?.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.speaker === "System" ? "" : "flex-row-reverse"}`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.speaker === "System" ? "bg-blue-100" : "bg-slate-200"
                }`}
              >
                {msg.speaker === "System" ? (
                  <Bot className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <User className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.speaker === "System"
                    ? "bg-blue-50 text-blue-900 border border-blue-100"
                    : "bg-slate-100 text-slate-800 border border-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Updated DDx */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
          <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4" /> Updated Differential Diagnosis
          </h3>
          <p className="text-xs text-red-600 mt-0.5">Post-Q&A probabilities</p>
        </div>
        <div className="p-4 space-y-4">
          {details.updatedDiagnosis?.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {d.name}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {d.probability}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all"
                  style={{ width: `${d.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmergencyProtocolView({
  details,
}: {
  details: NonNullable<TimelineEvent["details"]>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Transport */}
      <div className="border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
          <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Ambulance className="h-4 w-4" /> Immediate ER Transport
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Status</span>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {details.transport?.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">ETA</span>
            <span className="text-sm font-bold text-red-700">
              {details.transport?.eta}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actions Taken
            </span>
            <ul className="mt-2 space-y-2">
              {details.transport?.actions.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ER Notification */}
      <div className="border border-orange-200 rounded-xl overflow-hidden">
        <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
          <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Hospital className="h-4 w-4" /> ER Triage Notification
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hospital
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {details.erNotification?.hospital}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Protocol
            </span>
            <p className="text-sm font-bold text-red-700 mt-1">
              {details.erNotification?.protocol}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Standing Orders
            </span>
            <ul className="mt-2 space-y-2">
              {details.erNotification?.orders.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Clinical Handoff */}
      <div className="border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <HeartPulse className="h-4 w-4" /> Clinical Handoff Data
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Vitals
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {details.handoff?.vitals &&
                Object.entries(details.handoff.vitals).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center"
                  >
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      {key}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {val}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Instructions
            </span>
            <ul className="mt-2 space-y-2">
              {details.handoff?.instructions.map((inst, i) => (
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
        </div>
      </div>
    </div>
  );
}

function EscalationView({
  details,
}: {
  details: NonNullable<TimelineEvent["details"]>;
}) {
  const soap = details.soapNote;

  if (!soap) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-indigo-200 rounded-xl overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200">
            <h3 className="font-bold text-indigo-800 text-sm uppercase tracking-wide flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Escalation Details
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Physician
              </span>
              <p className="text-lg font-bold text-indigo-700 mt-1">
                {details.doctor}
              </p>
            </div>
            {details.assessment && (
              <div className="border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assessment
                </span>
                <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {details.assessment}
                </p>
              </div>
            )}
            {details.recommendation && (
              <div className="border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommendation
                </span>
                <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {details.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Target Physician</div>
            <div className="text-lg font-bold text-indigo-800 leading-tight">{details.doctor}</div>
          </div>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Clinical Escalation</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjective */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 text-sm">Subjective</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chief Complaint</span>
              <p className="text-sm text-slate-700 mt-1 font-medium">{soap.subjective?.chiefComplaint || "—"}</p>
            </div>
            {soap.subjective?.hpi?.details && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HPI Details</span>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{soap.subjective.hpi.details}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical History</span>
                <div className="mt-1 space-y-1">
                  {soap.subjective?.pastMedicalHistory?.map((h, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">{h.condition}</div>
                  )) || <div className="text-xs text-slate-400 italic">None reported</div>}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Meds</span>
                <div className="mt-1 space-y-1">
                  {soap.subjective?.medications?.map((m, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">{m.name}</div>
                  )) || <div className="text-xs text-slate-400 italic">None reported</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objective */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 text-sm">Objective</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Temp", val: soap.objective?.vitals?.temp, unit: "°F" },
                { label: "HR", val: soap.objective?.vitals?.hr, unit: "bpm" },
                { label: "RR", val: soap.objective?.vitals?.rr, unit: "rpm" },
                { label: "SpO2", val: soap.objective?.vitals?.spo2, unit: "%" }
              ].map(v => (
                <div key={v.label} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">{v.label}</div>
                  <div className="text-sm font-bold text-slate-800">{v.val || "—"}{v.val && v.unit}</div>
                </div>
              ))}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Exam</span>
              <p className="text-xs text-slate-600 mt-1 border-l-2 border-slate-100 pl-3 leading-relaxed">
                {soap.objective?.physicalExam?.examDetails || soap.objective?.comments || "No findings recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 text-sm">Assessment</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {soap.assessment?.differentialDiagnosis?.map((d, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">{d.diagnosis}</span>
                      <span className="text-xs font-bold text-indigo-600">{d.likelihood}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${d.likelihood}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || <div className="text-xs text-slate-400 italic">No DDx provided.</div>}
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
            <Bot className="h-4 w-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 text-sm">Plan</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Immediate Actions</span>
              <p className="text-xs text-slate-700 mt-1 font-medium bg-blue-50/50 p-2 rounded border border-blue-100/50">
                {soap.plan?.immediateActions || "No immediate actions specified."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow Up</span>
                <p className="text-xs text-slate-600 mt-1">{soap.plan?.followUp || "Routine"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referrals</span>
                <p className="text-xs text-slate-600 mt-1">{soap.plan?.referrals?.list?.length || 0} active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolutionView({
  details,
}: {
  details: NonNullable<TimelineEvent["details"]>;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border border-emerald-200 rounded-xl overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
          <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Encounter Resolution Summary
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resolved By
            </span>
            <p className="text-lg font-bold text-emerald-700 mt-1">
              {details.resolvedBy}
            </p>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reason for Resolution
            </span>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {details.reason}
            </p>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clinical Notes
            </span>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {details.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
