import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Patient, PatientStatus } from "@/store/patient-store";

const API_URL = "http://localhost:3001/patients";

export const usePatients = () => {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
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
