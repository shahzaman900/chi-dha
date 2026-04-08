"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AiRpmTable() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filters = [
    { id: "all", label: "All" },
    { id: "approval", label: "Approval" },
    { id: "active", label: "Active" },
    { id: "refer", label: "Refer" },
  ]

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Filter Section */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#fcfcfc] border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-500 mr-2">Filter by:</span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeFilter === f.id
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-[#eaf3fd] sticky top-0 z-10 shadow-sm shadow-[#eaf3fd]/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Mr No</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Patient Name</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Triage</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Condition</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Peak</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Approvar</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Actor</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-all text-[13px] text-slate-600">
              <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                No data available for "{filters.find(f => f.id === activeFilter)?.label}"
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
