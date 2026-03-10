import { create } from "zustand";
import patientsData from "@/data/patients.json";
import { toast } from "sonner";
export interface EncounterRecord {
  id: string;
  date: string;
  provider: string;
  reason: string;
  type: string;
}

export type PatientStatus =
  | "Stable / Monitoring"
  | "AI Outreach"
  | "Nurse Alerted"
  | "Urgent Triage"
  | "Refer to Doctor"
  | "Timeout Escalation"
  | "Emergency Protocol"
  | "Resolved";

export type PatientAiEngagement =
  | "Call - In Progress"
  | "Call - Completed"
  | "Call - No Answer"
  | "Text - Awaiting Reply"
  | "Text - Active Chat"
  | "Text - Completed"
  | "App Notification - Sent"
  | null;

export type PatientInitiatedBy =
  | "AI Engine"
  | "Patient (Self-Reported)"
  | "Caregiver / Family"
  | "Nurse";

export type PatientEscalatedBy =
  | "AI System (Timeout)"
  | "AI System (Risk Increase)"
  | "Triage Nurse"
  | "Attending Physician"
  | "Patient"
  | null;

export interface TimelineEvent {
  time: string;
  event: string;
  type:
    | "update"
    | "warning"
    | "system"
    | "critical"
    | "critical-action"
    | "info";
  detailType?:
    | "ai-assessment"
    | "emergency-protocol"
    | "escalation"
    | "resolution";
  details?: {
    initialDiagnosis?: Array<{ name: string; probability: number }>;
    transcript?: Array<{ speaker: string; text: string }>;
    updatedDiagnosis?: Array<{ name: string; probability: number }>;
    transport?: { status: string; eta: string; actions: string[] };
    erNotification?: { hospital: string; protocol: string; orders: string[] };
    handoff?: { vitals: Record<string, string>; instructions: string[] };
    doctor?: string;
    assessment?: string;
    recommendation?: string;
    reason?: string;
    note?: string;
    resolvedBy?: string;
  };
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone?: string;
  mrn?: string;
  gender?: "Male" | "Female" | "Other";
  ewsScore: number;
  status: PatientStatus;
  trend: string;
  initiatedBy?: PatientInitiatedBy;
  escalationStatus?: string;
  escalatedBy?: PatientEscalatedBy;
  aiTriageScore?: number;
  aiEngagement?: PatientAiEngagement;
  timeline?: TimelineEvent[];
  encounters?: EncounterRecord[];
  vitalsTrend?: {
    hr: number[];
    spo2: number[];
    rr: number[];
    bp: number[];
  };
}

export interface PhrTab {
  id: string;
  patientId: string;
  patientName: string;
  type: "encounter" | "phr" | "copilot";
}

interface PatientStore {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  // Tab system
  openTabs: PhrTab[];
  activeTabId: string | null; // null = Patients tab is active
  openPhrTab: (
    patientId: string,
    patientName: string,
    type?: "encounter" | "phr" | "copilot",
  ) => void;
  closePhrTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  // Registration system
  isRegistrationOpen: boolean;
  setIsRegistrationOpen: (open: boolean) => void;
  addPatient: (patient: Omit<Patient, "id">) => void;

  // Patient Actions
  updatePatientStatus: (patientId: string, status: PatientStatus) => void;
  acknowledgeAlert: (patientId: string, note?: string) => void;
  triggerEmergency: (
    patientId: string,
    dispatchRrt: boolean,
    dispatchPhysician: boolean,
  ) => void;
  escalateToDoctor: (
    patientId: string,
    doctorId: string,
    assessment: string,
    recommendation: string,
  ) => void;
  pauseAiOutreach: (patientId: string) => void;
  initiateAiCheckIn: (patientId: string, type: "call" | "text") => void;
  markAsResolved: (patientId: string, reason: string, note: string) => void;

  // Main Navigation
  currentMainTab: "ews" | "encounters";
  setCurrentMainTab: (tab: "ews" | "encounters") => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: patientsData as Patient[],
  setPatients: (patients) => set({ patients }),
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),

  // Tab system
  openTabs: [],
  activeTabId: null,

  openPhrTab: (patientId, patientName, type = "encounter") => {
    const { openTabs } = get();
    // Check if tab already open for this patient AND this specific type
    const tabId = `${type}-${patientId}`;
    const existing = openTabs.find((t) => t.id === tabId);
    if (existing) {
      // Just activate it
      set({ activeTabId: existing.id });
    } else {
      // Create new tab
      const newTab: PhrTab = {
        id: tabId,
        patientId,
        patientName,
        type,
      };
      set({
        openTabs: [...openTabs, newTab],
        activeTabId: newTab.id,
      });
    }
  },

  closePhrTab: (tabId) => {
    const { openTabs, activeTabId } = get();
    const tabIndex = openTabs.findIndex((t) => t.id === tabId);
    const newTabs = openTabs.filter((t) => t.id !== tabId);

    let newActiveTabId = activeTabId;
    if (activeTabId === tabId) {
      // Switch to preceding tab, or next tab, or Patients
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex > 0) {
        newActiveTabId = newTabs[tabIndex - 1].id;
      } else {
        newActiveTabId = newTabs[0].id;
      }
    }

    set({ openTabs: newTabs, activeTabId: newActiveTabId });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  // Registration system
  isRegistrationOpen: false,
  setIsRegistrationOpen: (open) => set({ isRegistrationOpen: open }),
  addPatient: (patientInfo) => {
    const newPatient: Patient = {
      ...patientInfo,
      id: Date.now().toString(), // Generate a unique ID based on timestamp
    };

    // Add to top of the list
    set((state) => ({
      patients: [newPatient, ...state.patients],
    }));
  },

  // Patient Actions
  updatePatientStatus: (patientId, status) => {
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patientId ? { ...p, status } : p,
      ),
    }));
  },

  acknowledgeAlert: (patientId, note) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: note
            ? `Alert acknowledged by Nurse. Note: "${note}"`
            : "Alert acknowledged by Nurse.",
          type: "system",
        };

        return {
          ...p,
          status: "Nurse Alerted",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.success(`Alert Acknowledged — ${patientName}`, {
      description:
        "You have taken ownership of this alert. The patient is now under your watch.",
    });
    // Auto-open encounter
    get().openPhrTab(patientId, patientName, "encounter");
  },

  triggerEmergency: (patientId, dispatchRrt, dispatchPhysician) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    const dispatches: string[] = [];
    if (dispatchRrt) dispatches.push("RRT");
    if (dispatchPhysician) dispatches.push("Attending");
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const dispatchText =
          dispatches.length > 0
            ? ` (Dispatched: ${dispatches.join(", ")})`
            : "";

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `EMERGENCY PROTOCOL triggered by Nurse.${dispatchText}`,
          type: "critical-action",
          detailType: "emergency-protocol",
          details: {
            transport: {
              status: "Dispatched",
              eta: "8 minutes",
              actions: [
                "Ambulance Unit 7 en route",
                "Paramedic team alerted",
                ...(dispatchRrt ? ["Rapid Response Team mobilized"] : []),
                ...(dispatchPhysician ? ["Attending physician paged"] : []),
              ],
            },
            erNotification: {
              hospital: "Dubai General Hospital — ER Bay 3",
              protocol: "Code Blue — Cardiac Alert",
              orders: [
                "12-lead ECG on arrival",
                "Troponin + BNP stat",
                "Crash cart standby",
                "IV access x2 large bore",
              ],
            },
            handoff: {
              vitals: {
                HR: `${p.vitalsTrend?.hr?.slice(-1)[0] || "—"} bpm`,
                SpO2: `${p.vitalsTrend?.spo2?.slice(-1)[0] || "—"}%`,
                BP: "Pending",
                EWS: `${p.ewsScore}`,
              },
              instructions: [
                "Continuous telemetry monitoring",
                "O2 titrate to SpO2 > 94%",
                "NPO status",
                "Prepare for possible intubation",
              ],
            },
          },
        };

        return {
          ...p,
          status: "Emergency Protocol",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.error(`🚨 EMERGENCY — ${patientName}`, {
      description: `Emergency protocol activated.${dispatches.length > 0 ? ` Dispatched: ${dispatches.join(", ")}` : ""}`,
      duration: 8000,
    });
  },

  escalateToDoctor: (patientId, doctorId, assessment, recommendation) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    const formattedDocName = doctorId
      .replace("dr_", "Dr. ")
      .replace(/^\w/, (c) => c.toUpperCase());
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `Case escalated to ${formattedDocName}. Assessment: "${assessment}". Request: "${recommendation}".`,
          type: "critical",
          detailType: "escalation",
          details: {
            doctor: formattedDocName,
            assessment,
            recommendation,
          },
        };

        return {
          ...p,
          status: "Refer to Doctor",
          escalatedBy: "Triage Nurse",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.warning(`Escalated — ${patientName}`, {
      description: `SBAR handoff sent to ${formattedDocName}. Awaiting physician response.`,
    });
  },

  pauseAiOutreach: (patientId) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: "AI Outreach paused by staff.",
          type: "system",
        };

        return {
          ...p,
          aiEngagement: null,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.info(`AI Outreach Paused — ${patientName}`, {
      description: "AI engagement has been paused for this patient.",
    });
  },

  initiateAiCheckIn: (patientId, type) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `AI Check-in (${type}) initiated manually.`,
          type: "update",
          ...(type === "call"
            ? {
                detailType: "ai-assessment" as const,
                details: {
                  initialDiagnosis: [
                    { name: "Acute Coronary Syndrome", probability: 45 },
                    { name: "Hypertensive Crisis", probability: 30 },
                    { name: "Anxiety / Panic Attack", probability: 15 },
                    { name: "GERD Exacerbation", probability: 10 },
                  ],
                  transcript: [
                    {
                      speaker: "System",
                      text: "Hello, this is your CHI health assistant. How are you feeling today?",
                    },
                    {
                      speaker: "Patient",
                      text: "I've been having chest tightness and some shortness of breath since this morning.",
                    },
                    {
                      speaker: "System",
                      text: "I'm sorry to hear that. On a scale of 1-10, how would you rate the pain?",
                    },
                    {
                      speaker: "Patient",
                      text: "About a 6. It gets worse when I try to walk around.",
                    },
                    {
                      speaker: "System",
                      text: "Is the pain radiating to your arm, jaw, or back?",
                    },
                    {
                      speaker: "Patient",
                      text: "A little bit into my left arm, yes.",
                    },
                    {
                      speaker: "System",
                      text: "Thank you. I'm updating your assessment now. A nurse will review your case shortly.",
                    },
                  ],
                  updatedDiagnosis: [
                    { name: "Acute Coronary Syndrome", probability: 62 },
                    { name: "Unstable Angina", probability: 20 },
                    { name: "Hypertensive Crisis", probability: 12 },
                    { name: "Anxiety / Panic Attack", probability: 6 },
                  ],
                },
              }
            : {}),
        };

        return {
          ...p,
          aiEngagement:
            type === "call" ? "Call - In Progress" : "Text - Active Chat",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.success(
      `AI ${type === "call" ? "Call" : "Text"} Initiated — ${patientName}`,
      {
        description:
          type === "call"
            ? "AI voice agent is now calling the patient."
            : "AI text conversation started with the patient.",
      },
    );
  },

  markAsResolved: (patientId, reason, note) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `Encounter marked as Resolved. Reason: ${reason}.`,
          type: "system",
          detailType: "resolution",
          details: {
            reason,
            note: note || "No additional notes.",
            resolvedBy: "Triage Nurse",
          },
        };

        return {
          ...p,
          status: "Resolved",
          escalationStatus: "Stable",
          aiEngagement: null,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.success(`Resolved — ${patientName}`, {
      description: `Encounter closed. Reason: ${reason}`,
    });
  },

  // Main Navigation
  currentMainTab: "ews",
  setCurrentMainTab: (tab) => set({ currentMainTab: tab }),
}));
