"use client"

import { usePatientStore } from "@/store/patient-store"
import { Users, FileText, X } from "lucide-react"

export function PhrTabBar() {
  const { openTabs, activeTabId, setActiveTab, closePhrTab } = usePatientStore()

  // Don't show tab bar if no tabs are open (only Patients view)
  if (openTabs.length === 0) return null

  return (
    <div className="flex items-end gap-0 bg-slate-950 px-2 pt-1 border-b border-slate-700 overflow-x-auto">
      {/* Patients Tab - always present */}
      <button
        onClick={() => setActiveTab(null)}
        className={`
          group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg
          transition-all duration-150 border border-b-0 min-w-[120px] shrink-0
          ${activeTabId === null
            ? "bg-slate-800 text-slate-100 border-slate-700"
            : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
          }
        `}
      >
        <Users className="h-3.5 w-3.5" />
        <span>Patients</span>
      </button>

      {/* PHR Tabs */}
      {openTabs.map((tab) => {
        const isActive = activeTabId === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg
              transition-all duration-150 border border-b-0 max-w-[200px] shrink-0
              ${isActive
                ? "bg-slate-800 text-slate-100 border-slate-700"
                : "bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
              }
            `}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span className="truncate">{tab.patientName}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                closePhrTab(tab.id)
              }}
              className={`
                shrink-0 rounded p-0.5 ml-1
                transition-colors duration-100
                ${isActive 
                  ? "hover:bg-slate-600 text-slate-400 hover:text-slate-100" 
                  : "hover:bg-slate-700 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100"
                }
              `}
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
