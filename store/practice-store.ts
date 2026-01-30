import { create } from "zustand";
import practicesData from "@/data/practices.json";

// Define the Practice type based on the JSON structure
export interface Practice {
  id: string;
  name: string;
  email: string;
  mobile: string;
  fax: string;
  city: string;
  registrationDate: string;
  ptan: string;
  address: string;
  practicePoc: string;
  chiPoc: string;
}

interface PracticeStore {
  practices: Practice[];
  selectedIds: string[];
  setPractices: (practices: Practice[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
}

export const usePracticeStore = create<PracticeStore>((set) => ({
  practices: practicesData,
  selectedIds: [],
  setPractices: (practices) => set({ practices }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),
  selectAll: () =>
    set((state) => ({ selectedIds: state.practices.map((p) => p.id) })),
  deselectAll: () => set({ selectedIds: [] }),
}));
