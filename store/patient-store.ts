import { create } from "zustand";
import patientsData from "@/data/patients.json";

export interface Patient {
  id: string;
  name: string;
  age: number;
  ewsScore: number;
  status: string;
  status: string;
  trend: string;
  initiatedBy?: string;
}

interface PatientStore {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  isPhrOpen: boolean;
  setIsPhrOpen: (open: boolean) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: patientsData,
  setPatients: (patients) => set({ patients }),
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  isPhrOpen: false,
  setIsPhrOpen: (open) => set({ isPhrOpen: open }),
}));
