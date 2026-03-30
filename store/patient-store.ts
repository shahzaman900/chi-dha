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

export interface Clinician {
  id: string;
  name: string;
  role: "Nurse" | "Doctor";
  isSupervisor?: boolean;
  workload: number;
  status: "Available" | "Busy" | "On Break";
  avatar?: string;
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

export type ActorType = "SYSTEM" | "AI" | "NURSE" | "PROVIDER";

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
  peakAiTriageScore?: number;
  isAwaitingAcknowledge?: boolean;
  toActorType?: ActorType | null;
  toUser?: string | null;
  toUserRole?: string | null;
  ewsLastUpdated?: string;
  triageLastUpdated?: string;
  triageTriggeredBy?: "Vitals" | "Nurse" | "Provider" | "AI";
  peakTriageLastUpdated?: string;
  peakTriageTriggeredBy?: "Vitals" | "Nurse" | "Provider" | "AI";
  conditionChangedBy?: string;
  conditionChangedAt?: string;
  conditionChangedByRole?: "Nurse" | "Doctor" | "AI" | "System";
}
export const getAiTriageStatus = (score: number) => {
  if (score >= 9) return "critical";
  if (score >= 7) return "high risk";
  if (score >= 5) return "medium risk";
  if (score >= 3) return "low risk";
  return "stable";
};

export const getEwsColorStyles = (score: number) => {
  if (score >= 7) return "bg-red-50 border-red-200 text-red-700";
  if (score >= 5) return "bg-orange-50 border-orange-200 text-orange-700";
  if (score >= 3) return "bg-yellow-50 border-yellow-200 text-yellow-700";
  return "bg-emerald-50 border-emerald-200 text-emerald-700";
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
  markAsResolved: (patientId: string, reason: string, note?: string) => void;
  transferPatient: (patientId: string, targetTab: "needs_action" | "in_progress" | "resolved") => void;
  changeCondition: (patientId: string, newScore: number, role: "Nurse" | "Doctor") => void;
  assignToActor: (patientId: string, actorType: ActorType, clinicianId?: string) => void;

  // Clinician Registry
  currentUser: Clinician | null;
  availableClinicians: Clinician[];
  setCurrentUser: (user: Clinician | null) => void;

  // Main Navigation
  currentMainTab: "nurse" | "doctor" | "ews" | "encounters" | "rpm-dashboard";
  setCurrentMainTab: (tab: "nurse" | "doctor" | "ews" | "encounters" | "rpm-dashboard") => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  getFilteredPatients: () => Patient[];
}

const mockClinicians: Clinician[] = [
  { id: "nurse-1", name: "Nurse Sarah", role: "Nurse", workload: 0, status: "Available", isSupervisor: true },
  { id: "nurse-2", name: "Nurse Emma", role: "Nurse", workload: 0, status: "Available" },
  { id: "nurse-3", name: "Nurse John", role: "Nurse", workload: 0, status: "Available" },
  { id: "doctor-1", name: "Dr. Ahmed", role: "Doctor", workload: 0, status: "Available" },
  { id: "doctor-2", name: "Dr. Sarah", role: "Doctor", workload: 0, status: "Available" },
];

const initializePatients = (data: any[]): Patient[] => {
  const seededPatients: Patient[] = [
    // 2 Patients in AI (Medium and Low Risk)
    {
      id: "demo-ai-1",
      name: "Marcus Aurelius",
      age: 65,
      status: "AI Outreach" as PatientStatus,
      aiTriageScore: 5,
      toActorType: "AI" as ActorType,
      toUser: null,
      ewsScore: 4,
      trend: "Stable",
      timeline: []
    },
    {
      id: "demo-ai-2",
      name: "Elena Gilbert",
      age: 24,
      status: "AI Outreach" as PatientStatus,
      aiTriageScore: 3,
      toActorType: "AI" as ActorType,
      toUser: null,
      ewsScore: 2,
      trend: "Improving",
      timeline: []
    },
    // 4 Patients in Action Required (Critical, High, Medium, Low)
    {
      id: "demo-act-1",
      name: "Arthur Morgan",
      age: 42,
      status: "Urgent Triage" as PatientStatus,
      aiTriageScore: 9,
      toActorType: "PROVIDER" as ActorType,
      toUser: null,
      ewsScore: 8,
      trend: "Declining",
      timeline: []
    },
    {
      id: "demo-act-2",
      name: "Sadie Adler",
      age: 35,
      status: "Nurse Alerted" as PatientStatus,
      aiTriageScore: 7,
      toActorType: "PROVIDER" as ActorType,
      toUser: null,
      ewsScore: 6,
      trend: "Declining",
      timeline: []
    },
    {
      id: "demo-act-3",
      name: "John Marston",
      age: 38,
      status: "Stable / Monitoring" as PatientStatus,
      aiTriageScore: 5,
      toActorType: "NURSE" as ActorType,
      toUser: null,
      ewsScore: 4,
      trend: "Stable",
      timeline: []
    },
    {
      id: "demo-act-4",
      name: "Charles Smith",
      age: 30,
      status: "AI Outreach" as PatientStatus,
      aiTriageScore: 3,
      toActorType: "NURSE" as ActorType,
      toUser: null,
      ewsScore: 2,
      trend: "Stable",
      timeline: []
    },
    // 2 Patients in Stable Filter
    {
      id: "demo-stable-1",
      name: "Abigail Marston",
      age: 32,
      status: "Resolved" as PatientStatus,
      aiTriageScore: 0,
      toActorType: "SYSTEM" as ActorType,
      toUser: null,
      ewsScore: 0,
      trend: "Stable",
      timeline: []
    },
    {
      id: "demo-stable-2",
      name: "Jack Marston",
      age: 12,
      status: "Stable / Monitoring" as PatientStatus,
      aiTriageScore: 0,
      toActorType: "SYSTEM" as ActorType,
      toUser: null,
      ewsScore: 1,
      trend: "Improving",
      timeline: []
    }
  ].map(p => ({
    ...p,
    peakAiTriageScore: p.aiTriageScore,
    isAwaitingAcknowledge: p.aiTriageScore >= 7,
    ewsLastUpdated: new Date().toISOString(),
    triageLastUpdated: new Date().toISOString(),
    triageTriggeredBy: "AI" as const,
    peakTriageLastUpdated: new Date().toISOString(),
    peakTriageTriggeredBy: "AI" as const,
    conditionChangedBy: "Dr. Ahmed",
    conditionChangedAt: new Date().toISOString(),
    conditionChangedByRole: "Doctor" as const,
    toUser: "Nurse Sarah",
    toUserRole: "Nurse"
  }));

  const remainingPatients = data.slice(0, 10).map((p, idx) => ({
    ...p,
    id: `p-rand-${idx}`,
    peakAiTriageScore: p.peakAiTriageScore || p.aiTriageScore || 0,
    isAwaitingAcknowledge: p.isAwaitingAcknowledge ?? (p.aiTriageScore >= 7 && !["Nurse Alerted", "Refer to Doctor", "Resolved"].includes(p.status)),
    toActorType: p.toActorType || (p.aiTriageScore >= 9 ? "AI" : "NURSE"),
    toUser: "Nurse Sarah",
    toUserRole: "Nurse",
    ewsLastUpdated: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
    triageLastUpdated: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    triageTriggeredBy: (["AI", "Vitals", "Nurse", "Provider"][Math.floor(Math.random() * 4)] as any),
    peakTriageLastUpdated: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    peakTriageTriggeredBy: (["AI", "Vitals", "Nurse", "Provider"][Math.floor(Math.random() * 4)] as any),
    conditionChangedBy: (Math.random() > 0.5 ? "Dr. Ahmed" : "Nurse Sarah"),
    conditionChangedAt: new Date(Date.now() - Math.floor(Math.random() * 43200000)).toISOString(),
    conditionChangedByRole: (Math.random() > 0.5 ? "Doctor" : "Nurse")
  }));

  return [...seededPatients, ...remainingPatients];
};

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: initializePatients(patientsData),
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
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;
        // If status changes to something considered "handled", clear the ack flag
        const isHandled = ["Nurse Alerted", "Refer to Doctor", "Resolved"].includes(status);
        return { 
          ...p, 
          status,
          isAwaitingAcknowledge: isHandled ? false : p.isAwaitingAcknowledge
        };
      }),
    }));
  },

  acknowledgeAlert: (patientId, note) => {
    const { currentUser } = get();
    const userName = currentUser?.name || "Clinic Staff";
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
          }),
          event: note
            ? `Alert acknowledged by ${userName}. Note: "${note}"`
            : `Alert acknowledged by ${userName}.`,
          type: "system",
        };

        return {
          ...p,
          status: "Nurse Alerted",
          isAwaitingAcknowledge: false,
          toUser: userName,
          toUserRole: currentUser?.role || "Nurse",
          toActorType: currentUser?.role === "Doctor" ? "PROVIDER" : "NURSE",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.success(`Alert Acknowledged — ${patientName}`, {
      description:
        `${userName} has taken ownership of this alert.`,
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
  
  transferPatient: (patientId, targetTab) => {
    const patientName = get().patients.find(p => p.id === patientId)?.name || "Patient";
    const statusMap = {
      needs_action: "Urgent Triage",
      in_progress: "Nurse Alerted",
      resolved: "Resolved"
    };
    
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;
        
        let newEngagement = p.aiEngagement;
        // If moving back to needs_action, we might need to mock engagement to satisfy getFilteredPatients
        if (targetTab === "needs_action") {
          const status = getAiTriageStatus(p.aiTriageScore || 0);
          if (status === "medium risk") newEngagement = "Call - Completed";
          if (status === "low risk") newEngagement = "Text - Completed";
        }

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `Patient transferred to ${targetTab.replace("_", " ")} queue.`,
          type: "system",
        };

        return {
          ...p,
          status: statusMap[targetTab] as PatientStatus,
          aiEngagement: newEngagement,
          isAwaitingAcknowledge: false,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    
    toast.success(`Transferred — ${patientName}`, {
      description: `Patient moved to ${targetTab.replace("_", " ")} tab.`,
    });
  },

  changeCondition: (patientId, newScore, role) => {
    const { patients, currentUser } = get();
    const userName = currentUser?.name || "Clinic Staff";
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newStatus = getAiTriageStatus(newScore);
    const oldStatus = getAiTriageStatus(patient.aiTriageScore || 0);

    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const now = new Date().toISOString();
        
        // Routing logic: if downgraded to stable, move to SYSTEM. 
        // If upgraded, usually stays with the person who changed it or goes to assigned actor.
        // For this demo, let's say if it's stable, actor is SYSTEM. Otherwise, it's the role that changed it.
        const newActorType: ActorType = newStatus === "stable" ? "SYSTEM" : (role === "Doctor" ? "PROVIDER" : "NURSE");

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
          }),
          event: `Condition changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()} by ${userName} (${role}).`,
          type: "system",
        };

        return {
          ...p,
          aiTriageScore: newScore,
          conditionChangedBy: userName,
          conditionChangedByRole: role,
          conditionChangedAt: now,
          toActorType: newActorType,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));

    toast.success(`Condition Updated`, {
      description: `${patient.name} is now ${newStatus.toUpperCase()}.`,
    });
  },

  assignToActor: (patientId, actorType, clinicianId) => {
    const { patients, availableClinicians, currentUser } = get();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    let targetName = actorType as string;
    let targetActor = actorType;

    if (clinicianId) {
      const clinician = availableClinicians.find(c => c.id === clinicianId);
      if (clinician) {
        targetName = clinician.name;
        targetActor = clinician.role === "Doctor" ? "PROVIDER" : "NURSE";
      }
    } else {
      // General assignments
      if (actorType === "PROVIDER") targetName = "Triage Physician";
      if (actorType === "NURSE") targetName = "Triage Nurse";
      if (actorType === "AI") targetName = "AI Engine";
      if (actorType === "SYSTEM") targetName = "Automated Monitoring";
    }

    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
          }),
          event: `Patient assigned to ${targetName} by ${currentUser?.name || "System"}.`,
          type: "system",
        };

        return {
          ...p,
          toUser: clinicianId ? targetName : null,
          toUserRole: clinicianId ? (availableClinicians.find(c => c.id === clinicianId)?.role || null) : null,
          toActorType: targetActor,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
      // Update workload only if clinicianId provided
      availableClinicians: clinicianId ? state.availableClinicians.map(c => 
        c.id === clinicianId ? { ...c, workload: c.workload + 1 } : c
      ) : state.availableClinicians
    }));

    toast.success(`Assignment Updated`, {
      description: `${patient.name} assigned to ${targetName}.`,
    });
  },

  // Clinician Registry
  currentUser: mockClinicians[0], // Nurse Sarah (Supervisor)
  availableClinicians: mockClinicians,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Main Navigation
  currentMainTab: "nurse",
  setCurrentMainTab: (tab) => set({ currentMainTab: tab, activeFilter: "all" }),
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  getFilteredPatients: () => {
    const { patients, activeFilter, currentMainTab, currentUser } = get();
    const loggedInUser = currentUser?.name || "Nurse Sarah";
    const isSupervisor = loggedInUser === "Nurse Sarah";
    
    let filtered = [...patients];

    // 1. Primary Filter: Regular Clinicians ONLY see what is explicitly assigned to them
    // Supervisor sees EVERYTHING for triage and oversight
    if (!isSupervisor) {
      filtered = filtered.filter(p => p.toUser === loggedInUser);
    }

    // 2. Tab-Specific & Action Filtering
    if (activeFilter === "all") {
      // If not supervisor, already filtered to user. 
      // If supervisor, shows everything (global oversight)
    } else if (currentMainTab === "nurse") {
      if (activeFilter === "require_action") {
        if (isSupervisor) {
          // Supervisor see everything requiring routing
          filtered = filtered.filter(p => (!p.toUser || p.toUser === "Nurse Sarah") && (!p.toActorType || p.toActorType === "NURSE" || p.toActorType === "PROVIDER"));
        } else {
          // Individual nurse seeing what they need to acknowledge
          filtered = filtered.filter(p => (p.status === "Nurse Alerted" || p.status === "Urgent Triage"));
        }
      } else if (activeFilter === "ai") {
        // PERSONALIZED: Show AI patients assigned to the specific user
        filtered = filtered.filter(p => p.toActorType === "AI" && p.toUser === loggedInUser);
      } else if (activeFilter === "in_progress") {
        // PERSONALIZED: Show In Progress patients assigned to the specific user
        // EXCLUDE: Anything that belongs in AI, Stable, or Action Required buckets
        filtered = filtered.filter(p => 
          p.toUser === loggedInUser && 
          p.toActorType !== "AI" && 
          p.toActorType !== "SYSTEM" && 
          !["Urgent Triage", "Nurse Alerted", "Refer to Doctor", "AI Outreach", "Resolved", "Stable / Monitoring"].includes(p.status)
        );
      } else if (activeFilter === "stable") {
        // PERSONALIZED: Show Stable patients assigned to the specific user
        filtered = filtered.filter(p => p.toActorType === "SYSTEM" && p.toUser === loggedInUser);
      }
    } else if (currentMainTab === "doctor") {
      if (activeFilter === "require_action") {
        if (isSupervisor) {
          filtered = filtered.filter(p => (!p.toUser || p.toUser === "Nurse Sarah") && (!p.toActorType || p.toActorType === "PROVIDER"));
        } else {
          // Doctors see what's in their queue
          filtered = filtered.filter(p => p.status === "Refer to Doctor" || p.status === "Urgent Triage");
        }
      } else if (activeFilter === "ai") {
        filtered = filtered.filter(p => p.toActorType === "AI" && p.toUser === loggedInUser);
      } else if (activeFilter === "nurse") {
        filtered = filtered.filter(p => p.toActorType === "NURSE" && (isSupervisor || p.toUser === loggedInUser));
      } else if (activeFilter === "in_progress") {
        filtered = filtered.filter(p => 
          p.toUser === loggedInUser && 
          p.toActorType !== "AI" && 
          p.toActorType !== "SYSTEM" &&
          !["Urgent Triage", "Nurse Alerted", "Refer to Doctor", "AI Outreach", "Resolved", "Stable / Monitoring"].includes(p.status)
        );
      } else if (activeFilter === "stable") {
        filtered = filtered.filter(p => p.toActorType === "SYSTEM" && p.toUser === loggedInUser);
      }
    }

    // Sort by actor priority: SYSTEM -> AI -> NURSE -> PROVIDER
    const actorPriority: Record<string, number> = {
      "SYSTEM": 0,
      "AI": 1,
      "NURSE": 2,
      "PROVIDER": 3
    };

    return filtered.sort((a, b) => {
      const prioA = actorPriority[a.toActorType || "SYSTEM"];
      const prioB = actorPriority[b.toActorType || "SYSTEM"];
      if (prioA !== prioB) return prioA - prioB;
      return (b.aiTriageScore || 0) - (a.aiTriageScore || 0);
    });
  },
}));
