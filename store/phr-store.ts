import { create } from "zustand";
import phrData from "@/data/phr-data.json";

// Define the step type
export interface SymptomCheckerStep {
  step: string;
  system: string;
  patient: string;
  alert?: string;
  alertType?: "warning" | "critical";
  alertDesc?: string;
}

export interface PhrData {
  patientId: string;
  profile: {
    name: string;
    age: number;
    conditions: string[];
    living: string;
    history: string;
    status: string;
  };
  ews: {
    score: number;
    status: string;
    color: string;
  };
  metrics: Record<string, { value: string | number; change: string }>;
  timeline: Array<{ time: string; event: string; type: string }>;
  diagnosisMetadata?: {
    title: string;
    subtitle: string;
  };
  symptomCheckerTranscript?: SymptomCheckerStep[];
  treatmentPlan?: {
    actions: string[];
    labDispatch: string[];
    nurseDispatch: string[];
  };
  diagnosis: Array<{ name: string; probability: number; color: string }>;
  initialDiagnosis?: Array<{
    name: string;
    probability: number;
    color: string;
  }>;
  diagnosisDetails?: Array<{
    name: string;
    probability: number;
    risk: number;
    description: string;
    positiveFactors: string[];
    negativeFactors: string[];
  }>;
  treatmentDetails?: {
    title: string;
    immediateInterventions: {
      title: string;
      subtitle: string;
      sections: { name: string; items: string[] }[];
    };
    monitoring: {
      title: string;
      subtitle: string;
      sections: { name: string; items: string[] }[];
    };
  };
}

interface PhrStore {
  phrRecords: PhrData[];
  getPhrByPatientId: (id: string) => PhrData | undefined;
}
export const usePhrStore = create<PhrStore>((set, get) => ({
  phrRecords: phrData as unknown as PhrData[],
  getPhrByPatientId: (id) => get().phrRecords.find((p) => p.patientId === id),
}));
