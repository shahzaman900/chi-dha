import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Patient, PatientStatus } from "@/store/patient-store";

const API_URL = "http://localhost:3001/patients" as string;

export const usePatients = (filter: string = 'all') => {
  return useQuery<{ data: Patient[]; counts: any }>({
    queryKey: ["patients", filter],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}?filter=${filter}`);
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useVitalsHistory = (id: string, enabled: boolean = false) => {
  return useQuery<any[]>({
    queryKey: ["vitals-history", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}/vitals-history`);
      return data;
    },
    enabled,
    refetchInterval: 10000, // Poll less frequently for history
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PatientStatus }) => {
      const { data } = await axios.patch(`${API_URL}/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
