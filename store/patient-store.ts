import { create } from "zustand";
import patientsData from "@/data/patients.json";
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

export interface Patient {
  id: string;
  name: string;
  age: number;
  ewsScore: number;
  status: PatientStatus;
  trend: string;
  initiatedBy?: PatientInitiatedBy;
  escalationStatus?: string;
  escalatedBy?: PatientEscalatedBy;
  aiTriageScore?: number;
  aiEngagement?: PatientAiEngagement;
  timeline?: any[];
  encounters?: EncounterRecord[];
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
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent = {
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
  },

  triggerEmergency: (patientId, dispatchRrt, dispatchPhysician) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const dispatches = [];
        if (dispatchRrt) dispatches.push("RRT");
        if (dispatchPhysician) dispatches.push("Attending");
        const dispatchText =
          dispatches.length > 0
            ? ` (Dispatched: ${dispatches.join(", ")})`
            : "";

        const newTimelineEvent = {
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
        };

        return {
          ...p,
          status: "Emergency Protocol",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
  },

  escalateToDoctor: (patientId, doctorId, assessment, recommendation) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const formattedDocName = doctorId
          .replace("dr_", "Dr. ")
          .replace(/^\w/, (c) => c.toUpperCase());

        const newTimelineEvent = {
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
        };

        return {
          ...p,
          status: "Refer to Doctor",
          escalatedBy: "Triage Nurse",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
  },

  pauseAiOutreach: (patientId) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent = {
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
  },

  initiateAiCheckIn: (patientId, type) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent = {
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
        };

        return {
          ...p,
          aiEngagement:
            type === "call" ? "Call - In Progress" : "Text - Active Chat",
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      }),
    }));
  },

  markAsResolved: (patientId, reason, note) => {
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p;

        const newTimelineEvent = {
          time: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          event: `Encounter marked as Resolved. Reason: ${reason}. Note: "${note}"`,
          type: "system",
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
  },

  // Main Navigation
  currentMainTab: "ews",
  setCurrentMainTab: (tab) => set({ currentMainTab: tab }),
}));
