import { create } from "zustand";
import phrData from "@/data/phr-data.json";

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
  diagnosis: Array<{ name: string; probability: number; color: string }>;
}

interface PhrStore {
  phrRecords: PhrData[];
  getPhrByPatientId: (id: string) => PhrData | undefined;
}
export const usePhrStore = create<PhrStore>((set, get) => ({
  phrRecords: phrData as unknown as PhrData[],
  getPhrByPatientId: (id) => get().phrRecords.find((p) => p.patientId === id),
}));
