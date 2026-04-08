"use client"

import { useState } from "react"
import { AiRpmTable } from "@/components/ai-rpm-table"

export default function AiRpmPage() {
  const [activeTab, setActiveTab] = useState("nurse")

  const tabs = [
    { id: "nurse", label: "Nurse" },
    { id: "doctor", label: "Doctor" },
    { id: "emergency", label: "Emergency" },
  ]

  return (
    <div className="flex h-screen flex-col bg-[#fcfcfc] text-foreground">
      <div className="flex flex-col flex-1 overflow-hidden bg-[#fafafa]">
        <div className="flex flex-col flex-1 overflow-hidden p-6 pt-8 max-w-[1700px] mx-auto w-full">
          
          <div className="flex items-center gap-1 mb-6">
            <div className="h-10 flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm flex flex-col relative w-full">
            {activeTab === "nurse" && <AiRpmTable />}
            {activeTab === "doctor" && <AiRpmTable />}
            {activeTab === "emergency" && <AiRpmTable />}
          </div>
        </div>
      </div>
    </div>
  )
}
