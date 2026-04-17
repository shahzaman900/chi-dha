import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/ai-rpm'; // Assuming backend is on 3001. Adjust if needed.

export function useAiRpm() {
  const [patients, setPatients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [staff, setStaff] = useState<{nurses: any[], doctors: any[]}>({nurses: [], doctors: []});
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error("Failed to fetch AiRpm patients", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch staff", e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
  }, []);

  const createPatient = async (name: string, score: number) => {
    await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    await fetchPatients();
    await fetchLogs();
  };

  const retriage = async (id: string, score: number) => {
    await fetch(`${API_BASE}/patients/${id}/retriage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    });
    await fetchPatients();
    await fetchLogs();
  };

  const approveBacklog = async (id: string) => {
    await fetch(`${API_BASE}/patients/${id}/approve-backlog`, { method: 'PATCH' });
    await fetchPatients();
    await fetchLogs();
  };

  const pickBacklog = async (id: string, nurseName: string) => {
    await fetch(`${API_BASE}/patients/${id}/pick-backlog`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nurseName })
    });
    await fetchPatients();
    await fetchLogs();
  };

  const completeActive = async (id: string) => {
    await fetch(`${API_BASE}/patients/${id}/complete-active`, { method: 'PATCH' });
    await fetchPatients();
    await fetchLogs();
  };

  const referToDoctor = async (id: string) => {
    await fetch(`${API_BASE}/patients/${id}/refer-to-doctor`, { method: 'PATCH' });
    await fetchPatients();
    await fetchLogs();
  };

  const referToEmergency = async (id: string) => {
    await fetch(`${API_BASE}/patients/${id}/refer-to-emergency`, { method: 'PATCH' });
    await fetchPatients();
    await fetchLogs();
  };

  const acceptEmergency = async (id: string) => {
    await fetch(`${API_BASE}/patients/${id}/accept-emergency`, { method: 'PATCH' });
    await fetchPatients();
    await fetchLogs();
  };

  const updateClinicalPatient = async (id: string, data: { newAssignee?: string; requesterName: string; condition?: string; urgencyScore?: number }) => {
    await fetch(`${API_BASE}/patients/${id}/reassign`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await fetchPatients();
    await fetchLogs();
  };

  const clearData = async () => {
    await fetch(`${API_BASE}/clear`, { method: 'POST' });
    await fetchPatients();
    await fetchLogs();
  };

  return {
    patients,
    logs,
    staff,
    isLoading,
    fetchPatients,
    fetchLogs,
    fetchStaff,
    createPatient,
    retriage,
    approveBacklog,
    pickBacklog,
    completeActive,
    referToDoctor,
    referToEmergency,
    acceptEmergency,
    reassignPatient: updateClinicalPatient,
    clearData
  };
}
