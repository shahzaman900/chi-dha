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

export interface SoapNote {
  subjective?: {
    chiefComplaint?: string;
    hpi?: {
      onset?: string;
      location?: string;
      duration?: string;
      character?: string;
      aggravating?: string;
      relieving?: string;
      timing?: string;
      severity?: string;
      radiation?: string;
      associatedSymptoms?: string;
      pastEpisodes?: string;
      details?: string;
    };
    pastMedicalHistory?: Array<{ condition: string; details: string }>;
    surgicalHistory?: Array<{ surgery: string; details: string }>;
    medications?: Array<{ name: string; route: string; frequency: string; instruction: string }>;
    allergies?: { nkda: boolean; list: Array<{ substance: string; type: string; code: string; reaction: string }> };
    screenings?: Array<{ type: string; date: string; performed: boolean; details: string }>;
    vaccinations?: Array<{ type: string; date: string }>;
    lmp?: string;
    familyHistory?: Array<{ relation: string; details: string }>;
    socialHistory?: Array<{ type: string; details: string }>;
    ros?: Record<string, "Normal" | "Abnormal" | "---">;
  };
  objective?: {
    physicalExam?: {
      generalAppearance?: string;
      examDetails?: string;
      systems?: Record<string, string>;
    };
    vitals?: {
      temp?: string;
      hr?: string;
      rr?: string;
      spo2?: string;
      bpSystolic?: string;
      bpDiastolic?: string;
      height?: string;
      weight?: string;
      bmi?: string;
    };
    labs?: {
      results?: string;
      imaging?: string;
      other?: string;
    };
    comments?: string;
  };
  assessment?: {
    differentialDiagnosis?: Array<{ diagnosis: string; icd10: string; likelihood: number; risk: number; group: string }>;
    problemList?: Array<{ diagnosis: string; icd10: string; status: string; actionPlan: string }>;
    preventive?: Array<{ name: string; icd10: string; specifics: string }>;
    comments?: string;
  };
  plan?: {
    immediateActions?: string;
    medications?: Array<{ name: string; status: string; route: string; frequency: string; instruction: string }>;
    labOrders?: Array<{ name: string; details: string }>;
    imagingOrders?: Array<{ type: string; bodyPart: string; details: string }>;
    procedureOrders?: Array<{ name: string; details: string }>;
    referrals?: {
      state?: string;
      city?: string;
      list?: Array<{ specialist: string; referredTo: string; details: string }>;
    };
    vaccinations?: Array<{ type: string; details: string }>;
    education?: string;
    followUp?: string;
    comments?: string;
  };
}

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
    soapNote?: SoapNote;
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
  isNurseActiveInCopilot?: boolean;
  draftSoapNote?: SoapNote;
}

export const getAiTriageStatus = (score: number) => {
  if (score >= 9) return "critical";
  if (score >= 7) return "high risk";
  if (score >= 5) return "medium risk";
  if (score >= 3) return "low risk";
  return "stable";
};

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
    soapNote: SoapNote,
  ) => void;
  pauseAiOutreach: (patientId: string) => void;
  initiateAiCheckIn: (patientId: string, type: "call" | "text") => void;
  callPatient: (patientId: string) => void;
  toggleCopilotTakeover: (patientId: string, takeover: boolean) => void;
  markAsResolved: (patientId: string, reason: string, note: string) => void;

  // Main Navigation
  currentMainTab: "ews" | "encounters";
  setCurrentMainTab: (tab: "ews" | "encounters") => void;
  activeFilter: "all" | "needs_action" | "ai_outreach" | "in_progress" | "resolved";
  setActiveFilter: (filter: "all" | "needs_action" | "ai_outreach" | "in_progress" | "resolved") => void;
  getFilteredPatients: () => Patient[];
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

  escalateToDoctor: (patientId, doctorId, soapNote) => {
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
          event: `Case escalated to ${formattedDocName}. Detailed SOAP Note attached.`,
          type: "critical",
          detailType: "escalation",
          details: {
            doctor: formattedDocName,
            soapNote,
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
          detailType: "ai-assessment" as const,
          details:
            type === "call"
              ? {
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
                }
              : {
                  initialDiagnosis: [
                    { name: "Acute Coronary Syndrome", probability: 45 },
                    { name: "Hypertensive Crisis", probability: 30 },
                    { name: "Anxiety / Panic Attack", probability: 15 },
                    { name: "GERD Exacerbation", probability: 10 },
                  ],
                  transcript: [
                    {
                      speaker: "System",
                      text: "Hi, this is your CHI health assistant. How are you feeling today?",
                    },
                    {
                      speaker: "Patient",
                      text: "Not great. I have been feeling tightness in my chest.",
                    },
                    {
                      speaker: "System",
                      text: "I am sorry to hear that. Can you describe any other symptoms?",
                    },
                    {
                      speaker: "Patient",
                      text: "Some dizziness and I feel short of breath when I move.",
                    },
                    {
                      speaker: "System",
                      text: "Thank you for sharing. Are you currently taking your prescribed medications?",
                    },
                    {
                      speaker: "Patient",
                      text: "I missed my dose yesterday.",
                    },
                    {
                      speaker: "System",
                      text: "Understood. A nurse will review your case shortly. Please rest and avoid exertion.",
                    },
                  ],
                  updatedDiagnosis: [
                    { name: "Acute Coronary Syndrome", probability: 55 },
                    { name: "Hypertensive Crisis", probability: 25 },
                    { name: "Medication Non-Adherence", probability: 12 },
                    { name: "Anxiety / Panic Attack", probability: 8 },
                  ],
                },
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

  callPatient: (patientId) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    const patientPhone =
      get().patients.find((p) => p.id === patientId)?.phone || "unknown";
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
          event: `Direct phone call initiated to patient (${patientPhone}).`,
          type: "update",
          detailType: "ai-assessment",
          details: {
            transcript: [
              {
                speaker: "Nurse",
                text: `Calling ${patientName} at ${patientPhone}...`,
              },
              {
                speaker: "System",
                text: "Call connected. Duration: ongoing.",
              },
              {
                speaker: "Nurse",
                text: "Hello, this is your care team calling to check on you. How are you feeling?",
              },
              {
                speaker: "Patient",
                text: "I have been feeling worse since this morning. The pain is still there.",
              },
              {
                speaker: "Nurse",
                text: "I understand. We are reviewing your vitals now. Can you describe the pain?",
              },
              {
                speaker: "Patient",
                text: "It is a dull ache in my chest, sometimes sharp when I breathe deeply.",
              },
            ],
          },
        };

        return {
          ...p,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.info(`Calling ${patientName}...`, {
      description: `Dialing ${patientPhone}`,
    });
  },

  toggleCopilotTakeover: (patientId, takeover) => {
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
          event: takeover
            ? "Nurse took over communication."
            : "Communication handed back to AI.",
          type: "system",
        };

        return {
          ...p,
          isNurseActiveInCopilot: takeover,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    if (takeover) {
      toast.success(`Nurse Takeover — ${patientName}`, {
        description: "You are now communicating directly with the patient.",
      });
    } else {
      toast.info(`AI Handoff — ${patientName}`, {
        description: "The AI agent has resumed the conversation.",
      });
    }
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
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  getFilteredPatients: () => {
    const { patients, activeFilter } = get();
    let filtered = [...patients];

    if (activeFilter === "needs_action") {
      filtered = filtered.filter((p) => {
        const score = p.aiTriageScore || 0;
        const status = getAiTriageStatus(score);
        const engagement = p.aiEngagement || "";

        if (status === "critical" && !engagement) return true;
        if (status === "high risk" && !engagement) return true;
        if (status === "medium risk" && engagement === "Call - Completed") return true;
        if (status === "low risk" && engagement === "Text - Completed") return true;

        return false;
      });
    } else if (activeFilter === "ai_outreach") {
      filtered = filtered.filter((p) => {
        const status = getAiTriageStatus(p.aiTriageScore || 0);
        const engagement = p.aiEngagement || "";
        return (status === "low risk" || status === "medium risk") && !engagement.includes("Completed");
      });
    } else if (activeFilter === "in_progress") {
      filtered = filtered.filter((p) =>
        ["Nurse Alerted", "Refer to Doctor"].includes(p.status),
      );
    } else if (activeFilter === "resolved") {
      filtered = filtered.filter((p) =>
        ["Resolved", "Stable / Monitoring"].includes(p.status),
      );
    }

    return filtered.sort((a, b) => (b.aiTriageScore || 0) - (a.aiTriageScore || 0));
  },
}));
