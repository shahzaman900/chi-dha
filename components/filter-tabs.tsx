"use client";

import { usePatientStore, getAiTriageStatus } from "@/store/patient-store";
import { Activity } from "lucide-react";

export function FilterTabs() {
  const { activeFilter, setActiveFilter, patients } = usePatientStore();

  const getCount = (filter: "all" | "needs_action" | "ai_outreach" | "in_progress" | "resolved") => {
    if (filter === "all") return patients.length;
    if (filter === "needs_action") {
      return patients.filter((p) => {
        const status = getAiTriageStatus(p.aiTriageScore || 0);
        const engagement = p.aiEngagement || "";
        if (status === "critical" && !engagement) return true;
        if (status === "high risk" && !engagement) return true;
        if (status === "medium risk" && engagement === "Call - Completed") return true;
        if (status === "low risk" && engagement === "Text - Completed") return true;
        return false;
      }).length;
    }
    if (filter === "ai_outreach") {
      return patients.filter((p) => {
        const status = getAiTriageStatus(p.aiTriageScore || 0);
        const engagement = p.aiEngagement || "";
        return (status === "low risk" || status === "medium risk") && !engagement.includes("Completed");
      }).length;
    }
    if (filter === "in_progress") {
      return patients.filter((p) =>
        ["Nurse Alerted", "Refer to Doctor"].includes(p.status)
      ).length;
    }
    if (filter === "resolved") {
      return patients.filter((p) =>
        ["Resolved", "Stable / Monitoring"].includes(p.status)
      ).length;
    }
    return 0;
  };

  return (
    <div className="flex items-center gap-1 mb-6">
      <div className="h-10 flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
            activeFilter === "all"
              ? "bg-slate-100 text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          All ({getCount("all")})
        </button>
        
        <button
          onClick={() => setActiveFilter("ai_outreach")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${
            activeFilter === "ai_outreach"
              ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Activity className="h-4 w-4" />
          AI Outreach ({getCount("ai_outreach")})
        </button>

        <button
          onClick={() => setActiveFilter("needs_action")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${
            activeFilter === "needs_action"
              ? "bg-red-50 text-red-700 shadow-sm border border-red-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Requires Action ({getCount("needs_action")})
        </button>

        <button
          onClick={() => setActiveFilter("in_progress")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
            activeFilter === "in_progress"
              ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          In Progress ({getCount("in_progress")})
        </button>

        <button
          onClick={() => setActiveFilter("resolved")}
          className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
            activeFilter === "resolved"
              ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Resolved / Stable ({getCount("resolved")})
        </button>
      </div>
    </div>
  );
}
