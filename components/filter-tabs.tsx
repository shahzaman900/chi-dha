"use client";

import { usePatientStore, getAiTriageStatus } from "@/store/patient-store";
import { Activity } from "lucide-react";

export function FilterTabs() {
  const { activeFilter, setActiveFilter, patients, currentMainTab, currentUser } = usePatientStore();
  const loggedInUser = currentUser?.name || "Nurse Sarah";

  const getCount = (filter: string) => {
    const isSupervisor = loggedInUser === "Nurse Sarah";
    let patientsToCount = [...patients];

    // Primary filter (sync with getFilteredPatients)
    if (!isSupervisor) {
      patientsToCount = patientsToCount.filter(p => p.toUser === loggedInUser);
    }

    if (filter === "all") return patientsToCount.length;

    if (currentMainTab === "nurse") {
      if (filter === "require_action") {
        if (isSupervisor) {
          return patientsToCount.filter(p => (!p.toUser || p.toUser === "Nurse Sarah") && (!p.toActorType || p.toActorType === "NURSE" || p.toActorType === "PROVIDER")).length;
        } else {
          return patientsToCount.filter(p => (p.status === "Nurse Alerted" || p.status === "Urgent Triage")).length;
        }
      }
      if (filter === "ai") return patientsToCount.filter(p => p.toActorType === "AI" && p.toUser === loggedInUser).length;
      if (filter === "in_progress") return patientsToCount.filter(p => 
        p.toUser === loggedInUser && 
        p.toActorType !== "AI" && 
        p.toActorType !== "SYSTEM" && 
        !["Urgent Triage", "Nurse Alerted", "Refer to Doctor", "AI Outreach", "Resolved", "Stable / Monitoring"].includes(p.status)
      ).length;
      if (filter === "stable") return patientsToCount.filter(p => p.toActorType === "SYSTEM" && p.toUser === loggedInUser).length;
    } else if (currentMainTab === "doctor") {
      if (filter === "require_action") {
        if (isSupervisor) {
          return patientsToCount.filter(p => (!p.toUser || p.toUser === "Nurse Sarah") && (!p.toActorType || p.toActorType === "PROVIDER")).length;
        } else {
          return patientsToCount.filter(p => p.status === "Refer to Doctor" || p.status === "Urgent Triage").length;
        }
      }
      if (filter === "ai") return patientsToCount.filter(p => p.toActorType === "AI" && p.toUser === loggedInUser).length;
      if (filter === "nurse") return patientsToCount.filter(p => p.toActorType === "NURSE").length;
      if (filter === "in_progress") return patientsToCount.filter(p => 
        p.toUser === loggedInUser && 
        p.toActorType !== "AI" && 
        p.toActorType !== "SYSTEM" &&
        !["Urgent Triage", "Nurse Alerted", "Refer to Doctor", "AI Outreach", "Resolved", "Stable / Monitoring"].includes(p.status)
      ).length;
      if (filter === "stable") return patientsToCount.filter(p => p.toActorType === "SYSTEM" && p.toUser === loggedInUser).length;
    }
    return 0;
  };

  const renderFilterButton = (id: string, label: string, color: string) => {
    const isActive = activeFilter === id;
    const count = getCount(id);

    const colorStyles: Record<string, string> = {
      blue: isActive ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
      red: isActive ? "bg-red-50 text-red-700 shadow-sm border border-red-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
      orange: isActive ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
      emerald: isActive ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
      slate: isActive ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
    };

    return (
      <button
        key={id}
        onClick={() => setActiveFilter(id)}
        className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${colorStyles[color]}`}
      >
        {id === "require_action" && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
        {id === "ai" && <Activity className="h-4 w-4" />}
        {label} ({count})
      </button>
    );
  };

  if (currentMainTab === "encounters") return null;

  return (
    <div className="flex items-center gap-1 mb-6">
      <div className="h-10 flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
        {renderFilterButton("all", "All", "slate")}

        {currentMainTab === "nurse" && (
          <>
            {renderFilterButton("require_action", "Required Action", "red")}
            {renderFilterButton("ai", "AI", "blue")}
            {renderFilterButton("in_progress", "In Progress", "orange")}
            {renderFilterButton("stable", "Stable", "emerald")}
          </>
        )}

        {currentMainTab === "doctor" && (
          <>
            {renderFilterButton("require_action", "Required Action", "red")}
            {renderFilterButton("ai", "AI", "blue")}
            {renderFilterButton("nurse", "Nurse", "slate")}
            {renderFilterButton("in_progress", "In Progress", "orange")}
            {renderFilterButton("stable", "Stable", "emerald")}
          </>
        )}
      </div>
    </div>
  );
}
