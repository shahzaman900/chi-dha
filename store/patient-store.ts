import { create } from "zustand";
import patientsData from "@/data/patients.json";

export interface Patient {
  id: string;
  name: string;
  age: number;
  ewsScore: number;
  status: string;
  trend: string;
}

interface PatientStore {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  patients: patientsData,
  setPatients: (patients) => set({ patients }),
}));
