"use client"

import { usePatientStore } from "@/store/patient-store"
import { Users, FileText, X } from "lucide-react"

export function PhrTabBar() {
  const { openTabs, activeTabId, setActiveTab, closePhrTab } = usePatientStore()

  // Don't show tab bar if no tabs are open (only Patients view)
  if (openTabs.length === 0) return null

  return (
    <div className="flex items-end gap-1 bg-slate-100/80 px-4 pt-2 border-b border-slate-200 overflow-x-auto">
      {/* Patients Tab - always present */}
      <button
        onClick={() => setActiveTab(null)}
        className={`
          group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl
          transition-all duration-150 border min-w-[130px] shrink-0
          ${activeTabId === null
            ? "bg-white text-brand-700 border-slate-200 border-b-white z-10 -mb-[1px] shadow-sm"
            : "bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-200/50"
          }
        `}
      >
        <Users className="h-4 w-4" />
        <span>EWS List</span>
      </button>

      {/* PHR Tabs */}
      {openTabs.map((tab) => {
        const isActive = activeTabId === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl
              transition-all duration-150 border max-w-[220px] shrink-0
              ${isActive
                ? "bg-white text-brand-700 border-slate-200 border-b-white z-10 -mb-[1px] shadow-sm"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-brand-400" />
            <span className="truncate">{tab.patientName}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                closePhrTab(tab.id)
              }}
              className={`
                shrink-0 rounded-full p-1 ml-2
                transition-all duration-150
                ${isActive 
                  ? "hover:bg-slate-100 text-slate-400 hover:text-red-500" 
                  : "hover:bg-slate-300 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                }
              `}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
