import { create } from "zustand";
import { toast } from "sonner";
import axios from "axios";

const API_URL = "http://localhost:3001/patients";
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
  | "STABLE_MONITORING"
  | "AI_OUTREACH"
  | "NURSE_ALERTED"
  | "URGENT_TRIAGE"
  | "REFER_TO_DOCTOR"
  | "TIMEOUT_ESCALATION"
  | "EMERGENCY_PROTOCOL"
  | "RESOLVED";

export const formatStatus = (status: PatientStatus | string) => {
  if (!status) return "Unknown";
  switch (status) {
    case "STABLE_MONITORING": return "Stable / Monitoring";
    case "AI_OUTREACH": return "AI Outreach";
    case "NURSE_ALERTED": return "Nurse Alerted";
    case "URGENT_TRIAGE": return "Urgent Triage";
    case "REFER_TO_DOCTOR": return "Refer to Doctor";
    case "TIMEOUT_ESCALATION": return "Timeout Escalation";
    case "EMERGENCY_PROTOCOL": return "Emergency Protocol";
    case "RESOLVED": return "Resolved";
    default: return status;
  }
};

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
    transcript?: Array<{ 
      speaker: string; 
      text: string; 
      isSuggestion?: boolean; 
      suggestedBy?: string;
    }>;
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
  activeOwner: "AI" | "NURSE";
  handoffNote?: string;
  isHandoffPending?: boolean;
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
  takeOwnership: (patientId: string) => void;
  handoverToAi: (patientId: string, note: string) => void;
  addMessage: (patientId: string, text: string, speaker: string, isSuggestion?: boolean) => void;
  updateSoapNote: (patientId: string, soapNote: Partial<SoapNote>) => void;

  // Clinician Registry
  currentUser: Clinician | null;
  availableClinicians: Clinician[];
  setCurrentUser: (user: Clinician | null) => void;

  // Main Navigation
  currentMainTab: "nurse" | "doctor" | "ews" | "encounters" | "rpm-dashboard";
  setCurrentMainTab: (tab: "nurse" | "doctor" | "ews" | "encounters" | "rpm-dashboard") => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  counts: {
    all: number;
    require_action: number;
    ai: number;
    in_progress: number;
    stable: number;
  };
  vitalsHistory: Record<string, any[]>;
  diagnoses: Record<string, any[]>;
  timeline: Record<string, any[]>;
  fetchVitalsHistory: (patientId: string) => Promise<void>;
  fetchDiagnoses: (patientId: string) => Promise<void>;
  fetchTimeline: (patientId: string, range?: "today" | "week" | "month") => Promise<void>;
  setPatientsData: (data: { data: Patient[]; counts: any }) => void;
  getFilteredPatients: () => Patient[];
}

const mockClinicians: Clinician[] = [
  { id: "nurse-1", name: "Nurse Sarah", role: "Nurse", workload: 0, status: "Available", isSupervisor: true },
  { id: "nurse-2", name: "Nurse Emma", role: "Nurse", workload: 0, status: "Available" },
  { id: "nurse-3", name: "Nurse John", role: "Nurse", workload: 0, status: "Available" },
  { id: "doctor-1", name: "Dr. Ahmed", role: "Doctor", workload: 0, status: "Available" },
  { id: "doctor-2", name: "Dr. Sarah", role: "Doctor", workload: 0, status: "Available" },
];

const initializePatients = (): Patient[] => {
  return []; // Initialize as empty, let React Query populate this
};

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: initializePatients(),
  counts: { all: 0, require_action: 0, ai: 0, in_progress: 0, stable: 0 },
  vitalsHistory: {},
  diagnoses: {},
  timeline: {},
  fetchVitalsHistory: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/${patientId}/vitals-history`);
      set((state) => ({
        vitalsHistory: {
          ...state.vitalsHistory,
          [patientId]: response.data
        }
      }));
    } catch (error) {
      console.error(`Failed to fetch vitals for patient ${patientId}:`, error);
    }
  },
  fetchDiagnoses: async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/${patientId}/diagnoses`);
      set((state) => ({
        diagnoses: {
          ...state.diagnoses,
          [patientId]: response.data
        }
      }));
    } catch (error) {
      console.error(`Failed to fetch diagnoses for patient ${patientId}:`, error);
    }
  },
  fetchTimeline: async (patientId, range) => {
    try {
      const url = range 
        ? `${API_URL}/${patientId}/timeline?range=${range}`
        : `${API_URL}/${patientId}/timeline`;
      const response = await axios.get(url);
      set((state) => ({
        timeline: {
          ...state.timeline,
          [patientId]: response.data
        }
      }));
    } catch (error) {
      console.error(`Failed to fetch timeline for patient ${patientId}:`, error);
    }
  },
  setPatientsData: ({ data, counts }) => set({ patients: data, counts }),
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

  takeOwnership: async (patientId) => {
    const { currentUser } = get();
    if (currentUser?.role !== "Nurse") {
      toast.error("Ownership Transfer Failed", {
        description: "Only nurses can take direct ownership of conversations.",
      });
      return;
    }

    try {
      const newTimelineEvent: TimelineEvent = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        event: `Ownership transferred to ${currentUser.name}. (Clinical Responsibility Accepted)`,
        type: "system",
      };

      const updateData = {
        activeOwner: "NURSE" as "AI" | "NURSE",
        toUser: currentUser.name,
        toUserRole: "Nurse",
      };

      // Optimistic update
      set((state) => ({
        patients: state.patients.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            ...updateData,
            timeline: [...(p.timeline || []), newTimelineEvent],
          };
        }),
      }));

      await axios.patch(`${API_URL}/${patientId}`, {
        ...updateData,
        timeline: [...(get().patients.find(p => p.id === patientId)?.timeline || [])]
      });

      toast.success("Ownership Accepted", {
        description: `You are now the active owner for this patient.`,
      });
    } catch (error) {
      console.error("Failed to take ownership:", error);
      toast.error("Action Failed", { description: "Could not save ownership status to database." });
    }
  },

  handoverToAi: (patientId, note) => {
    const { currentUser } = get();
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Ownership returned to AI. Handover note: "${note}"`,
          type: "system",
        };

        return {
          ...p,
          activeOwner: "AI",
          handoffNote: note,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
    toast.info("Handed over to AI", {
      description: "AI assistant has resumed primary communication.",
    });
  },

  addMessage: (patientId, text, speaker, isSuggestion = false) => {
    const { currentUser } = get();
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        // Find the last timeline event that has a transcript, or create a new one
        const timeline = [...(p.timeline || [])];
        const lastAiEventIndex = [...timeline].reverse().findIndex(e => e.detailType === "ai-assessment");
        
        if (lastAiEventIndex !== -1) {
          const index = timeline.length - 1 - lastAiEventIndex;
          const event = timeline[index];
          const transcript = [...(event.details?.transcript || [])];
          transcript.push({ 
            speaker, 
            text, 
            isSuggestion, 
            suggestedBy: isSuggestion ? currentUser?.name : undefined 
          });
          timeline[index] = { ...event, details: { ...event.details, transcript } };
        } else {
          // Create new timeline event for this message
          timeline.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: isSuggestion ? "Staff Suggestion" : "Patient Conversation Update",
            type: isSuggestion ? "info" : "update",
            detailType: "ai-assessment",
            details: {
              transcript: [{ 
                speaker, 
                text, 
                isSuggestion, 
                suggestedBy: isSuggestion ? currentUser?.name : undefined 
              }]
            }
          });
        }

        return { ...p, timeline };
      }),
    }));
  },

  updateSoapNote: (patientId, soapNote) => {
    const { currentUser } = get();
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const updatedSoapNote = {
          ...(p.draftSoapNote || {}),
          ...soapNote,
        };

        const newTimelineEvent: TimelineEvent = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `SOAP Note updated by ${currentUser?.name || "Staff"}.`,
          type: "update",
          detailType: "ai-assessment",
          details: { soapNote: updatedSoapNote }
        };

        return {
          ...p,
          draftSoapNote: updatedSoapNote,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
  },

  acknowledgeAlert: async (patientId, note) => {
    const { currentUser } = get();
    const userName = currentUser?.name || "Clinic Staff";
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    
    try {
      const newTimelineEvent: TimelineEvent = {
        time: new Date().toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
        }),
        event: note
          ? `Alert acknowledged by ${userName}. Note: "${note}"`
          : `Alert acknowledged by ${userName}.`,
        type: "system",
      };

      const updateData = {
        status: "NURSE_ALERTED" as PatientStatus,
        isAwaitingAcknowledge: false,
        toUser: userName,
        toUserRole: currentUser?.role || "Nurse",
        toActorType: (currentUser?.role === "Doctor" ? "PROVIDER" : "NURSE") as ActorType,
        activeOwner: "NURSE" as "AI" | "NURSE",
      };

      // Optimistic update
      set((state) => ({
        patients: state.patients.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            ...updateData,
            timeline: [...(p.timeline || []), newTimelineEvent],
          };
        }),
      }));

      await axios.patch(`${API_URL}/${patientId}`, {
        ...updateData,
        timeline: [...(get().patients.find(p => p.id === patientId)?.timeline || [])]
      });

      toast.success(`Alert Acknowledged — ${patientName}`, {
        description: `${userName} has taken ownership of this alert.`,
      });
      // Auto-open encounter
      get().openPhrTab(patientId, patientName, "encounter");
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      toast.error("Action Failed", { description: "Could not save acknowledgment to database." });
    }
  },

  triggerEmergency: async (patientId, dispatchData) => {
    const patientName =
      get().patients.find((p) => p.id === patientId)?.name || "Patient";
    const dispatches: string[] = [];
    if (dispatchData.dispatchRrt) dispatches.push("RRT");
    if (dispatchData.dispatchPhysician) dispatches.push("Attending");

    try {
      await axios.post(`${API_URL}/${patientId}/emergency-protocol`, {
        protocol: "CODE_BLUE_CARDIAC_ALERT", // from Enum
        deployRapidResponceTeam: dispatchData.dispatchRrt,
        AlertOnCall: dispatchData.dispatchPhysician,
        standingOrders: dispatchData.standingOrders,
        instructions: dispatchData.instructions,
        actionsTaken: dispatchData.transportActions,
        eta: dispatchData.eta ? parseInt(dispatchData.eta) : 8
      });
    } catch (error) {
      console.error("Failed to save emergency protocol details:", error);
    }

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
              eta: dispatchData.eta,
              actions: dispatchData.transportActions,
            },
            erNotification: {
              hospital: dispatchData.hospitalName,
              protocol: dispatchData.protocol,
              orders: dispatchData.standingOrders,
            },
            handoff: {
              vitals: {
                HR: `${p.vitalsTrend?.hr?.slice(-1)[0] || "—"} bpm`,
                SpO2: `${p.vitalsTrend?.spo2?.slice(-1)[0] || "—"}%`,
                BP: "Pending",
                EWS: `${p.ewsScore}`,
              },
              instructions: dispatchData.instructions,
            },
          },
        };

        return {
          ...p,
          status: "EMERGENCY_PROTOCOL" as PatientStatus,
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
          status: "REFER_TO_DOCTOR" as PatientStatus,
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
          status: "RESOLVED" as PatientStatus,
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
      needs_action: "URGENT_TRIAGE" as PatientStatus,
      in_progress: "NURSE_ALERTED" as PatientStatus,
      resolved: "RESOLVED" as PatientStatus
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
    const { patients } = get();
    
    // The backend already filters the list based on activeFilter.
    // We just need to handle the visual sorting for the table.
    const actorPriority: Record<string, number> = {
      "SYSTEM": 0,
      "AI": 1,
      "NURSE": 2,
      "PROVIDER": 3
    };

    return [...patients].sort((a, b) => {
      const prioA = actorPriority[a.toActorType || "SYSTEM"];
      const prioB = actorPriority[b.toActorType || "SYSTEM"];
      if (prioA !== prioB) return prioA - prioB;
      return (b.aiTriageScore || 0) - (a.aiTriageScore || 0);
    });
  },
}));
